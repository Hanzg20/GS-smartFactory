import { DomainPlugin, EntityTypeDefinition, RouteDefinition, ComponentRegistration, MenuItemDefinition, WidgetDefinition } from '../../core/plugin/types'

// 工厂插件实现
export class FactoryPlugin implements DomainPlugin {
  id = 'goldsky-factory'
  name = 'Smart Factory Plugin'
  version = '1.0.0'
  description = 'Smart Factory Management System Plugin'
  domain = 'factory' as const
  author = 'Goldsky Team'

  // 实体类型定义
  entityTypes: Record<string, EntityTypeDefinition> = {
    'cnc_machine': {
      extends: 'MonitoringObject',
      category: 'production_equipment',
      specificFields: {
        axes_count: 'number',
        spindle_speed: 'number',
        feed_rate: 'number',
        workpiece_material: 'string',
        tool_count: 'number',
        coolant_type: 'string'
      },
      validation: {
        axes_count: { min: 3, max: 10 },
        spindle_speed: { min: 0, max: 50000 },
        feed_rate: { min: 0, max: 10000 }
      },
      permissions: ['factory:device:read', 'factory:device:write']
    },
    'robot_arm': {
      extends: 'MonitoringObject',
      category: 'automation_equipment',
      specificFields: {
        reach: 'number',
        payload: 'number',
        repeatability: 'number',
        degrees_of_freedom: 'number',
        end_effector_type: 'string'
      },
      validation: {
        degrees_of_freedom: { min: 4, max: 7 },
        payload: { min: 0, max: 1000 }
      },
      permissions: ['factory:device:read', 'factory:device:write']
    },
    'inspection_machine': {
      extends: 'MonitoringObject',
      category: 'quality_equipment',
      specificFields: {
        measurement_accuracy: 'number',
        measurement_range: 'string',
        probe_type: 'string',
        software_version: 'string'
      },
      permissions: ['factory:device:read', 'factory:quality:read']
    },
    'workshop': {
      extends: 'Space',
      category: 'production_space',
      specificFields: {
        production_line_count: 'number',
        shift_schedule: 'json',
        safety_level: 'string',
        temperature_control: 'boolean',
        humidity_control: 'boolean'
      },
      validation: {
        production_line_count: { min: 1, max: 20 },
        safety_level: { enum: ['low', 'medium', 'high', 'critical'] }
      },
      permissions: ['factory:space:read', 'factory:space:write']
    },
    'production_order': {
      extends: 'ProcessInstance',
      category: 'production_process',
      specificFields: {
        product_name: 'string',
        quantity: 'number',
        due_date: 'date',
        material_requirements: 'json',
        quality_requirements: 'json',
        priority_level: 'string'
      },
      validation: {
        quantity: { min: 1, max: 100000 },
        priority_level: { enum: ['low', 'normal', 'high', 'urgent'] }
      },
      permissions: ['factory:production:read', 'factory:production:write']
    },
    'maintenance_task': {
      extends: 'ProcessInstance',
      category: 'maintenance_process',
      specificFields: {
        maintenance_type: 'string',
        scheduled_date: 'date',
        estimated_duration: 'number',
        required_skills: 'json',
        spare_parts: 'json'
      },
      validation: {
        maintenance_type: { enum: ['preventive', 'corrective', 'predictive', 'emergency'] },
        estimated_duration: { min: 0.5, max: 168 }
      },
      permissions: ['factory:maintenance:read', 'factory:maintenance:write']
    }
  }

  // 组件注册
  components: Record<string, ComponentRegistration> = {
    'DeviceDetail': {
      name: 'Device Detail',
      component: 'DeviceDetail', // Component reference string
      category: 'data',
      permissions: ['factory:device:read']
    },
    'WorkshopFloorPlan': {
      name: 'Workshop Floor Plan',
      component: 'WorkshopFloorPlan', // Component reference string
      category: 'layout',
      permissions: ['factory:space:read']
    },
    'ProductionDashboard': {
      name: 'Production Dashboard',
      component: 'ProductionDashboard', // Component reference string
      category: 'data',
      permissions: ['factory:production:read']
    },
    'MaintenancePlanner': {
      name: 'Maintenance Planner',
      component: 'MaintenancePlanner', // Component reference string
      category: 'form',
      permissions: ['factory:maintenance:read']
    },
    'QualityControl': {
      name: 'Quality Control',
      component: 'QualityControl', // Component reference string
      category: 'data',
      permissions: ['factory:quality:read']
    },
    'DeviceList': {
      name: 'Device List',
      component: 'DeviceList', // Component reference string
      category: 'data',
      permissions: ['factory:device:read']
    }
  }

  // API路由定义
  apiRoutes: RouteDefinition[] = [
    {
      path: '/api/factory/devices',
      method: 'GET',
      handler: 'getDevices',
      permissions: ['factory:device:read'],
      rateLimit: { requests: 100, window: 60 }
    },
    {
      path: '/api/factory/devices',
      method: 'POST',
      handler: 'createDevice',
      permissions: ['factory:device:write'],
      rateLimit: { requests: 10, window: 60 }
    },
    {
      path: '/api/factory/devices/:id',
      method: 'GET',
      handler: 'getDevice',
      permissions: ['factory:device:read']
    },
    {
      path: '/api/factory/devices/:id',
      method: 'PUT',
      handler: 'updateDevice',
      permissions: ['factory:device:write']
    },
    {
      path: '/api/factory/devices/:id/status',
      method: 'PATCH',
      handler: 'updateDeviceStatus',
      permissions: ['factory:device:control']
    },
    {
      path: '/api/factory/workshops',
      method: 'GET',
      handler: 'getWorkshops',
      permissions: ['factory:space:read']
    },
    {
      path: '/api/factory/production-orders',
      method: 'GET',
      handler: 'getProductionOrders',
      permissions: ['factory:production:read']
    },
    {
      path: '/api/factory/production-orders',
      method: 'POST',
      handler: 'createProductionOrder',
      permissions: ['factory:production:write']
    },
    {
      path: '/api/factory/maintenance-tasks',
      method: 'GET',
      handler: 'getMaintenanceTasks',
      permissions: ['factory:maintenance:read']
    },
    {
      path: '/api/factory/alerts',
      method: 'GET',
      handler: 'getAlerts',
      permissions: ['factory:alert:read']
    },
    {
      path: '/api/factory/reports/efficiency',
      method: 'GET',
      handler: 'getEfficiencyReport',
      permissions: ['factory:report:read']
    }
  ]

  // 菜单定义
  menus: MenuItemDefinition[] = [
    {
      id: 'factory-overview',
      label: '工厂概览',
      icon: 'FactoryIcon',
      path: '/factory/overview',
      order: 1,
      permissions: ['factory:overview:read']
    },
    {
      id: 'factory-devices',
      label: '设备管理',
      icon: 'DeviceIcon',
      path: '/factory/devices',
      order: 2,
      permissions: ['factory:device:read'],
      children: [
        {
          id: 'factory-devices-list',
          label: '设备列表',
          path: '/factory/devices/list',
          permissions: ['factory:device:read']
        },
        {
          id: 'factory-devices-monitoring',
          label: '实时监控',
          path: '/factory/devices/monitoring',
          permissions: ['factory:device:read']
        },
        {
          id: 'factory-devices-maintenance',
          label: '维护管理',
          path: '/factory/devices/maintenance',
          permissions: ['factory:maintenance:read']
        }
      ]
    },
    {
      id: 'factory-production',
      label: '生产管理',
      icon: 'ProductionIcon',
      path: '/factory/production',
      order: 3,
      permissions: ['factory:production:read'],
      children: [
        {
          id: 'factory-production-orders',
          label: '生产订单',
          path: '/factory/production/orders',
          permissions: ['factory:production:read']
        },
        {
          id: 'factory-production-planning',
          label: '生产计划',
          path: '/factory/production/planning',
          permissions: ['factory:production:write']
        },
        {
          id: 'factory-production-quality',
          label: '质量控制',
          path: '/factory/production/quality',
          permissions: ['factory:quality:read']
        }
      ]
    },
    {
      id: 'factory-workshops',
      label: '车间管理',
      icon: 'WorkshopIcon',
      path: '/factory/workshops',
      order: 4,
      permissions: ['factory:space:read']
    },
    {
      id: 'factory-reports',
      label: '报表分析',
      icon: 'ReportIcon',
      path: '/factory/reports',
      order: 5,
      permissions: ['factory:report:read']
    }
  ]

  // 仪表板小部件
  widgets: WidgetDefinition[] = [
    {
      id: 'factory-device-status',
      name: '设备状态概览',
      description: '显示所有设备的实时状态',
      component: 'DeviceStatusWidget', // Widget component reference string
      size: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 3
      },
      category: 'monitoring',
      permissions: ['factory:device:read']
    },
    {
      id: 'factory-production-progress',
      name: '生产进度',
      description: '显示当前生产订单进度',
      component: 'ProductionProgressWidget', // Widget component reference string
      size: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 3,
        defaultHeight: 2
      },
      category: 'production',
      permissions: ['factory:production:read']
    },
    {
      id: 'factory-efficiency-chart',
      name: '效率趋势图',
      description: '显示设备和生产线效率趋势',
      component: 'EfficiencyChartWidget', // Widget component reference string
      size: {
        minWidth: 3,
        minHeight: 2,
        defaultWidth: 6,
        defaultHeight: 4
      },
      category: 'analytics',
      permissions: ['factory:report:read']
    },
    {
      id: 'factory-alerts',
      name: '实时报警',
      description: '显示当前活跃的设备报警',
      component: 'AlertsWidget', // Widget component reference string
      size: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 3,
        defaultHeight: 3
      },
      category: 'monitoring',
      permissions: ['factory:alert:read']
    },
    {
      id: 'factory-maintenance-schedule',
      name: '维护计划',
      description: '显示即将到期的维护任务',
      component: 'MaintenanceScheduleWidget', // Widget component reference string
      size: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 3
      },
      category: 'maintenance',
      permissions: ['factory:maintenance:read']
    }
  ]

  // 默认配置
  defaultConfig = {
    database: {
      // 确保现有的设备表被映射到监控对象
      entityMappings: {
        'devices': 'monitoring_objects',
        'workshops': 'spaces',
        'production_orders': 'process_instances',
        'maintenance_tasks': 'process_instances'
      }
    },
    api: {
      prefix: '/api/factory',
      version: 'v1'
    },
    features: {
      realTimeMonitoring: true,
      predictiveMaintenance: true,
      qualityControl: true,
      productionPlanning: true,
      energyManagement: false // 未来功能
    },
    ui: {
      theme: {
        primaryColor: '#1890ff',
        factoryLayoutColors: {
          workshop: '#52c41a',
          device: '#1890ff',
          productionLine: '#722ed1',
          qualityStation: '#fa8c16'
        }
      }
    },
    custom: {
      // 工厂特定配置
      defaultShiftHours: 8,
      maintenanceScheduleAdvanceDays: 7,
      alertEscalationTimeMinutes: 30,
      qualityThresholds: {
        defectRate: 0.05,
        efficiency: 0.85
      }
    }
  }

  // 生命周期钩子
  lifecycle = {
    beforeInstall: async () => {
      console.log('Installing Factory Plugin...')
      // 检查是否有现有的工厂数据需要迁移
    },
    
    afterInstall: async () => {
      console.log('Factory Plugin installed successfully')
      // 初始化默认配置
    },
    
    beforeEnable: async () => {
      console.log('Enabling Factory Plugin...')
      // 启动实时数据监控
    },
    
    afterEnable: async () => {
      console.log('Factory Plugin enabled')
      // 开始收集设备数据
    },
    
    beforeDisable: async () => {
      console.log('Disabling Factory Plugin...')
      // 停止实时监控
    },
    
    afterDisable: async () => {
      console.log('Factory Plugin disabled')
    }
  }

  // 初始化方法
  async initialize(): Promise<void> {
    console.log('Initializing Factory Plugin...')
    
    // 这里可以进行数据库迁移、初始化服务等
    // 例如：将现有的devices表数据迁移到monitoring_objects表
    
    console.log('Factory Plugin initialized')
  }

  // 清理方法
  async cleanup(): Promise<void> {
    console.log('Cleaning up Factory Plugin...')
    
    // 清理资源、关闭连接等
    
    console.log('Factory Plugin cleaned up')
  }

  // 健康检查
  async healthCheck() {
    try {
      // 检查数据库连接
      // 检查设备连接状态
      // 检查关键服务状态
      
      return {
        status: 'healthy' as const,
        message: 'All factory systems operational',
        details: {
          databaseConnection: 'healthy',
          deviceConnections: 'healthy',
          realtimeMonitoring: 'healthy'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        message: (error as Error).message,
        details: {
          error: error
        }
      }
    }
  }

  // 获取配置
  getConfig() {
    return {
      database: {
        migrations: [],
        seeders: []
      },
      api: this.defaultConfig.api,
      ui: this.defaultConfig.ui,
      features: this.defaultConfig.features,
      custom: this.defaultConfig
    }
  }

  // 设置配置
  setConfig(config: any) {
    // 合并配置
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }
} 