import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertTriangle, Activity, BarChart3, Target, Clock, Zap } from 'lucide-react'
import { apiClient } from '../lib/api-client'
import toast from 'react-hot-toast'

interface DeviceHealth {
  device: {
    id: string
    name: string
    type: string
  }
  healthScore: number
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor'
  metrics: {
    criticalAlarms: number
    errorAlarms: number
    warningAlarms: number
    totalMaintenance: number
  }
  recommendations: string[]
}

interface ProductionOptimization {
  period: string
  metrics: {
    avgEfficiency: number
    qualityRate: number
    deviceUtilization: number
    completionRate: number
    totalPlans: number
    completedPlans: number
  }
  recommendations: Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }>
}

interface PredictiveMaintenance {
  totalDevices: number
  recommendations: Array<{
    device: {
      id: string
      name: string
      type: string
    }
    riskScore: number
    priority: 'high' | 'medium' | 'low'
    type: 'immediate' | 'planned'
    title: string
    description: string
    reasons: string[]
  }>
  summary: {
    immediate: number
    planned: number
    highRisk: number
  }
}

interface SystemOverview {
  systemStatus: 'excellent' | 'good' | 'warning' | 'critical'
  metrics: {
    deviceHealth: number
    activeDevices: number
    totalDevices: number
    activeAlarms: number
    criticalAlarms: number
    inProgressProduction: number
    completedProduction: number
    plannedMaintenance: number
    inProgressMaintenance: number
  }
  alerts: string[]
}

const AIAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null)
  const [productionOptimization, setProductionOptimization] = useState<ProductionOptimization | null>(null)
  const [predictiveMaintenance, setPredictiveMaintenance] = useState<PredictiveMaintenance | null>(null)
  const [devices, setDevices] = useState<any[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [deviceHealth, setDeviceHealth] = useState<DeviceHealth | null>(null)

  const tabs = [
    { id: 'overview', name: '系统概览', icon: Activity },
    { id: 'production', name: '生产优化', icon: TrendingUp },
    { id: 'maintenance', name: '预测维护', icon: AlertTriangle },
    { id: 'device-health', name: '设备健康', icon: Target }
  ]

  // 获取系统概览
  const fetchSystemOverview = async () => {
    try {
      const response = await apiClient.get('/ai/system-overview')
      setSystemOverview(response.data.data)
    } catch (error) {
      console.error('获取系统概览失败:', error)
      toast.error('获取系统概览失败')
    }
  }

  // 获取生产优化建议
  const fetchProductionOptimization = async () => {
    try {
      const response = await apiClient.get('/ai/production-optimization?period=30d')
      setProductionOptimization(response.data.data)
    } catch (error) {
      console.error('获取生产优化建议失败:', error)
      toast.error('获取生产优化建议失败')
    }
  }

  // 获取预测性维护建议
  const fetchPredictiveMaintenance = async () => {
    try {
      const response = await apiClient.get('/ai/predictive-maintenance')
      setPredictiveMaintenance(response.data.data)
    } catch (error) {
      console.error('获取预测性维护建议失败:', error)
      toast.error('获取预测性维护建议失败')
    }
  }

  // 获取设备列表
  const fetchDevices = async () => {
    try {
      const response = await apiClient.get('/devices')
      setDevices(response.data.data)
      if (response.data.data.length > 0) {
        setSelectedDevice(response.data.data[0].id)
      }
    } catch (error) {
      console.error('获取设备列表失败:', error)
    }
  }

  // 获取设备健康度
  const fetchDeviceHealth = async (deviceId: string) => {
    try {
      const response = await apiClient.get(`/ai/device-health/${deviceId}`)
      setDeviceHealth(response.data.data)
    } catch (error) {
      console.error('获取设备健康度失败:', error)
      toast.error('获取设备健康度失败')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSystemOverview(),
        fetchProductionOptimization(),
        fetchPredictiveMaintenance(),
        fetchDevices()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceHealth(selectedDevice)
    }
  }, [selectedDevice])

  // 获取系统状态颜色
  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100'
      case 'good':
        return 'text-blue-600 bg-blue-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // 获取健康度颜色
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {systemOverview && (
              <>
                {/* 系统状态卡片 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">系统状态</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemStatusColor(systemOverview.systemStatus)}`}>
                      {systemOverview.systemStatus === 'excellent' && '优秀'}
                      {systemOverview.systemStatus === 'good' && '良好'}
                      {systemOverview.systemStatus === 'warning' && '警告'}
                      {systemOverview.systemStatus === 'critical' && '严重'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{systemOverview.metrics.deviceHealth}%</p>
                      <p className="text-sm text-gray-600">设备健康度</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{systemOverview.metrics.activeDevices}/{systemOverview.metrics.totalDevices}</p>
                      <p className="text-sm text-gray-600">活跃设备</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{systemOverview.metrics.criticalAlarms}</p>
                      <p className="text-sm text-gray-600">严重报警</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{systemOverview.metrics.inProgressProduction}</p>
                      <p className="text-sm text-gray-600">进行中生产</p>
                    </div>
                  </div>
                </div>

                {/* 系统告警 */}
                {systemOverview.alerts.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">系统告警</h3>
                    <div className="space-y-2">
                      {systemOverview.alerts.map((alert, index) => (
                        <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                          <span className="text-red-800">{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )

      case 'production':
        return (
          <div className="space-y-6">
            {productionOptimization && (
              <>
                {/* 生产指标 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">生产指标</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{productionOptimization.metrics.avgEfficiency}%</p>
                      <p className="text-sm text-gray-600">平均效率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{productionOptimization.metrics.qualityRate}%</p>
                      <p className="text-sm text-gray-600">质量率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{productionOptimization.metrics.deviceUtilization}%</p>
                      <p className="text-sm text-gray-600">设备利用率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{productionOptimization.metrics.completionRate}%</p>
                      <p className="text-sm text-gray-600">计划完成率</p>
                    </div>
                  </div>
                </div>

                {/* 优化建议 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">优化建议</h3>
                  <div className="space-y-4">
                    {productionOptimization.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-sm text-blue-600 font-medium">预期影响: {rec.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 'maintenance':
        return (
          <div className="space-y-6">
            {predictiveMaintenance && (
              <>
                {/* 维护概览 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">维护概览</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{predictiveMaintenance.totalDevices}</p>
                      <p className="text-sm text-gray-600">总设备数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{predictiveMaintenance.summary.immediate}</p>
                      <p className="text-sm text-gray-600">立即维护</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{predictiveMaintenance.summary.planned}</p>
                      <p className="text-sm text-gray-600">计划维护</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{predictiveMaintenance.summary.highRisk}</p>
                      <p className="text-sm text-gray-600">高风险设备</p>
                    </div>
                  </div>
                </div>

                {/* 维护建议 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">维护建议</h3>
                  <div className="space-y-4">
                    {predictiveMaintenance.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                            <p className="text-sm text-gray-600">设备: {rec.device.name} ({rec.device.type})</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                              {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">风险分数: {rec.riskScore}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{rec.description}</p>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">原因:</p>
                          <ul className="list-disc list-inside mt-1">
                            {rec.reasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 'device-health':
        return (
          <div className="space-y-6">
            {/* 设备选择 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">设备健康度分析</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">选择设备</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.device_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 设备健康度详情 */}
            {deviceHealth && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {deviceHealth.device.name} 健康度分析
                  </h3>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${getHealthColor(deviceHealth.healthScore)}`}>
                      {deviceHealth.healthScore}
                    </p>
                    <p className="text-sm text-gray-600">健康分数</p>
                  </div>
                </div>

                {/* 健康指标 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{deviceHealth.metrics.criticalAlarms}</p>
                    <p className="text-sm text-gray-600">严重报警</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{deviceHealth.metrics.errorAlarms}</p>
                    <p className="text-sm text-gray-600">错误报警</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{deviceHealth.metrics.warningAlarms}</p>
                    <p className="text-sm text-gray-600">警告报警</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{deviceHealth.metrics.totalMaintenance}</p>
                    <p className="text-sm text-gray-600">维护次数</p>
                  </div>
                </div>

                {/* 健康建议 */}
                {deviceHealth.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">健康建议</h4>
                    <div className="space-y-2">
                      {deviceHealth.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <Brain className="h-5 w-5 text-blue-600 mr-3" />
                          <span className="text-blue-800">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI 智能分析</h2>
            <p className="text-gray-600">基于AI算法的智能分析和优化建议</p>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* 标签内容 */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis 