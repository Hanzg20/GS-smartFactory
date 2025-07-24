import React, { useState, useEffect } from 'react'
import { Play, Pause, CheckCircle, Calendar, Clock, Filter, Plus, TrendingUp } from 'lucide-react'
import { apiClient } from '../lib/api-client'
import { useAuthStore } from '../stores/auth-store'
import toast from 'react-hot-toast'

interface ProductionPlan {
  id: string
  name: string
  description: string
  status: 'planned' | 'in_progress' | 'completed' | 'paused' | 'cancelled'
  planned_quantity: number
  actual_quantity?: number
  planned_start_date: string
  planned_end_date: string
  actual_start_date?: string
  actual_end_date?: string
  efficiency?: number
  priority: 'low' | 'normal' | 'high'
  products: {
    id: string
    name: string
    description: string
  }
  devices: {
    id: string
    name: string
    device_type: string
  }
}

interface ProductionStats {
  period: string
  plans: {
    total: number
    completed: number
    inProgress: number
    paused: number
    totalPlanned: number
    totalActual: number
    avgEfficiency: number
  }
  records: {
    total: number
    completed: number
    totalProduced: number
    totalQualityIssues: number
    qualityRate: number
  }
}

const ProductionList: React.FC = () => {
  const { user } = useAuthStore()
  const [plans, setPlans] = useState<ProductionPlan[]>([])
  const [stats, setStats] = useState<ProductionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // 获取生产计划
  const fetchPlans = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await apiClient.get(`/production/plans?${params}`)
      setPlans(response.data.data)
    } catch (error) {
      console.error('获取生产计划失败:', error)
      toast.error('获取生产计划失败')
    }
  }

  // 获取生产统计
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/production/stats?period=30d')
      setStats(response.data.data)
    } catch (error) {
      console.error('获取生产统计失败:', error)
    }
  }

  // 开始生产
  const startProduction = async (planId: string) => {
    try {
      await apiClient.post(`/production/plans/${planId}/start`, {
        started_by: user?.email
      })
      toast.success('生产开始成功')
      fetchPlans()
      fetchStats()
    } catch (error) {
      console.error('开始生产失败:', error)
      toast.error('开始生产失败')
    }
  }

  // 暂停生产
  const pauseProduction = async (planId: string) => {
    try {
      await apiClient.post(`/production/plans/${planId}/pause`, {
        paused_by: user?.email,
        reason: '手动暂停'
      })
      toast.success('生产暂停成功')
      fetchPlans()
      fetchStats()
    } catch (error) {
      console.error('暂停生产失败:', error)
      toast.error('暂停生产失败')
    }
  }

  // 完成生产
  const completeProduction = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) return

      await apiClient.post(`/production/plans/${planId}/complete`, {
        completed_by: user?.email,
        actual_quantity: plan.planned_quantity,
        quality_issues: 0,
        notes: '生产完成'
      })
      toast.success('生产完成成功')
      fetchPlans()
      fetchStats()
    } catch (error) {
      console.error('完成生产失败:', error)
      toast.error('完成生产失败')
    }
  }

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'planned':
        return { 
          icon: Calendar, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100', 
          text: '计划中',
          action: 'start'
        }
      case 'in_progress':
        return { 
          icon: Play, 
          color: 'text-green-600', 
          bgColor: 'bg-green-100', 
          text: '进行中',
          action: 'pause'
        }
      case 'paused':
        return { 
          icon: Pause, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100', 
          text: '已暂停',
          action: 'complete'
        }
      case 'completed':
        return { 
          icon: CheckCircle, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100', 
          text: '已完成',
          action: null
        }
      case 'cancelled':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bgColor: 'bg-red-100', 
          text: '已取消',
          action: null
        }
      default:
        return { 
          icon: Clock, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100', 
          text: '未知',
          action: null
        }
    }
  }

  // 获取优先级信息
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-600', bgColor: 'bg-red-100', text: '高' }
      case 'normal':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', text: '中' }
      case 'low':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', text: '低' }
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', text: '未知' }
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchStats()
    setLoading(false)
  }, [filters])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总计划数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.plans.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-green-600">{stats.plans.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-blue-600">{stats.plans.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均效率</p>
                <p className="text-2xl font-bold text-purple-600">{stats.plans.avgEfficiency}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 生产计划列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">生产计划</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                过滤器
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                新建计划
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="planned">计划中</option>
                  <option value="in_progress">进行中</option>
                  <option value="paused">已暂停</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 计划列表 */}
        <div className="divide-y divide-gray-200">
          {plans.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无生产计划</h3>
              <p className="mt-1 text-sm text-gray-500">当前没有生产计划</p>
            </div>
          ) : (
            plans.map((plan) => {
              const statusInfo = getStatusInfo(plan.status)
              const priorityInfo = getPriorityInfo(plan.priority)
              const StatusIcon = statusInfo.icon

              return (
                <div key={plan.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                        <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{plan.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}>
                            {priorityInfo.text}优先级
                          </span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                        
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">产品</p>
                            <p className="font-medium">{plan.products?.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">设备</p>
                            <p className="font-medium">{plan.devices?.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">计划数量</p>
                            <p className="font-medium">{plan.planned_quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">实际数量</p>
                            <p className="font-medium">{plan.actual_quantity || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <p>计划时间: {new Date(plan.planned_start_date).toLocaleDateString('zh-CN')} - {new Date(plan.planned_end_date).toLocaleDateString('zh-CN')}</p>
                          {plan.actual_start_date && (
                            <p>开始时间: {new Date(plan.actual_start_date).toLocaleString('zh-CN')}</p>
                          )}
                          {plan.efficiency && (
                            <p>效率: {plan.efficiency.toFixed(1)}%</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {statusInfo.action === 'start' && (
                        <button
                          onClick={() => startProduction(plan.id)}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        >
                          开始
                        </button>
                      )}
                      {statusInfo.action === 'pause' && (
                        <>
                          <button
                            onClick={() => pauseProduction(plan.id)}
                            className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
                          >
                            暂停
                          </button>
                          <button
                            onClick={() => completeProduction(plan.id)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            完成
                          </button>
                        </>
                      )}
                      {statusInfo.action === 'complete' && (
                        <button
                          onClick={() => completeProduction(plan.id)}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        >
                          完成
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductionList 