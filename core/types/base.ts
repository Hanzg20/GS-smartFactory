// 核心实体状态枚举
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  OFFLINE = 'offline',
  PENDING = 'pending'
}

// 3D位置信息
export interface Position3D {
  x: number
  y: number
  z?: number
  rotation?: number
  rotation_x?: number
  rotation_y?: number
  rotation_z?: number
}

// 空间尺寸
export interface SpaceDimensions {
  width: number
  height: number
  depth?: number
  unit?: 'mm' | 'cm' | 'm' | 'km'
}

// 基础实体接口
export interface BaseEntity {
  id: string
  name: string
  description?: string
  type: string
  category: string        // 分类: device, space, process, user, etc.
  status: EntityStatus
  metadata: Record<string, any>
  position?: Position3D
  tags: string[]
  created_at: Date
  updated_at: Date
  tenant_id: string      // 多租户支持
}

// 监控对象 (从设备Device抽象而来)
export interface MonitoringObject extends BaseEntity {
  // 通用字段，适用于所有领域
  specifications: Record<string, any>    // 规格参数
  real_time_data: Record<string, any>    // 实时数据
  parameters: Record<string, any>        // 运行参数
  maintenance_info: Record<string, any>  // 维护信息
  
  // 工厂: CNC机床、机器人、检测设备
  // 店铺: POS机、冰箱、摄像头、空调
  // 农业: 温湿度传感器、灌溉系统、无人机
  // 社区: 门禁、路灯、垃圾桶、充电桩
  // 建筑: 电梯、消防系统、通风设备
  
  // 扩展字段支持
  settings?: Record<string, any>
  image_url?: string
  model_3d_url?: string
  manufacturer?: string
  model?: string
  serial_number?: string
  installation_date?: Date
  warranty_expiry?: Date
}

// 空间 (从车间Workshop抽象而来)
export interface Space extends BaseEntity {
  parent_space_id?: string
  space_type: string
  dimensions: SpaceDimensions
  floor_plan_url?: string
  monitoring_objects?: MonitoringObject[]
  
  // 工厂: 车间、产线
  // 店铺: 门店、仓库、收银区
  // 农业: 大棚、田块、养殖场
  // 社区: 小区、楼栋、单元
  // 建筑: 楼层、房间、区域
  
  // 扩展字段
  capacity?: number
  environment_conditions?: Record<string, any>
  access_control?: Record<string, any>
}

// 流程阶段
export interface ProcessStage {
  id: string
  name: string
  description?: string
  order: number
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'failed'
  start_time?: Date
  end_time?: Date
  assignee?: string
  data?: Record<string, any>
}

// 流程实例 (从生产订单ProductionOrder抽象而来)
export interface ProcessInstance extends BaseEntity {
  process_template_id: string
  current_stage: string
  stages: ProcessStage[]
  participants: string[]
  start_time: Date
  end_time?: Date
  progress: number
  
  // 工厂: 生产订单、维护任务
  // 店铺: 销售订单、库存调配
  // 农业: 种植计划、收割任务
  // 社区: 维修工单、活动安排
  // 建筑: 施工任务、检查流程
  
  // 扩展字段
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  budget?: number
  resources?: string[]
}

// 用户配置文件
export interface UserProfile {
  first_name?: string
  last_name?: string
  avatar_url?: string
  phone?: string
  department?: string
  position?: string
  timezone?: string
  language?: string
}

// 用户偏好设置
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto'
  notifications?: {
    email: boolean
    push: boolean
    sms: boolean
  }
  dashboard_layout?: Record<string, any>
  default_filters?: Record<string, any>
}

// 租户成员关系
export interface TenantMembership {
  tenant_id: string
  role_id: string
  joined_at: Date
  is_active: boolean
}

// 用户实体
export interface User extends BaseEntity {
  email: string
  profile: UserProfile
  preferences: UserPreferences
  roles: Role[]
  tenants: TenantMembership[]
}

// 权限定义
export interface Permission {
  id: string
  name: string
  resource: string      // 资源类型
  action: string        // 操作类型：create, read, update, delete, execute
  conditions?: Record<string, any>  // 条件约束
}

// 角色定义
export interface Role {
  id: string
  name: string
  domain?: string       // 领域特定角色
  permissions: Permission[]
  is_system_role?: boolean
}

// 报警/通知
export interface Alert {
  id: string
  monitoring_object_id: string
  space_id?: string
  type: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  created_at: Date
  acknowledged_at?: Date
  acknowledged_by?: string
  resolved_at?: Date
  resolved_by?: string
  metadata?: Record<string, any>
}

// 通知渠道
export type NotificationChannel = 'email' | 'push' | 'sms' | 'webhook' | 'in_app'

// 通知定义
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high'
  data?: Record<string, any>
  expires_at?: Date
} 

// 地区配置相关类型
export interface Region {
  id: string
  name: string
  code: string
  parent_region_id?: string
  level: 'country' | 'province' | 'city' | 'district' | 'custom'
  timezone: string
  locale: string
  currency: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  metadata: Record<string, any>
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// 权限相关类型
export interface CorePermission {
  id: string
  name: string
  code: string
  description?: string
  resource: string
  action: string
  conditions?: Record<string, any>
  is_system: boolean
  created_at: Date
  updated_at: Date
}

export interface CoreRole {
  id: string
  name: string
  code: string
  description?: string
  level: number
  permissions: CorePermission[]
  is_system: boolean
  tenant_id?: string
  region_id?: string
  created_at: Date
  updated_at: Date
}

// 用户扩展信息
export interface CoreUserProfile {
  id: string
  user_id: string
  avatar_url?: string
  phone?: string
  department?: string
  position?: string
  employee_id?: string
  hire_date?: Date
  manager_id?: string
  work_location?: string
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  preferences: CoreUserPreferences
  created_at: Date
  updated_at: Date
}

export interface CoreUserPreferences {
  language: string
  timezone: string
  theme: 'light' | 'dark' | 'auto'
  date_format: string
  time_format: '12h' | '24h'
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    in_app: boolean
  }
  dashboard_layout?: Record<string, any>
  custom_settings: Record<string, any>
}

// 租户成员关系
export interface CoreTenantMembership {
  id: string
  user_id: string
  tenant_id: string
  role_id: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  invited_by?: string
  joined_at?: Date
  expires_at?: Date
  created_at: Date
  updated_at: Date
}

// 用户完整信息 (继承BaseEntity)
export interface CoreUser extends BaseEntity {
  email: string
  username?: string
  first_name?: string
  last_name?: string
  full_name?: string
  email_verified: boolean
  phone_verified: boolean
  is_active: boolean
  last_login_at?: Date
  password_changed_at?: Date
  profile?: CoreUserProfile
  roles: CoreRole[]
  memberships: CoreTenantMembership[]
  region_id?: string
  region?: Region
}

// 界面配置相关类型
export interface UIComponent {
  id: string
  name: string
  type: 'page' | 'widget' | 'menu' | 'button' | 'form' | 'chart'
  code: string
  title: string
  description?: string
  icon?: string
  config_schema: Record<string, any>
  default_config: Record<string, any>
  is_system: boolean
  plugin_id?: string
  created_at: Date
  updated_at: Date
}

export interface UILayout {
  id: string
  name: string
  type: 'dashboard' | 'page' | 'modal' | 'sidebar'
  config: {
    grid?: {
      columns: number
      rows: number
      gap: number
    }
    components: Array<{
      component_id: string
      position: {
        x: number
        y: number
        width: number
        height: number
      }
      config: Record<string, any>
    }>
    responsive?: Record<string, any>
  }
  tenant_id?: string
  created_by: string
  is_default: boolean
  created_at: Date
  updated_at: Date
}

export interface UIConfiguration {
  id: string
  name: string
  type: 'global' | 'tenant' | 'user' | 'role'
  target_id?: string
  scope: 'system' | 'application' | 'module' | 'component'
  config: {
    theme?: {
      primary_color: string
      secondary_color: string
      logo_url?: string
      favicon_url?: string
    }
    navigation?: {
      menu_items: Array<{
        id: string
        title: string
        path: string
        icon?: string
        children?: Array<any>
        permissions?: string[]
      }>
    }
    features?: {
      enabled_modules: string[]
      feature_flags: Record<string, boolean>
    }
    layouts?: {
      default_layout: string
      available_layouts: string[]
    }
    localization?: {
      default_language: string
      supported_languages: string[]
      custom_labels?: Record<string, string>
    }
  }
  is_active: boolean
  priority: number
  created_at: Date
  updated_at: Date
}

// 审计日志
export interface AuditLog extends BaseEntity {
  user_id?: string
  session_id?: string
  action: string
  resource_type: string
  resource_id?: string
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  duration_ms?: number
  context: Record<string, any>
}

// 系统配置
export interface SystemConfiguration {
  id: string
  category: string
  key: string
  value: any
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  description?: string
  is_encrypted: boolean
  is_public: boolean
  validation_rules?: Record<string, any>
  created_at: Date
  updated_at: Date
}

// Session管理
export interface UserSession {
  id: string
  user_id: string
  token: string
  refresh_token?: string
  device_info?: {
    type: 'web' | 'mobile' | 'desktop' | 'api'
    os?: string
    browser?: string
    device_id?: string
  }
  ip_address: string
  user_agent?: string
  created_at: Date
  last_active_at: Date
  expires_at: Date
  is_active: boolean
}

// 多租户相关
export interface Tenant extends BaseEntity {
  name: string
  slug: string
  domain?: string
  logo_url?: string
  plan: 'free' | 'basic' | 'premium' | 'enterprise'
  settings: {
    max_users: number
    max_devices: number
    features: string[]
    storage_quota: number
    api_rate_limit: number
  }
  billing_info?: {
    billing_email: string
    payment_method?: string
    subscription_id?: string
  }
  region_id?: string
  owner_id: string
  is_active: boolean
  trial_ends_at?: Date
}

// 数据权限范围
export interface DataScope {
  id: string
  name: string
  type: 'tenant' | 'region' | 'department' | 'custom'
  rules: Array<{
    resource: string
    conditions: Record<string, any>
  }>
  created_at: Date
  updated_at: Date
}

// 功能权限定义
export type ResourceAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'list' | 'export' | 'import' | 'approve'
  | 'execute' | 'configure' | 'manage'

export interface PermissionDefinition {
  resource: string
  actions: ResourceAction[]
  description: string
  category: string
}

// 权限检查结果
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  conditions?: Record<string, any>
  scope?: DataScope
} 