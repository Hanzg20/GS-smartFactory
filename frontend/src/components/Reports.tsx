import React, { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react'
import { apiClient } from '../lib/api-client'
import toast from 'react-hot-toast'

interface ReportData {
  period: string
  deviceStats: {
    total: number
    active: number
    inactive: number
    byType: Record<string, number>
  }
  alarmStats: {
    total: number
    byLevel: Record<string, number>
    byStatus: Record<string, number>
  }
  productionStats: {
    totalPlans: number
    completedPlans: number
    avgEfficiency: number
    qualityRate: number
  }
  maintenanceStats: {
    totalPlans: number
    completedPlans: number
    avgCost: number
    byType: Record<string, number>
  }
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    period: '30d',
    start_date: '',
    end_date: '',
    device_type: '',
    alarm_level: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // 获取报表数据
  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // 获取设备统计
      const deviceResponse = await apiClient.get('/devices')
      const devices = deviceResponse.data.data
      
      // 获取报警统计
      const alarmResponse = await apiClient.get('/alarms/stats', {
        params: { period: filters.period }
      })
      const alarmStats = alarmResponse.data.data
      
      // 获取生产统计
      const productionResponse = await apiClient.get('/production/stats', {
        params: { period: filters.period }
      })
      const productionStats = productionResponse.data.data
      
      // 获取维护统计
      const maintenanceResponse = await apiClient.get('/maintenance/stats', {
        params: { period: filters.period }
      })
      const maintenanceStats = maintenanceResponse.data.data

      // 处理设备统计
      const deviceStats = {
        total: devices.length,
        active: devices.filter((d: any) => d.status === 'active').length,
        inactive: devices.filter((d: any) => d.status !== 'active').length,
        byType: devices.reduce((acc: any, device: any) => {
          acc[device.device_type] = (acc[device.device_type] || 0) + 1
          return acc
        }, {})
      }

      setReportData({
        period: filters.period,
        deviceStats,
        alarmStats,
        productionStats: productionStats.plans,
        maintenanceStats: maintenanceStats.plans
      })
    } catch (error) {
      console.error('获取报表数据失败:', error)
      toast.error('获取报表数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 导出报表
  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      toast.success(`正在导出${format.toUpperCase()}报表...`)
      // 这里可以调用后端导出API
      // const response = await apiClient.get(`/reports/export?format=${format}&period=${filters.period}`)
      console.log(`导出${format}报表`)
    } catch (error) {
      console.error('导出报表失败:', error)
      toast.error('导出报表失败')
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [filters.period])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">数据报表</h2>
              <p className="text-gray-600">系统运行数据统计和分析</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              过滤器
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              <Download className="h-4 w-4 mr-2" />
              导出PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              导出Excel
            </button>
          </div>
        </div>
      </div>

      {/* 过滤器 */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">报表过滤器</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">时间周期</label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">最近7天</option>
                <option value="30d">最近30天</option>
                <option value="90d">最近90天</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">设备类型</label>
              <select
                value={filters.device_type}
                onChange={(e) => setFilters({ ...filters, device_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部类型</option>
                <option value="robot">机器人</option>
                <option value="cnc">数控机床</option>
                <option value="conveyor">输送机</option>
                <option value="sensor">传感器</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {reportData && (
        <>
          {/* 概览统计 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">设备总数</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.deviceStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">报警总数</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.alarmStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PieChart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">生产计划</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.productionStats.totalPlans}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">维护计划</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.maintenanceStats.totalPlans}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 详细统计 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 设备统计 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">设备统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">活跃设备</span>
                  <span className="font-medium text-green-600">{reportData.deviceStats.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">非活跃设备</span>
                  <span className="font-medium text-red-600">{reportData.deviceStats.inactive}</span>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">按类型分布</h4>
                  {Object.entries(reportData.deviceStats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{type}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 报警统计 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">报警统计</h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">按级别分布</h4>
                  {Object.entries(reportData.alarmStats.byLevel).map(([level, count]) => (
                    <div key={level} className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{level}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">按状态分布</h4>
                  {Object.entries(reportData.alarmStats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 生产统计 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">生产统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">总计划数</span>
                  <span className="font-medium">{reportData.productionStats.totalPlans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">已完成</span>
                  <span className="font-medium text-green-600">{reportData.productionStats.completedPlans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平均效率</span>
                  <span className="font-medium text-blue-600">{reportData.productionStats.avgEfficiency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">质量率</span>
                  <span className="font-medium text-purple-600">{reportData.productionStats.qualityRate}%</span>
                </div>
              </div>
            </div>

            {/* 维护统计 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">维护统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">总计划数</span>
                  <span className="font-medium">{reportData.maintenanceStats.totalPlans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">已完成</span>
                  <span className="font-medium text-green-600">{reportData.maintenanceStats.completedPlans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平均成本</span>
                  <span className="font-medium text-orange-600">¥{reportData.maintenanceStats.avgCost}</span>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">按类型分布</h4>
                  {Object.entries(reportData.maintenanceStats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{type}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 趋势图表 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">趋势分析</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">图表功能开发中...</p>
                <p className="text-sm text-gray-400">将集成Chart.js或Recharts库</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports 