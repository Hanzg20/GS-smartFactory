import supabase from '../config/database.js'

// 获取综合报表数据
export const getComprehensiveReport = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { period = '30d', start_date, end_date } = req.query

    let timeFilter = new Date()
    switch (period) {
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30)
        break
      case '90d':
        timeFilter.setDate(timeFilter.getDate() - 90)
        break
      default:
        timeFilter.setDate(timeFilter.getDate() - 30)
    }

    // 获取设备数据
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, device_type, status, location')
      .eq('enterprise_id', enterprise_id)

    if (devicesError) throw devicesError

    // 获取报警数据
    const { data: alarms, error: alarmsError } = await supabase
      .from('alarm_records')
      .select('alarm_level, status, created_at, devices(name)')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', timeFilter.toISOString())

    if (alarmsError) throw alarmsError

    // 获取生产数据
    const { data: production, error: productionError } = await supabase
      .from('production_plans')
      .select('status, planned_quantity, actual_quantity, efficiency, quality_issues, created_at')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', timeFilter.toISOString())

    if (productionError) throw productionError

    // 获取维护数据
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_plans')
      .select('status, maintenance_type, total_cost, estimated_duration, created_at')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', timeFilter.toISOString())

    if (maintenanceError) throw maintenanceError

    // 计算统计数据
    const deviceStats = {
      total: devices.length,
      active: devices.filter(d => d.status === 'active').length,
      inactive: devices.filter(d => d.status !== 'active').length,
      byType: devices.reduce((acc, device) => {
        acc[device.device_type] = (acc[device.device_type] || 0) + 1
        return acc
      }, {}),
      byLocation: devices.reduce((acc, device) => {
        acc[device.location] = (acc[device.location] || 0) + 1
        return acc
      }, {})
    }

    const alarmStats = {
      total: alarms.length,
      byLevel: alarms.reduce((acc, alarm) => {
        acc[alarm.alarm_level] = (acc[alarm.alarm_level] || 0) + 1
        return acc
      }, {}),
      byStatus: alarms.reduce((acc, alarm) => {
        acc[alarm.status] = (acc[alarm.status] || 0) + 1
        return acc
      }, {}),
      byDevice: alarms.reduce((acc, alarm) => {
        const deviceName = alarm.devices?.name || 'Unknown'
        acc[deviceName] = (acc[deviceName] || 0) + 1
        return acc
      }, {})
    }

    const productionStats = {
      totalPlans: production.length,
      completedPlans: production.filter(p => p.status === 'completed').length,
      inProgressPlans: production.filter(p => p.status === 'in_progress').length,
      totalPlanned: production.reduce((sum, p) => sum + (p.planned_quantity || 0), 0),
      totalActual: production.reduce((sum, p) => sum + (p.actual_quantity || 0), 0),
      avgEfficiency: production.length > 0 ? 
        production.reduce((sum, p) => sum + (p.efficiency || 0), 0) / production.length : 0,
      totalQualityIssues: production.reduce((sum, p) => sum + (p.quality_issues || 0), 0)
    }

    const maintenanceStats = {
      totalPlans: maintenance.length,
      completedPlans: maintenance.filter(m => m.status === 'completed').length,
      inProgressPlans: maintenance.filter(m => m.status === 'in_progress').length,
      byType: maintenance.reduce((acc, m) => {
        acc[m.maintenance_type] = (acc[m.maintenance_type] || 0) + 1
        return acc
      }, {}),
      totalCost: maintenance.reduce((sum, m) => sum + (m.total_cost || 0), 0),
      avgCost: maintenance.length > 0 ? 
        maintenance.reduce((sum, m) => sum + (m.total_cost || 0), 0) / maintenance.length : 0
    }

    // 计算关键性能指标
    const kpis = {
      deviceUtilization: deviceStats.total > 0 ? (deviceStats.active / deviceStats.total) * 100 : 0,
      alarmResolutionRate: alarmStats.total > 0 ? 
        ((alarmStats.total - (alarmStats.byStatus.active || 0)) / alarmStats.total) * 100 : 0,
      productionEfficiency: productionStats.avgEfficiency,
      qualityRate: productionStats.totalActual > 0 ? 
        ((productionStats.totalActual - productionStats.totalQualityIssues) / productionStats.totalActual) * 100 : 100,
      maintenanceCompletionRate: maintenanceStats.totalPlans > 0 ? 
        (maintenanceStats.completedPlans / maintenanceStats.totalPlans) * 100 : 0
    }

    res.json({
      success: true,
      data: {
        period,
        generatedAt: new Date().toISOString(),
        deviceStats,
        alarmStats,
        productionStats,
        maintenanceStats,
        kpis,
        summary: {
          totalDevices: deviceStats.total,
          totalAlarms: alarmStats.total,
          totalProductionPlans: productionStats.totalPlans,
          totalMaintenancePlans: maintenanceStats.totalPlans,
          overallHealth: (kpis.deviceUtilization + kpis.alarmResolutionRate + kpis.productionEfficiency + kpis.qualityRate + kpis.maintenanceCompletionRate) / 5
        }
      },
      message: '获取综合报表成功'
    })
  } catch (error) {
    console.error('获取综合报表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取综合报表失败',
      error: error.message
    })
  }
}

// 获取设备详细报表
export const getDeviceReport = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { device_id, period = '30d' } = req.query

    let timeFilter = new Date()
    switch (period) {
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30)
        break
      case '90d':
        timeFilter.setDate(timeFilter.getDate() - 90)
        break
      default:
        timeFilter.setDate(timeFilter.getDate() - 30)
    }

    // 获取设备信息
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('id', device_id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (deviceError || !device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在或无权限访问'
      })
    }

    // 获取设备报警记录
    const { data: alarms, error: alarmsError } = await supabase
      .from('alarm_records')
      .select('*')
      .eq('device_id', device_id)
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })

    if (alarmsError) throw alarmsError

    // 获取设备生产记录
    const { data: production, error: productionError } = await supabase
      .from('production_plans')
      .select('*')
      .eq('device_id', device_id)
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })

    if (productionError) throw productionError

    // 获取设备维护记录
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_plans')
      .select('*')
      .eq('device_id', device_id)
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })

    if (maintenanceError) throw maintenanceError

    // 计算设备统计
    const alarmStats = {
      total: alarms.length,
      byLevel: alarms.reduce((acc, alarm) => {
        acc[alarm.alarm_level] = (acc[alarm.alarm_level] || 0) + 1
        return acc
      }, {}),
      byStatus: alarms.reduce((acc, alarm) => {
        acc[alarm.status] = (acc[alarm.status] || 0) + 1
        return acc
      }, {})
    }

    const productionStats = {
      totalPlans: production.length,
      completedPlans: production.filter(p => p.status === 'completed').length,
      totalPlanned: production.reduce((sum, p) => sum + (p.planned_quantity || 0), 0),
      totalActual: production.reduce((sum, p) => sum + (p.actual_quantity || 0), 0),
      avgEfficiency: production.length > 0 ? 
        production.reduce((sum, p) => sum + (p.efficiency || 0), 0) / production.length : 0
    }

    const maintenanceStats = {
      totalPlans: maintenance.length,
      completedPlans: maintenance.filter(m => m.status === 'completed').length,
      totalCost: maintenance.reduce((sum, m) => sum + (m.total_cost || 0), 0),
      byType: maintenance.reduce((acc, m) => {
        acc[m.maintenance_type] = (acc[m.maintenance_type] || 0) + 1
        return acc
      }, {})
    }

    // 计算设备健康度
    let healthScore = 100
    healthScore -= (alarmStats.byLevel.critical || 0) * 20
    healthScore -= (alarmStats.byLevel.error || 0) * 10
    healthScore -= (alarmStats.byLevel.warning || 0) * 5
    healthScore = Math.max(0, Math.min(100, healthScore))

    res.json({
      success: true,
      data: {
        device,
        period,
        generatedAt: new Date().toISOString(),
        alarmStats,
        productionStats,
        maintenanceStats,
        healthScore,
        healthStatus: healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : healthScore >= 50 ? 'fair' : 'poor',
        recommendations: generateDeviceRecommendations(alarmStats, productionStats, maintenanceStats)
      },
      message: '获取设备报表成功'
    })
  } catch (error) {
    console.error('获取设备报表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取设备报表失败',
      error: error.message
    })
  }
}

// 获取趋势分析数据
export const getTrendAnalysis = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { metric, period = '30d' } = req.query

    let timeFilter = new Date()
    switch (period) {
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30)
        break
      case '90d':
        timeFilter.setDate(timeFilter.getDate() - 90)
        break
      default:
        timeFilter.setDate(timeFilter.getDate() - 30)
    }

    let trendData = []

    switch (metric) {
      case 'alarms':
        // 获取报警趋势
        const { data: alarms, error: alarmsError } = await supabase
          .from('alarm_records')
          .select('alarm_level, created_at')
          .eq('enterprise_id', enterprise_id)
          .gte('created_at', timeFilter.toISOString())
          .order('created_at', { ascending: true })

        if (alarmsError) throw alarmsError

        // 按日期分组
        const alarmGroups = alarms.reduce((acc, alarm) => {
          const date = new Date(alarm.created_at).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = { date, critical: 0, error: 0, warning: 0, info: 0 }
          }
          acc[date][alarm.alarm_level]++
          return acc
        }, {})

        trendData = Object.values(alarmGroups)
        break

      case 'production':
        // 获取生产趋势
        const { data: production, error: productionError } = await supabase
          .from('production_plans')
          .select('status, efficiency, created_at')
          .eq('enterprise_id', enterprise_id)
          .gte('created_at', timeFilter.toISOString())
          .order('created_at', { ascending: true })

        if (productionError) throw productionError

        // 按日期分组
        const productionGroups = production.reduce((acc, plan) => {
          const date = new Date(plan.created_at).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = { date, completed: 0, inProgress: 0, avgEfficiency: 0, totalEfficiency: 0, count: 0 }
          }
          acc[date][plan.status === 'completed' ? 'completed' : 'inProgress']++
          acc[date].totalEfficiency += plan.efficiency || 0
          acc[date].count++
          return acc
        }, {})

        // 计算平均效率
        Object.values(productionGroups).forEach(group => {
          group.avgEfficiency = group.count > 0 ? group.totalEfficiency / group.count : 0
          delete group.totalEfficiency
          delete group.count
        })

        trendData = Object.values(productionGroups)
        break

      case 'maintenance':
        // 获取维护趋势
        const { data: maintenance, error: maintenanceError } = await supabase
          .from('maintenance_plans')
          .select('status, total_cost, created_at')
          .eq('enterprise_id', enterprise_id)
          .gte('created_at', timeFilter.toISOString())
          .order('created_at', { ascending: true })

        if (maintenanceError) throw maintenanceError

        // 按日期分组
        const maintenanceGroups = maintenance.reduce((acc, plan) => {
          const date = new Date(plan.created_at).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = { date, completed: 0, inProgress: 0, totalCost: 0 }
          }
          acc[date][plan.status === 'completed' ? 'completed' : 'inProgress']++
          acc[date].totalCost += plan.total_cost || 0
          return acc
        }, {})

        trendData = Object.values(maintenanceGroups)
        break

      default:
        return res.status(400).json({
          success: false,
          message: '不支持的指标类型'
        })
    }

    res.json({
      success: true,
      data: {
        metric,
        period,
        trendData,
        generatedAt: new Date().toISOString()
      },
      message: '获取趋势分析成功'
    })
  } catch (error) {
    console.error('获取趋势分析失败:', error)
    res.status(500).json({
      success: false,
      message: '获取趋势分析失败',
      error: error.message
    })
  }
}

// 生成设备建议
const generateDeviceRecommendations = (alarmStats, productionStats, maintenanceStats) => {
  const recommendations = []

  if (alarmStats.byLevel.critical > 0) {
    recommendations.push('设备存在严重报警，建议立即检查并维修')
  }
  if (alarmStats.byLevel.error > 2) {
    recommendations.push('设备错误报警较多，建议进行预防性维护')
  }
  if (productionStats.avgEfficiency < 85) {
    recommendations.push('设备生产效率较低，建议优化运行参数')
  }
  if (maintenanceStats.totalPlans === 0) {
    recommendations.push('设备长期未进行维护，建议安排预防性维护')
  }

  return recommendations
} 