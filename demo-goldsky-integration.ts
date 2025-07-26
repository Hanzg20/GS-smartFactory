import { GoldskyApp, GoldskyConfig } from './core/GoldskyApp'
import { FactoryPlugin } from './plugins/factory/FactoryPlugin'

// 演示：在现有GS-smartFactory项目中集成Goldsky Core
async function demonstrateGoldskyIntegration() {
  console.log('🌟 Goldsky Core Integration Demo')
  console.log('=================================')
  
  // 1. 配置Goldsky应用
  const goldskyConfig: GoldskyConfig = {
    database: {
      url: process.env.VITE_SUPABASE_URL || 'your-supabase-url',
      key: process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
    },
    
    app: {
      name: 'GS-smartFactory with Goldsky Core',
      domain: 'factory',
      version: '1.0.0'
    },
    
    // 注册工厂插件
    plugins: [
      new FactoryPlugin()
    ],
    
    logging: {
      level: 'info',
      enableConsole: true
    },
    
    features: {
      realtimeMonitoring: true,
      pluginSystem: true,
      multiTenant: true
    },
    
    custom: {
      factoryId: 'demo-factory-001',
      timezone: 'Asia/Shanghai'
    }
  }
  
  // 2. 创建Goldsky应用实例
  const app = new GoldskyApp(goldskyConfig)
  
  try {
    // 3. 初始化应用
    console.log('\n📦 Initializing Goldsky App...')
    await app.initialize()
    
    // 4. 展示插件管理功能
    console.log('\n🔌 Plugin Management Demo:')
    const pluginManager = app.getPluginManager()
    
    console.log('Installed plugins:', pluginManager.getAllPlugins().map(p => ({
      id: p.plugin.id,
      name: p.plugin.name,
      status: p.status,
      domain: p.plugin.domain
    })))
    
    // 5. 展示组件注册
    console.log('\n🎨 Available Components:')
    const components = app.getPluginComponents()
    console.log('Registered components:', Object.keys(components))
    
    // 6. 展示菜单系统
    console.log('\n📱 Menu System:')
    const menus = app.getPluginMenus()
    console.log('Menu items:', menus.map(m => ({
      id: m.id,
      label: m.label,
      path: m.path,
      children: m.children?.length || 0
    })))
    
    // 7. 展示小部件系统
    console.log('\n📊 Widget System:')
    const widgets = app.getPluginWidgets()
    console.log('Available widgets:', widgets.map(w => ({
      id: w.id,
      name: w.name,
      category: w.category,
      size: w.size
    })))
    
    // 8. 演示核心服务使用
    console.log('\n⚙️ Core Services Demo:')
    const monitoringService = app.getMonitoringObjectService()
    
    // 创建示例监控对象（设备）
    const sampleDevice = {
      name: 'Demo CNC Machine',
      description: 'Demonstration CNC machine for Goldsky Core',
      type: 'cnc_machine',
      category: 'production_equipment',
      status: 'active' as const,
      metadata: {
        manufacturer: 'DEMO Corp',
        model: 'CNC-2024'
      },
      position: {
        x: 100,
        y: 200,
        rotation: 0
      },
      tags: ['demo', 'cnc', 'production'],
      tenant_id: 'demo-tenant',
      specifications: {
        axes_count: 5,
        spindle_speed: 12000,
        feed_rate: 2500
      },
      real_time_data: {
        temperature: 35.5,
        vibration: 2.1,
        status: 'running',
        efficiency: 87.5
      },
      parameters: {
        current_job: 'DEMO-JOB-001',
        tools_loaded: 15,
        program_running: 'demo_program.nc'
      },
      maintenance_info: {
        last_maintenance: new Date('2024-01-15'),
        next_maintenance: new Date('2024-04-15'),
        maintenance_hours: 2840
      }
    }
    
    console.log('Creating sample monitoring object...')
    // 注意：这里只是演示，实际使用时需要确保数据库表存在
    // const createdDevice = await monitoringService.create(sampleDevice)
    // console.log('Created device:', createdDevice.id)
    
    // 9. 健康检查
    console.log('\n🏥 Health Check:')
    const healthStatus = await app.healthCheck()
    console.log('Application health:', healthStatus)
    
    // 10. 统计信息
    console.log('\n📈 Statistics:')
    const stats = await app.getStatistics()
    console.log('Application statistics:', stats)
    
    // 11. 演示数据迁移概念
    console.log('\n🔄 Data Migration Concept:')
    console.log('In a real implementation, you would:')
    console.log('1. Create migration scripts to move existing device data to monitoring_objects table')
    console.log('2. Map workshop data to spaces table')
    console.log('3. Convert production_orders to process_instances')
    console.log('4. Update existing API endpoints to use Core services')
    console.log('5. Gradually replace UI components with plugin-based components')
    
    // 12. 未来扩展演示
    console.log('\n🚀 Future Extensions:')
    console.log('Ready to add these plugins in the future:')
    console.log('- Smart Retail Plugin (for retail stores)')
    console.log('- Smart Agriculture Plugin (for farms)')
    console.log('- Smart Community Plugin (for residential areas)')
    console.log('- Smart Construction Plugin (for construction sites)')
    
    console.log('\n✅ Goldsky Core Integration Demo Completed!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
  } finally {
    // 清理
    await app.shutdown()
    console.log('\n🛑 Application shut down')
  }
}

// 演示如何创建新的领域插件
function demonstrateNewDomainPlugin() {
  console.log('\n🔧 Creating New Domain Plugin Example:')
  console.log('=====================================')
  
  // 智慧农业插件示例
  const agriculturePluginExample = `
  import { DomainPlugin } from '../core/plugin/types'
  
  export class AgriculturePlugin implements DomainPlugin {
    id = 'goldsky-agriculture'
    name = 'Smart Agriculture Plugin'
    version = '1.0.0'
    domain = 'agriculture' as const
    
    entityTypes = {
      'soil_sensor': {
        extends: 'MonitoringObject',
        category: 'sensing_equipment',
        specificFields: {
          ph_level: 'number',
          moisture_content: 'number',
          nutrient_levels: 'json',
          soil_temperature: 'number'
        }
      },
      'greenhouse': {
        extends: 'Space',
        category: 'growing_space',
        specificFields: {
          crop_type: 'string',
          planting_date: 'date',
          expected_harvest: 'date',
          irrigation_system: 'string'
        }
      },
      'planting_task': {
        extends: 'ProcessInstance',
        category: 'farming_process',
        specificFields: {
          seed_variety: 'string',
          planting_density: 'number',
          fertilizer_plan: 'json'
        }
      }
    }
    
    components = {
      'CropMonitor': { name: 'Crop Monitor', component: 'CropMonitor' },
      'IrrigationControl': { name: 'Irrigation Control', component: 'IrrigationControl' },
      'GreenhouseLayout': { name: 'Greenhouse Layout', component: 'GreenhouseLayout' }
    }
    
    menus = [
      { id: 'agriculture-overview', label: '农场概览', path: '/agriculture/overview' },
      { id: 'agriculture-crops', label: '作物管理', path: '/agriculture/crops' },
      { id: 'agriculture-irrigation', label: '灌溉系统', path: '/agriculture/irrigation' }
    ]
    
    async initialize() {
      console.log('Agriculture Plugin initialized')
    }
    
    async cleanup() {
      console.log('Agriculture Plugin cleaned up')
    }
  }
  `
  
  console.log('Example Agriculture Plugin Structure:')
  console.log(agriculturePluginExample)
}

// 演示数据库迁移策略
function demonstrateDatabaseMigration() {
  console.log('\n🗄️ Database Migration Strategy:')
  console.log('===============================')
  
  const migrationStrategy = `
  -- Step 1: Create Core Tables
  CREATE TABLE monitoring_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    metadata JSONB DEFAULT '{}',
    position_x FLOAT,
    position_y FLOAT,
    position_z FLOAT,
    rotation FLOAT,
    rotation_x FLOAT,
    rotation_y FLOAT,
    rotation_z FLOAT,
    tags TEXT[] DEFAULT '{}',
    tenant_id UUID NOT NULL,
    specifications JSONB DEFAULT '{}',
    real_time_data JSONB DEFAULT '{}',
    parameters JSONB DEFAULT '{}',
    maintenance_info JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    image_url TEXT,
    model_3d_url TEXT,
    manufacturer VARCHAR,
    model VARCHAR,
    serial_number VARCHAR,
    installation_date TIMESTAMP,
    warranty_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  -- Step 2: Migrate Existing Device Data
  INSERT INTO monitoring_objects (
    name, description, type, category, status,
    position_x, position_y, position_z,
    tenant_id, specifications, real_time_data,
    parameters, maintenance_info, settings,
    manufacturer, model, serial_number,
    installation_date, warranty_expiry,
    created_at, updated_at
  )
  SELECT 
    name, description, type, 'production_equipment', 
    CASE 
      WHEN status->>'online' = 'true' THEN 'active'
      ELSE 'offline'
    END,
    position_x, position_y, position_z,
    workshop_id, -- 作为临时的 tenant_id
    specifications, status, parameters,
    maintenance_info, settings,
    manufacturer, model, serial_number,
    installation_date, warranty_expiry,
    created_at, updated_at
  FROM devices;
  
  -- Step 3: Create Migration View for Backward Compatibility
  CREATE VIEW devices AS 
  SELECT 
    id, name, description, type,
    position_x, position_y, position_z,
    specifications, real_time_data as status,
    parameters, maintenance_info, settings,
    manufacturer, model, serial_number,
    installation_date, warranty_expiry,
    created_at, updated_at
  FROM monitoring_objects 
  WHERE category = 'production_equipment';
  `
  
  console.log('Migration SQL Example:')
  console.log(migrationStrategy)
  
  console.log('\nMigration Steps:')
  console.log('1. Create new core tables (monitoring_objects, spaces, process_instances)')
  console.log('2. Migrate existing data with proper mapping')
  console.log('3. Create views for backward compatibility')
  console.log('4. Update application code gradually')
  console.log('5. Remove old tables when migration is complete')
}

// 运行演示
if (require.main === module) {
  demonstrateGoldskyIntegration()
    .then(() => {
      demonstrateNewDomainPlugin()
      demonstrateDatabaseMigration()
    })
    .catch(console.error)
}

export {
  demonstrateGoldskyIntegration,
  demonstrateNewDomainPlugin,
  demonstrateDatabaseMigration
} 