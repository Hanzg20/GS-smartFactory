import { BaseEntity, EntityStatus } from '../types/base'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 查询过滤器
export interface QueryFilter {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is'
  value: any
}

// 查询选项
export interface QueryOptions {
  filters?: QueryFilter[]
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
  select?: string
}

// 基础实体服务抽象类
export abstract class BaseEntityService<T extends BaseEntity> {
  protected supabase: SupabaseClient
  protected tableName: string

  constructor(supabaseClient: SupabaseClient, tableName: string) {
    this.supabase = supabaseClient
    this.tableName = tableName
  }

  // 抽象方法 - 子类必须实现
  abstract transformFromDB(dbEntity: any): T
  abstract transformToDB(entity: Partial<T>): any

  // 创建实体
  async create(entity: Partial<T>): Promise<T> {
    const dbEntity = this.transformToDB(entity)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(dbEntity)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`)
    }

    return this.transformFromDB(data)
  }

  // 根据ID查找
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 记录不存在
      }
      throw new Error(`Failed to find ${this.tableName} by id: ${error.message}`)
    }

    return this.transformFromDB(data)
  }

  // 查找所有
  async findAll(options?: QueryOptions): Promise<T[]> {
    // 添加选择字段
    let query = this.supabase.from(this.tableName).select(options?.select || '*')

    // 添加过滤条件
    if (options?.filters) {
      options.filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.field, filter.value)
            break
          case 'neq':
            query = query.neq(filter.field, filter.value)
            break
          case 'gt':
            query = query.gt(filter.field, filter.value)
            break
          case 'gte':
            query = query.gte(filter.field, filter.value)
            break
          case 'lt':
            query = query.lt(filter.field, filter.value)
            break
          case 'lte':
            query = query.lte(filter.field, filter.value)
            break
          case 'like':
            query = query.like(filter.field, filter.value)
            break
          case 'ilike':
            query = query.ilike(filter.field, filter.value)
            break
          case 'in':
            query = query.in(filter.field, filter.value)
            break
          case 'is':
            query = query.is(filter.field, filter.value)
            break
        }
      })
    }

    // 添加排序
    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.orderDirection !== 'desc' 
      })
    }

    // 添加限制和偏移
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`)
    }

    return data ? data.map(item => this.transformFromDB(item)) : []
  }

  // 更新实体
  async update(id: string, updates: Partial<T>): Promise<T> {
    const dbUpdates = this.transformToDB(updates)
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`)
    }

    return this.transformFromDB(data)
  }

  // 删除实体
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`)
    }

    return true
  }

  // 通用查询方法
  async findByType(type: string): Promise<T[]> {
    return this.findAll({
      filters: [{ field: 'type', operator: 'eq', value: type }]
    })
  }

  async findByCategory(category: string): Promise<T[]> {
    return this.findAll({
      filters: [{ field: 'category', operator: 'eq', value: category }]
    })
  }

  async findByTenant(tenantId: string): Promise<T[]> {
    return this.findAll({
      filters: [{ field: 'tenant_id', operator: 'eq', value: tenantId }]
    })
  }

  async findByStatus(status: EntityStatus): Promise<T[]> {
    return this.findAll({
      filters: [{ field: 'status', operator: 'eq', value: status }]
    })
  }

  // 批量操作
  async createMany(entities: Partial<T>[]): Promise<T[]> {
    const dbEntities = entities.map(entity => this.transformToDB(entity))
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(dbEntities)
      .select()

    if (error) {
      throw new Error(`Failed to create multiple ${this.tableName}: ${error.message}`)
    }

    return data ? data.map(item => this.transformFromDB(item)) : []
  }

  async updateMany(filters: QueryFilter[], updates: Partial<T>): Promise<T[]> {
    let query = this.supabase
      .from(this.tableName)
      .update({
        ...this.transformToDB(updates),
        updated_at: new Date().toISOString()
      })

    // 应用过滤条件
    filters.forEach(filter => {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.field, filter.value)
          break
        case 'in':
          query = query.in(filter.field, filter.value)
          break
        // 可以根据需要添加更多操作符
      }
    })

    const { data, error } = await query.select()

    if (error) {
      throw new Error(`Failed to update multiple ${this.tableName}: ${error.message}`)
    }

    return data ? data.map(item => this.transformFromDB(item)) : []
  }

  // 计数查询
  async count(filters?: QueryFilter[]): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })

    // 应用过滤条件
    if (filters) {
      filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.field, filter.value)
            break
          // 可以根据需要添加更多操作符
        }
      })
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`)
    }

    return count || 0
  }

  // 检查实体是否存在
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id)
    return entity !== null
  }

  // 软删除 (将状态设为inactive)
  async softDelete(id: string): Promise<T> {
    return this.update(id, { 
      status: EntityStatus.INACTIVE 
    } as Partial<T>)
  }

  // 恢复软删除的实体
  async restore(id: string): Promise<T> {
    return this.update(id, { 
      status: EntityStatus.ACTIVE 
    } as Partial<T>)
  }
} 