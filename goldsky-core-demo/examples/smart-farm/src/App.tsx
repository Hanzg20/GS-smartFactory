import React from 'react'
import { GoldskyApp, usePlugin } from '@goldsky/core'
import { agriculturePlugin } from '@goldsky/agriculture-plugin'

// 应用配置
const appConfig = {
  name: 'Smart Farm Management',
  domain: 'agriculture',
  plugins: [agriculturePlugin],
  
  // 实体映射配置
  entity_mappings: {
    'soil_sensor': 'MonitoringObject',
    'irrigation_system': 'MonitoringObject',
    'greenhouse': 'Space',
    'field': 'Space'
  },
  
  // 数据库配置
  database: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  }
}

// 智慧农场主界面
function SmartFarmApp() {
  const { components } = usePlugin('goldsky-agriculture')
  
  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-600 text-white p-4">
        <h1 className="text-2xl font-bold">🌱 智慧农场管理系统</h1>
        <p className="text-green-100">基于 Goldsky Core 平台构建</p>
      </header>
      
      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 农场概览 */}
        <div className="lg:col-span-2">
          <components.FarmOverview />
        </div>
        
        {/* 实时监控 */}
        <div>
          <components.RealTimeMonitoring />
        </div>
        
        {/* 温室管理 */}
        <div>
          <components.GreenhouseList />
        </div>
        
        {/* 土壤传感器 */}
        <div>
          <components.SoilSensorDashboard />
        </div>
        
        {/* 灌溉系统 */}
        <div>
          <components.IrrigationControl />
        </div>
      </div>
    </div>
  )
}

// 应用入口
function App() {
  return (
    <GoldskyApp config={appConfig}>
      <SmartFarmApp />
    </GoldskyApp>
  )
}

export default App 