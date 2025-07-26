import { 
  SystemConfiguration, 
  UIConfiguration, 
  UIComponent, 
  UILayout,
  Region,
  Tenant 
} from '../types/base'
import { BaseEntityService } from './BaseEntityService'
import { SupabaseClient } from '@supabase/supabase-js'

export interface ConfigurationFilter {
  category?: string
  scope?: string
  tenant_id?: string
  is_active?: boolean
}

export class ConfigurationService {
  protected supabase: SupabaseClient
  private tableName = 'system_configurations'

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  private transformFromDB(dbEntity: any): SystemConfiguration {
    return {
      id: dbEntity.id,
      category: dbEntity.category,
      key: dbEntity.key,
      value: this.parseConfigValue(dbEntity.value, dbEntity.data_type),
      data_type: dbEntity.data_type,
      description: dbEntity.description,
      is_encrypted: dbEntity.is_encrypted || false,
      is_public: dbEntity.is_public || false,
      validation_rules: dbEntity.validation_rules,
      created_at: new Date(dbEntity.created_at),
      updated_at: new Date(dbEntity.updated_at)
    }
  }

  private transformToDB(entity: Partial<SystemConfiguration>): any {
    return {
      id: entity.id,
      category: entity.category,
      key: entity.key,
      value: this.stringifyConfigValue(entity.value, entity.data_type),
      data_type: entity.data_type,
      description: entity.description,
      is_encrypted: entity.is_encrypted,
      is_public: entity.is_public,
      validation_rules: entity.validation_rules
    }
  }

  /**
   * 解析配置值
   */
  private parseConfigValue(value: string, dataType: string): any {
    if (!value) return null

    switch (dataType) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === 'true'
      case 'json':
      case 'array':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      default:
        return value
    }
  }

  /**
   * 序列化配置值
   */
  private stringifyConfigValue(value: any, dataType?: string): string {
    if (value === null || value === undefined) return ''

    switch (dataType) {
      case 'json':
      case 'array':
        return JSON.stringify(value)
      default:
        return String(value)
    }
  }

  /**
   * 获取配置值
   */
  async getConfig(category: string, key: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category)
      .eq('key', key)
      .single()

    if (error || !data) {
      return null
    }

    return this.parseConfigValue(data.value, data.data_type)
  }

  /**
   * 设置配置值
   */
  async setConfig(
    category: string, 
    key: string, 
    value: any, 
    options?: {
      dataType?: 'string' | 'number' | 'boolean' | 'json' | 'array'
      description?: string
      isPublic?: boolean
      validationRules?: Record<string, any>
    }
  ): Promise<SystemConfiguration> {
    const dataType = options?.dataType || this.inferDataType(value)
    const stringValue = this.stringifyConfigValue(value, dataType)

    const configData = {
      category,
      key,
      value: stringValue,
      data_type: dataType as 'string' | 'number' | 'boolean' | 'json' | 'array',
      description: options?.description,
      is_public: options?.isPublic || false,
      validation_rules: options?.validationRules
    }

    // 尝试更新现有配置
    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('category', category)
      .eq('key', key)
      .single()

    if (existing) {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(configData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error(`更新配置失败: ${error.message}`)
      }

      return this.transformFromDB(data)
    } else {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([configData])
        .select()
        .single()

      if (error) {
        throw new Error(`创建配置失败: ${error.message}`)
      }

      return this.transformFromDB(data)
    }
  }

  /**
   * 推断数据类型
   */
  private inferDataType(value: any): 'string' | 'number' | 'boolean' | 'json' | 'array' {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object' && value !== null) return 'json'
    return 'string'
  }

  /**
   * 获取分类下的所有配置
   */
  async getConfigsByCategory(category: string): Promise<Record<string, any>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category)

    if (error) {
      throw new Error(`获取配置失败: ${error.message}`)
    }

    const configs: Record<string, any> = {}
    for (const item of data || []) {
      configs[item.key] = this.parseConfigValue(item.value, item.data_type)
    }

    return configs
  }

  /**
   * 批量设置配置
   */
  async setConfigs(
    category: string, 
    configs: Record<string, any>
  ): Promise<void> {
    const promises = Object.entries(configs).map(([key, value]) =>
      this.setConfig(category, key, value)
    )

    await Promise.all(promises)
  }
}

/**
 * UI配置服务
 */
export class UIConfigurationService {
  protected supabase: SupabaseClient
  private tableName = 'ui_configurations'

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  private transformFromDB(dbEntity: any): UIConfiguration {
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      type: dbEntity.type,
      target_id: dbEntity.target_id,
      scope: dbEntity.scope,
      config: dbEntity.config,
      is_active: dbEntity.is_active,
      priority: dbEntity.priority,
      created_at: new Date(dbEntity.created_at),
      updated_at: new Date(dbEntity.updated_at)
    }
  }

  /**
   * 获取UI配置
   */
  async getUIConfig(
    type: 'global' | 'tenant' | 'user' | 'role',
    targetId?: string,
    scope?: string
  ): Promise<UIConfiguration[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (targetId) {
      query = query.eq('target_id', targetId)
    }

    if (scope) {
      query = query.eq('scope', scope)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`获取UI配置失败: ${error.message}`)
    }

    return data?.map(item => this.transformFromDB(item)) || []
  }

  /**
   * 合并UI配置
   */
  async getMergedUIConfig(
    userId: string,
    tenantId?: string,
    roleIds?: string[]
  ): Promise<Record<string, any>> {
    const configs: UIConfiguration[] = []

    // 获取全局配置
    const globalConfigs = await this.getUIConfig('global')
    configs.push(...globalConfigs)

    // 获取租户配置
    if (tenantId) {
      const tenantConfigs = await this.getUIConfig('tenant', tenantId)
      configs.push(...tenantConfigs)
    }

    // 获取角色配置
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        const roleConfigs = await this.getUIConfig('role', roleId)
        configs.push(...roleConfigs)
      }
    }

    // 获取用户配置
    const userConfigs = await this.getUIConfig('user', userId)
    configs.push(...userConfigs)

    // 按优先级排序并合并配置
    configs.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    const mergedConfig: Record<string, any> = {}
    for (const config of configs) {
      this.deepMerge(mergedConfig, config.config)
    }

    return mergedConfig
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        this.deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
    return target
  }
}

/**
 * 地区配置服务
 */
export class RegionService {
  protected supabase: SupabaseClient
  private tableName = 'regions'

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  private transformFromDB(dbEntity: any): Region {
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      code: dbEntity.code,
      parent_region_id: dbEntity.parent_region_id,
      level: dbEntity.level,
      timezone: dbEntity.timezone,
      locale: dbEntity.locale,
      currency: dbEntity.currency,
      coordinates: dbEntity.coordinates,
      metadata: dbEntity.metadata || {},
      is_active: dbEntity.is_active,
      created_at: new Date(dbEntity.created_at),
      updated_at: new Date(dbEntity.updated_at)
    }
  }

  /**
   * 根据ID获取地区
   */
  async findById(id: string): Promise<Region | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return this.transformFromDB(data)
  }

  /**
   * 获取地区树
   */
  async getRegionTree(parentId?: string): Promise<Region[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('parent_region_id', parentId || null)
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new Error(`获取地区树失败: ${error.message}`)
    }

    const regions = data?.map(item => this.transformFromDB(item)) || []

    // 递归获取子地区
    for (const region of regions) {
      const children = await this.getRegionTree(region.id)
      if (children.length > 0) {
        (region as any).children = children
      }
    }

    return regions
  }

  /**
   * 根据代码获取地区
   */
  async getRegionByCode(code: string): Promise<Region | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return this.transformFromDB(data)
  }

  /**
   * 获取地区路径
   */
  async getRegionPath(regionId: string): Promise<Region[]> {
    const path: Region[] = []
    let currentId: string | undefined = regionId

    while (currentId) {
      const region = await this.findById(currentId)
      if (!region) break

      path.unshift(region)
      currentId = region.parent_region_id
    }

    return path
  }
}

/**
 * 租户服务
 */
export class TenantService extends BaseEntityService<Tenant> {
  constructor(supabaseClient: SupabaseClient) {
    super(supabaseClient, 'tenants')
  }

  transformFromDB(dbEntity: any): Tenant {
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      description: dbEntity.description,
      type: dbEntity.type || 'tenant',
      category: dbEntity.category || 'organization',
      status: dbEntity.status,
      metadata: dbEntity.metadata || {},
      tenant_id: dbEntity.tenant_id,
      tags: dbEntity.tags || [],
      created_at: new Date(dbEntity.created_at),
      updated_at: new Date(dbEntity.updated_at),
      slug: dbEntity.slug,
      domain: dbEntity.domain,
      logo_url: dbEntity.logo_url,
      plan: dbEntity.plan,
      settings: dbEntity.settings,
      billing_info: dbEntity.billing_info,
      region_id: dbEntity.region_id,
      owner_id: dbEntity.owner_id,
      is_active: dbEntity.is_active,
      trial_ends_at: dbEntity.trial_ends_at ? new Date(dbEntity.trial_ends_at) : undefined
    }
  }

  transformToDB(entity: Partial<Tenant>): any {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      category: entity.category,
      status: entity.status,
      metadata: entity.metadata,
      tenant_id: entity.tenant_id,
      tags: entity.tags,
      slug: entity.slug,
      domain: entity.domain,
      logo_url: entity.logo_url,
      plan: entity.plan,
      settings: entity.settings,
      billing_info: entity.billing_info,
      region_id: entity.region_id,
      owner_id: entity.owner_id,
      is_active: entity.is_active,
      trial_ends_at: entity.trial_ends_at?.toISOString()
    }
  }

  /**
   * 根据域名获取租户
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('domain', domain)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return this.transformFromDB(data)
  }

  /**
   * 根据slug获取租户
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return this.transformFromDB(data)
  }

  /**
   * 检查域名是否可用
   */
  async isDomainAvailable(domain: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(this.tableName)
      .select('id')
      .eq('domain', domain)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query.single()
    return !data
  }

  /**
   * 检查slug是否可用
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(this.tableName)
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query.single()
    return !data
  }

  /**
   * 获取用户的租户列表
   */
  async getUserTenants(userId: string): Promise<Tenant[]> {
    const { data, error } = await this.supabase
      .from('tenant_memberships')
      .select(`
        tenant:tenants(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      throw new Error(`获取用户租户列表失败: ${error.message}`)
    }

    return data?.map(item => this.transformFromDB(item.tenant)) || []
  }
} 