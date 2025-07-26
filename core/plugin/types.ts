import * as React from 'react'
import { BaseEntity } from '../types/base'

// 领域类型
export type Domain = 'factory' | 'retail' | 'agriculture' | 'community' | 'construction'

// 实体类型定义
export interface EntityTypeDefinition {
  extends: 'BaseEntity' | 'MonitoringObject' | 'Space' | 'ProcessInstance'
  category: string
  specificFields: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json'>
  validation?: Record<string, any>
  permissions?: string[]
}

// 模型定义
export interface ModelDefinition {
  tableName: string
  fields: Record<string, {
    type: string
    nullable?: boolean
    unique?: boolean
    default?: any
    references?: string
  }>
  indexes?: Array<{
    fields: string[]
    unique?: boolean
    name?: string
  }>
}

// 路由定义
export interface RouteDefinition {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  handler: string
  middleware?: string[]
  permissions?: string[]
  rateLimit?: {
    requests: number
    window: number // 时间窗口(秒)
  }
}

// 服务定义
export interface ServiceDefinition {
  name: string
  dependencies?: string[]
  singleton?: boolean
  factory: (...args: any[]) => any
}

// 组件注册信息
export interface ComponentRegistration {
  name: string
  component: any // React component type
  props?: Record<string, any>
  permissions?: string[]
  category?: 'layout' | 'data' | 'form' | 'chart' | 'custom'
}

// 菜单项定义
export interface MenuItemDefinition {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItemDefinition[]
  permissions?: string[]
  order?: number
  badge?: {
    count?: number
    color?: string
  }
}

// 仪表板小部件定义
export interface WidgetDefinition {
  id: string
  name: string
  description?: string
  component: any // React component type
  defaultProps?: Record<string, any>
  configSchema?: Record<string, any>
  size: {
    minWidth: number
    minHeight: number
    defaultWidth: number
    defaultHeight: number
  }
  category: string
  permissions?: string[]
}

// 事件处理器定义
export interface EventHandlerDefinition {
  event: string
  handler: (data: any, context: any) => Promise<void> | void
  priority?: number
}

// 插件钩子定义
export interface PluginHook {
  name: string
  description?: string
  handler: (...args: any[]) => any
}

// 插件配置
export interface PluginConfig {
  // 数据库配置
  database?: {
    migrations?: string[]
    seeders?: string[]
  }
  
  // API配置
  api?: {
    prefix?: string
    version?: string
  }
  
  // UI配置
  ui?: {
    theme?: Record<string, any>
    assets?: string[]
  }
  
  // 功能开关
  features?: Record<string, boolean>
  
  // 自定义配置
  custom?: Record<string, any>
}

// 插件生命周期钩子
export interface PluginLifecycleHooks {
  beforeInstall?: () => Promise<void> | void
  afterInstall?: () => Promise<void> | void
  beforeEnable?: () => Promise<void> | void
  afterEnable?: () => Promise<void> | void
  beforeDisable?: () => Promise<void> | void
  afterDisable?: () => Promise<void> | void
  beforeUninstall?: () => Promise<void> | void
  afterUninstall?: () => Promise<void> | void
}

// 主插件接口
export interface DomainPlugin {
  // 基本信息
  id: string
  name: string
  version: string
  description?: string
  domain: Domain
  author?: string
  homepage?: string
  
  // 依赖关系
  dependencies?: Array<{
    id: string
    version: string
    optional?: boolean
  }>
  peerDependencies?: Array<{
    id: string
    version: string
  }>
  
  // 核心定义
  entityTypes?: Record<string, EntityTypeDefinition>
  components?: Record<string, ComponentRegistration>
  apiRoutes?: RouteDefinition[]
  dataModels?: Record<string, ModelDefinition>
  services?: Record<string, ServiceDefinition>
  
  // UI扩展
  menus?: MenuItemDefinition[]
  widgets?: WidgetDefinition[]
  themes?: Record<string, any>
  
  // 事件和钩子
  eventHandlers?: EventHandlerDefinition[]
  hooks?: Record<string, PluginHook>
  
  // 配置
  config?: PluginConfig
  defaultConfig?: Record<string, any>
  
  // 生命周期
  lifecycle?: PluginLifecycleHooks
  
  // 插件方法
  initialize(): Promise<void>
  cleanup(): Promise<void>
  
  // 配置管理
  getConfig?(): PluginConfig
  setConfig?(config: Partial<PluginConfig>): void
  
  // 健康检查
  healthCheck?(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    message?: string
    details?: Record<string, any>
  }>
}

// 插件注册表条目
export interface PluginRegistryEntry {
  plugin: DomainPlugin
  status: 'installed' | 'enabled' | 'disabled' | 'error'
  installedAt: Date
  enabledAt?: Date
  disabledAt?: Date
  errorMessage?: string
  config?: PluginConfig
}

// 插件管理器事件
export interface PluginManagerEvents {
  'plugin:installing': (pluginId: string) => void
  'plugin:installed': (pluginId: string) => void
  'plugin:enabling': (pluginId: string) => void
  'plugin:enabled': (pluginId: string) => void
  'plugin:disabling': (pluginId: string) => void
  'plugin:disabled': (pluginId: string) => void
  'plugin:uninstalling': (pluginId: string) => void
  'plugin:uninstalled': (pluginId: string) => void
  'plugin:error': (pluginId: string, error: Error) => void
}

// 插件上下文
export interface PluginContext {
  // 核心服务
  supabase: any
  logger: any
  config: any
  
  // 其他插件访问
  plugins: Map<string, DomainPlugin>
  
  // 用户上下文
  user?: any
  tenant?: any
  
  // 请求上下文
  request?: any
  response?: any
} 