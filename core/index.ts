// 🌟 Goldsky Core Platform
// Universal Smart Application Development Framework

// 主应用类
export { GoldskyApp, type GoldskyConfig } from './GoldskyApp'

// 核心类型
export * from './types/base'

// 插件系统
export * from './plugin/types'
export { PluginManager } from './plugin/PluginManager'

// 核心服务
export { BaseEntityService, type QueryFilter, type QueryOptions } from './services/BaseEntityService'
export { MonitoringObjectService } from './services/MonitoringObjectService'
export { AuthService, type LoginCredentials, type LoginResult, type PermissionCheckOptions } from './services/AuthService'
export { 
  ConfigurationService, 
  UIConfigurationService, 
  RegionService, 
  TenantService,
  type ConfigurationFilter 
} from './services/ConfigurationService'

// 插件示例
export { FactoryPlugin } from '../plugins/factory/FactoryPlugin'

// 版本信息
export const GOLDSKY_VERSION = '1.0.0'
export const GOLDSKY_CORE_VERSION = '1.0.0'

// 默认配置
export const DEFAULT_CONFIG = {
  logging: {
    level: 'info' as const,
    enableConsole: true,
    enableFile: false
  },
  features: {
    enableAuditLog: true,
    enableRealtime: true,
    enableNotifications: true
  },
  auth: {
    jwtExpiry: '24h',
    refreshTokenExpiry: '7d'
  }
} 