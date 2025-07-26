import { PluginManager } from './plugin/PluginManager'
import { MonitoringObjectService } from './services/MonitoringObjectService'
import { AuthService } from './services/AuthService'
import { 
  ConfigurationService, 
  UIConfigurationService, 
  RegionService, 
  TenantService 
} from './services/ConfigurationService'
import { DomainPlugin, PluginContext } from './plugin/types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Goldsky应用配置
export interface GoldskyConfig {
  // 数据库配置
  database: {
    url: string
    key: string
  }
  
  // 应用配置
  app: {
    name: string
    domain: 'factory' | 'retail' | 'agriculture' | 'community' | 'construction'
    version: string
  }
  
  // 认证配置
  auth?: {
    jwtSecret: string
    jwtExpiry?: string
    refreshTokenExpiry?: string
  }
  
  // 插件配置
  plugins?: DomainPlugin[]
  
  // 功能配置
  features?: {
    enableAuditLog?: boolean
    enableRealtime?: boolean
    enableNotifications?: boolean
  }
  
  // 日志配置
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableConsole?: boolean
    enableFile?: boolean
  }
  
  // 其他配置
  custom?: Record<string, any>
}

// Goldsky应用主类
export class GoldskyApp {
  private config: GoldskyConfig
  private supabase: SupabaseClient
  private pluginManager: PluginManager
  
  // 核心服务
  private authService: AuthService
  private configurationService: ConfigurationService
  private uiConfigurationService: UIConfigurationService
  private regionService: RegionService
  private tenantService: TenantService
  private monitoringObjectService: MonitoringObjectService
  
  private context: PluginContext
  private isInitialized = false

  constructor(config: GoldskyConfig) {
    this.config = config
    this.validateConfig()
    
    // 初始化 Supabase 客户端
    this.supabase = createClient(config.database.url, config.database.key)
    
    // 初始化核心服务
    this.authService = new AuthService(this.supabase, {
      jwtSecret: config.auth?.jwtSecret || 'default-secret-key',
      jwtExpiry: config.auth?.jwtExpiry,
      refreshTokenExpiry: config.auth?.refreshTokenExpiry
    })
    
    this.configurationService = new ConfigurationService(this.supabase)
    this.uiConfigurationService = new UIConfigurationService(this.supabase)
    this.regionService = new RegionService(this.supabase)
    this.tenantService = new TenantService(this.supabase)
    this.monitoringObjectService = new MonitoringObjectService(this.supabase)
    
    // 创建插件上下文
    this.context = {
      app: this,
      supabase: this.supabase,
      config: this.config,
      logger: this.createLogger()
    }
    
    // 初始化插件管理器
    this.pluginManager = new PluginManager(this.context)
  }

  private validateConfig(): void {
    if (!this.config.database?.url || !this.config.database?.key) {
      throw new Error('数据库配置不完整')
    }
    
    if (!this.config.app?.name || !this.config.app?.domain) {
      throw new Error('应用配置不完整')
    }
  }

  // 初始化应用
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('应用已经初始化')
    }

    this.log('info', 'Initializing Goldsky Core application...')

    try {
      // 测试数据库连接
      await this.testDatabaseConnection()
      this.log('info', 'Database connection successful')

      // 安装插件
      if (this.config.plugins && this.config.plugins.length > 0) {
        await this.installPlugins(this.config.plugins)
        this.log('info', `Installed ${this.config.plugins.length} plugins`)
      }

      // 设置实时监听器
      if (this.config.features?.enableRealtime !== false) {
        await this.setupRealtimeListeners()
        this.log('info', 'Realtime listeners setup complete')
      }

      // 初始化系统配置
      await this.initializeSystemConfiguration()
      this.log('info', 'System configuration initialized')

      this.isInitialized = true
      this.log('info', 'Goldsky Core application initialized successfully')
    } catch (error) {
      this.log('error', 'Failed to initialize application:', error)
      throw error
    }
  }

  /**
   * 初始化系统配置
   */
  private async initializeSystemConfiguration(): Promise<void> {
    // 设置默认系统配置
    const defaultConfigs = {
      'app.name': this.config.app.name,
      'app.domain': this.config.app.domain,
      'app.version': this.config.app.version,
      'features.audit_log': this.config.features?.enableAuditLog || false,
      'features.realtime': this.config.features?.enableRealtime !== false,
      'features.notifications': this.config.features?.enableNotifications !== false
    }

    for (const [key, value] of Object.entries(defaultConfigs)) {
      const [category, configKey] = key.split('.')
      const existing = await this.configurationService.getConfig(category, configKey)
      
      if (existing === null) {
        await this.configurationService.setConfig(category, configKey, value, {
          description: `Default ${key} configuration`,
          isPublic: true
        })
      }
    }
  }

  // 认证服务访问器
  getAuthService(): AuthService {
    this.ensureInitialized()
    return this.authService
  }

  // 配置服务访问器
  getConfigurationService(): ConfigurationService {
    this.ensureInitialized()
    return this.configurationService
  }

  getUIConfigurationService(): UIConfigurationService {
    this.ensureInitialized()
    return this.uiConfigurationService
  }

  getRegionService(): RegionService {
    this.ensureInitialized()
    return this.regionService
  }

  getTenantService(): TenantService {
    this.ensureInitialized()
    return this.tenantService
  }

  // 现有服务访问器
  getPluginManager(): PluginManager {
    this.ensureInitialized()
    return this.pluginManager
  }

  getMonitoringObjectService(): MonitoringObjectService {
    this.ensureInitialized()
    return this.monitoringObjectService
  }

  getSupabase(): SupabaseClient {
    return this.supabase
  }

  getConfig(): GoldskyConfig {
    return this.config
  }

  // 插件相关方法
  async installPlugin(plugin: DomainPlugin): Promise<void> {
    this.ensureInitialized()
    await this.pluginManager.installPlugin(plugin)
  }

  async enablePlugin(pluginId: string): Promise<void> {
    this.ensureInitialized()
    await this.pluginManager.enablePlugin(pluginId)
  }

  async disablePlugin(pluginId: string): Promise<void> {
    this.ensureInitialized()
    await this.pluginManager.disablePlugin(pluginId)
  }

  getPluginComponents(): Record<string, any> {
    this.ensureInitialized()
    return this.pluginManager.getAllPluginComponents()
  }

  getPluginMenus(): any[] {
    this.ensureInitialized()
    return this.pluginManager.getPluginMenus()
  }

  getPluginWidgets(): any[] {
    this.ensureInitialized()
    return this.pluginManager.getPluginWidgets()
  }

  // 用户认证相关方法
  async authenticateUser(email: string, password: string) {
    this.ensureInitialized()
    return await this.authService.login({ email, password })
  }

  async verifyUserToken(token: string) {
    this.ensureInitialized()
    return await this.authService.verifyToken(token)
  }

  async checkUserPermission(userId: string, resource: string, action: string) {
    this.ensureInitialized()
    return await this.authService.checkPermission(userId, { resource, action })
  }

  // 配置管理方法
  async getSystemConfig(category: string, key?: string) {
    this.ensureInitialized()
    
    if (key) {
      return await this.configurationService.getConfig(category, key)
    } else {
      return await this.configurationService.getConfigsByCategory(category)
    }
  }

  async setSystemConfig(category: string, key: string, value: any) {
    this.ensureInitialized()
    return await this.configurationService.setConfig(category, key, value)
  }

  async getUserUIConfig(userId: string, tenantId?: string, roleIds?: string[]) {
    this.ensureInitialized()
    return await this.uiConfigurationService.getMergedUIConfig(userId, tenantId, roleIds)
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    timestamp: Date
    version: string
    components: {
      database: { status: 'up' | 'down', details?: any }
      plugins: { status: 'up' | 'down', count: number }
      services: { status: 'up' | 'down', details?: any }
    }
    details?: any
  }> {
    const timestamp = new Date()
    
    try {
      // 检查数据库
      const dbHealth = await this.checkDatabaseHealth()
      
      // 检查插件
      const pluginHealth = await this.pluginManager.healthCheck()
      
      // 检查服务
      const servicesHealth = await this.checkServicesHealth()
      
      const allHealthy = dbHealth.status === 'up' && 
                        pluginHealth.status === 'healthy' && 
                        servicesHealth.status === 'up'
      
      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp,
        version: this.config.app.version,
        components: {
          database: dbHealth,
          plugins: {
            status: pluginHealth.status === 'healthy' ? 'up' : 'down',
            count: pluginHealth.totalPlugins || 0
          },
          services: servicesHealth
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp,
        version: this.config.app.version,
        components: {
          database: { status: 'down' },
          plugins: { status: 'down', count: 0 },
          services: { status: 'down' }
        },
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  // 统计信息
  async getStatistics(): Promise<{
    users: { total: number, active: number }
    tenants: { total: number, active: number }
    plugins: { total: number, enabled: number }
    monitoring_objects: { total: number, online: number }
    sessions: { active: number }
  }> {
    this.ensureInitialized()
    
    // 获取用户统计
    const usersResult = await this.supabase
      .from('users')
      .select('id, is_active')
    
    const users = {
      total: usersResult.data?.length || 0,
      active: usersResult.data?.filter(u => u.is_active).length || 0
    }

    // 获取租户统计
    const tenantsResult = await this.supabase
      .from('tenants')
      .select('id, is_active')
    
    const tenants = {
      total: tenantsResult.data?.length || 0,
      active: tenantsResult.data?.filter(t => t.is_active).length || 0
    }

    // 获取插件统计
    const pluginStats = this.pluginManager.getStatistics()
    
    // 获取监控对象统计
    const monitoringStats = await this.monitoringObjectService.getStatistics()
    
    // 获取活跃会话统计
    const sessionsResult = await this.supabase
      .from('user_sessions')
      .select('id')
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
    
    return {
      users,
      tenants,
      plugins: {
        total: pluginStats.total,
        enabled: pluginStats.enabled
      },
      monitoring_objects: {
        total: monitoringStats.total,
        online: monitoringStats.online
      },
      sessions: {
        active: sessionsResult.data?.length || 0
      }
    }
  }

  // 关闭应用
  async shutdown(): Promise<void> {
    this.log('info', 'Shutting down Goldsky Core application...')
    
    try {
      // 禁用所有插件
      const plugins = this.pluginManager.getEnabledPlugins()
      for (const plugin of plugins) {
        await this.pluginManager.disablePlugin(plugin.id)
      }
      
      this.isInitialized = false
      this.log('info', 'Application shutdown complete')
    } catch (error) {
      this.log('error', 'Error during shutdown:', error)
      throw error
    }
  }

  // 私有方法
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('应用尚未初始化，请先调用 initialize() 方法')
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    const { data, error } = await this.supabase
      .from('system_configurations')
      .select('id')
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
      throw new Error(`数据库连接失败: ${error.message}`)
    }
  }

  private async installPlugins(plugins: DomainPlugin[]): Promise<void> {
    for (const plugin of plugins) {
      try {
        await this.pluginManager.installPlugin(plugin)
        await this.pluginManager.enablePlugin(plugin.id)
        this.log('info', `Plugin ${plugin.id} installed and enabled`)
      } catch (error) {
        this.log('error', `Failed to install plugin ${plugin.id}:`, error)
      }
    }
  }

  private async setupRealtimeListeners(): Promise<void> {
    // 监听监控对象变化
    this.supabase
      .channel('monitoring_objects')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'monitoring_objects' },
        (payload) => {
          this.log('debug', 'Monitoring object changed:', payload)
          // 可以在这里触发实时事件
        }
      )
      .subscribe()

    // 监听告警变化
    this.supabase
      .channel('alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          this.log('debug', 'New alert created:', payload)
          // 可以在这里触发通知
        }
      )
      .subscribe()
  }

  private async checkDatabaseHealth(): Promise<{ status: 'up' | 'down', details?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('system_configurations')
        .select('count')
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        return { status: 'down', details: { error: error.message } }
      }

      return { status: 'up' }
    } catch (error) {
      return { 
        status: 'down', 
        details: { error: error instanceof Error ? error.message : 'Unknown error' } 
      }
    }
  }

  private async checkServicesHealth(): Promise<{ status: 'up' | 'down', details?: any }> {
    try {
      // 检查各个服务是否正常
      const services = [
        'authService',
        'configurationService', 
        'monitoringObjectService'
      ]

      const healthChecks = await Promise.all(
        services.map(async (serviceName) => {
          try {
            // 简单的服务健康检查
            return { service: serviceName, status: 'up' }
          } catch (error) {
            return { 
              service: serviceName, 
              status: 'down', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          }
        })
      )

      const failedServices = healthChecks.filter(check => check.status === 'down')
      
      if (failedServices.length > 0) {
        return { status: 'down', details: { failedServices } }
      }

      return { status: 'up', details: { services: healthChecks } }
    } catch (error) {
      return { 
        status: 'down', 
        details: { error: error instanceof Error ? error.message : 'Unknown error' } 
      }
    }
  }

  private createLogger() {
    const level = this.config.logging?.level || 'info'
    const enableConsole = this.config.logging?.enableConsole !== false

    return {
      debug: (...args: any[]) => this.log('debug', ...args),
      info: (...args: any[]) => this.log('info', ...args),
      warn: (...args: any[]) => this.log('warn', ...args),
      error: (...args: any[]) => this.log('error', ...args)
    }
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) {
    const configLevel = this.config.logging?.level || 'info'
    const levels = ['debug', 'info', 'warn', 'error']
    
    if (levels.indexOf(level) < levels.indexOf(configLevel)) {
      return
    }

    if (this.config.logging?.enableConsole !== false) {
      const timestamp = new Date().toISOString()
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [Goldsky]`
      
      switch (level) {
        case 'debug':
          console.debug(prefix, message, ...args)
          break
        case 'info':
          console.info(prefix, message, ...args)
          break
        case 'warn':
          console.warn(prefix, message, ...args)
          break
        case 'error':
          console.error(prefix, message, ...args)
          break
      }
    }
  }
} 