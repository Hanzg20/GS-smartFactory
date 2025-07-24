import { supabase } from '../config/database.js'
import { io } from '../index.js'

// 获取设备健康度分析
export const getDeviceHealthAnalysis = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { device_id } = req.params

    // 验证设备是否属于该企业
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, device_type')
      .eq('id', device_id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (deviceError || !device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在或无权限访问'
      })
    }

    // 获取设备最近的报警记录
    const { data: alarms, error: alarmsError } = await supabase
      .from('alarm_records')
      .select('alarm_level, created_at')
      .eq('device_id', device_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 最近30天
      .order('created_at', { ascending: false })

    if (alarmsError) throw alarmsError

    // 获取设备最近的维护记录
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_records')
      .select('maintenance_plans(maintenance_type, total_cost), completed_at')
      .eq('maintenance_plans.device_id', device_id)
      .gte('completed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // 最近90天
      .order('completed_at', { ascending: false })

    if (maintenanceError) throw maintenanceError

    // 计算健康度指标
    const criticalAlarms = alarms.filter(a => a.alarm_level === 'critical').length
    const errorAlarms = alarms.filter(a => a.alarm_level === 'error').length
    const warningAlarms = alarms.filter(a => a.alarm_level === 'warning').length

    // 简单的健康度计算算法
    let healthScore = 100
    healthScore -= criticalAlarms * 20
    healthScore -= errorAlarms * 10
    healthScore -= warningAlarms * 5

    // 确保健康度在0-100范围内
    healthScore = Math.max(0, Math.min(100, healthScore))

    // 确定健康状态
    let healthStatus = 'excellent'
    if (healthScore < 60) healthStatus = 'poor'
    else if (healthScore < 80) healthStatus = 'fair'
    else if (healthScore < 90) healthStatus = 'good'

    // 生成建议
    const recommendations = []
    if (criticalAlarms > 0) {
      recommendations.push('设备存在严重报警，建议立即检查并维修')
    }
    if (errorAlarms > 2) {
      recommendations.push('设备错误报警较多，建议进行预防性维护')
    }
    if (warningAlarms > 5) {
      recommendations.push('设备警告较多，建议检查运行参数')
    }
    if (maintenance.length === 0) {
      recommendations.push('设备长期未进行维护，建议安排预防性维护')
    }

    res.json({
      success: true,
      data: {
        device: {
          id: device.id,
          name: device.name,
          type: device.device_type
        },
        healthScore,
        healthStatus,
        metrics: {
          criticalAlarms,
          errorAlarms,
          warningAlarms,
          totalMaintenance: maintenance.length
        },
        recommendations,
        lastUpdated: new Date().toISOString()
      },
      message: '获取设备健康度分析成功'
    })
  } catch (error) {
    console.error('获取设备健康度分析失败:', error)
    res.status(500).json({
      success: false,
      message: '获取设备健康度分析失败',
      error: error.message
    })
  }
}

// 获取生产优化建议
export const getProductionOptimization = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { period = '30d' } = req.query

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

    // 获取生产数据
    const { data: productionData, error: productionError } = await supabase
      .from('production_plans')
      .select('status, planned_quantity, actual_quantity, efficiency, quality_issues')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', timeFilter.toISOString())

    if (productionError) throw productionError

    // 获取设备数据
    const { data: deviceData, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, device_type, status')
      .eq('enterprise_id', enterprise_id)

    if (deviceError) throw deviceError

    // 分析生产数据
    const completedPlans = productionData.filter(p => p.status === 'completed')
    const avgEfficiency = completedPlans.length > 0 
      ? completedPlans.reduce((sum, p) => sum + (p.efficiency || 0), 0) / completedPlans.length 
      : 0

    const totalQualityIssues = completedPlans.reduce((sum, p) => sum + (p.quality_issues || 0), 0)
    const totalProduced = completedPlans.reduce((sum, p) => sum + (p.actual_quantity || 0), 0)
    const qualityRate = totalProduced > 0 ? ((totalProduced - totalQualityIssues) / totalProduced) * 100 : 100

    // 生成优化建议
    const recommendations = []

    if (avgEfficiency < 85) {
      recommendations.push({
        type: 'efficiency',
        priority: 'high',
        title: '生产效率优化',
        description: `当前平均效率为${avgEfficiency.toFixed(1)}%，建议优化生产流程和设备配置`,
        impact: '可提升生产效率15-25%'
      })
    }

    if (qualityRate < 95) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: '质量改进',
        description: `当前质量率为${qualityRate.toFixed(1)}%，建议加强质量控制和检测`,
        impact: '可减少质量损失10-20%'
      })
    }

    // 检查设备利用率
    const activeDevices = deviceData.filter(d => d.status === 'active').length
    const totalDevices = deviceData.length
    const deviceUtilization = totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0

    if (deviceUtilization < 80) {
      recommendations.push({
        type: 'utilization',
        priority: 'medium',
        title: '设备利用率提升',
        description: `当前设备利用率为${deviceUtilization.toFixed(1)}%，建议优化生产调度`,
        impact: '可提升设备利用率10-15%'
      })
    }

    // 检查生产计划完成率
    const plannedPlans = productionData.filter(p => p.status === 'planned').length
    const totalPlans = productionData.length
    const completionRate = totalPlans > 0 ? ((totalPlans - plannedPlans) / totalPlans) * 100 : 0

    if (completionRate < 90) {
      recommendations.push({
        type: 'planning',
        priority: 'medium',
        title: '生产计划优化',
        description: `当前计划完成率为${completionRate.toFixed(1)}%，建议改进计划制定和执行`,
        impact: '可提升计划完成率5-10%'
      })
    }

    res.json({
      success: true,
      data: {
        period,
        metrics: {
          avgEfficiency: Math.round(avgEfficiency * 100) / 100,
          qualityRate: Math.round(qualityRate * 100) / 100,
          deviceUtilization: Math.round(deviceUtilization * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100,
          totalPlans: productionData.length,
          completedPlans: completedPlans.length
        },
        recommendations,
        lastUpdated: new Date().toISOString()
      },
      message: '获取生产优化建议成功'
    })
  } catch (error) {
    console.error('获取生产优化建议失败:', error)
    res.status(500).json({
      success: false,
      message: '获取生产优化建议失败',
      error: error.message
    })
  }
}

// 获取预测性维护建议
export const getPredictiveMaintenance = async (req, res) => {
  try {
    const { enterprise_id } = req.user

    // 获取设备列表
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, device_type, status, last_maintenance_date')
      .eq('enterprise_id', enterprise_id)

    if (devicesError) throw devicesError

    // 获取设备报警数据
    const { data: alarms, error: alarmsError } = await supabase
      .from('alarm_records')
      .select('device_id, alarm_level, created_at')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (alarmsError) throw alarmsError

    // 获取维护历史
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_records')
      .select('maintenance_plans(device_id, maintenance_type), completed_at')
      .eq('enterprise_id', enterprise_id)
      .gte('completed_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())

    if (maintenanceError) throw maintenanceError

    const recommendations = []

    // 分析每个设备
    for (const device of devices) {
      const deviceAlarms = alarms.filter(a => a.device_id === device.id)
      const deviceMaintenance = maintenance.filter(m => m.maintenance_plans?.device_id === device.id)
      
      // 计算风险分数
      let riskScore = 0
      
      // 基于报警频率
      const criticalAlarms = deviceAlarms.filter(a => a.alarm_level === 'critical').length
      const errorAlarms = deviceAlarms.filter(a => a.alarm_level === 'error').length
      riskScore += criticalAlarms * 10
      riskScore += errorAlarms * 5

      // 基于维护历史
      const lastMaintenance = deviceMaintenance.length > 0 
        ? new Date(Math.max(...deviceMaintenance.map(m => new Date(m.completed_at).getTime())))
        : null
      
      const daysSinceMaintenance = lastMaintenance 
        ? Math.floor((Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
        : 365 // 如果从未维护，假设365天

      if (daysSinceMaintenance > 90) riskScore += 20
      else if (daysSinceMaintenance > 60) riskScore += 10
      else if (daysSinceMaintenance > 30) riskScore += 5

      // 基于设备类型（简单规则）
      const deviceTypeRisk = {
        'robot': 5,
        'cnc': 8,
        'conveyor': 3,
        'sensor': 2
      }
      riskScore += deviceTypeRisk[device.device_type] || 5

      // 生成建议
      if (riskScore > 30) {
        recommendations.push({
          device: {
            id: device.id,
            name: device.name,
            type: device.device_type
          },
          riskScore,
          priority: 'high',
          type: 'immediate',
          title: '立即维护建议',
          description: `设备${device.name}风险分数较高(${riskScore})，建议立即安排维护检查`,
          reasons: [
            criticalAlarms > 0 ? `${criticalAlarms}个严重报警` : null,
            errorAlarms > 0 ? `${errorAlarms}个错误报警` : null,
            daysSinceMaintenance > 90 ? `已${daysSinceMaintenance}天未维护` : null
          ].filter(Boolean)
        })
      } else if (riskScore > 15) {
        recommendations.push({
          device: {
            id: device.id,
            name: device.name,
            type: device.device_type
          },
          riskScore,
          priority: 'medium',
          type: 'planned',
          title: '计划维护建议',
          description: `设备${device.name}建议在近期安排预防性维护`,
          reasons: [
            errorAlarms > 0 ? `${errorAlarms}个错误报警` : null,
            daysSinceMaintenance > 60 ? `已${daysSinceMaintenance}天未维护` : null
          ].filter(Boolean)
        })
      }
    }

    // 按风险分数排序
    recommendations.sort((a, b) => b.riskScore - a.riskScore)

    res.json({
      success: true,
      data: {
        totalDevices: devices.length,
        recommendations,
        summary: {
          immediate: recommendations.filter(r => r.type === 'immediate').length,
          planned: recommendations.filter(r => r.type === 'planned').length,
          highRisk: recommendations.filter(r => r.priority === 'high').length
        },
        lastUpdated: new Date().toISOString()
      },
      message: '获取预测性维护建议成功'
    })
  } catch (error) {
    console.error('获取预测性维护建议失败:', error)
    res.status(500).json({
      success: false,
      message: '获取预测性维护建议失败',
      error: error.message
    })
  }
}

// 获取系统概览分析
export const getSystemOverview = async (req, res) => {
  try {
    const { enterprise_id } = req.user

    // 获取各种统计数据
    const [
      { data: devices, error: devicesError },
      { data: alarms, error: alarmsError },
      { data: production, error: productionError },
      { data: maintenance, error: maintenanceError }
    ] = await Promise.all([
      supabase.from('devices').select('status').eq('enterprise_id', enterprise_id),
      supabase.from('alarm_records').select('status, alarm_level').eq('enterprise_id', enterprise_id).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('production_plans').select('status').eq('enterprise_id', enterprise_id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('maintenance_plans').select('status').eq('enterprise_id', enterprise_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    if (devicesError || alarmsError || productionError || maintenanceError) {
      throw new Error('获取数据失败')
    }

    // 计算关键指标
    const activeDevices = devices.filter(d => d.status === 'active').length
    const totalDevices = devices.length
    const deviceHealth = totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0

    const activeAlarms = alarms.filter(a => a.status === 'active').length
    const criticalAlarms = alarms.filter(a => a.alarm_level === 'critical').length

    const inProgressProduction = production.filter(p => p.status === 'in_progress').length
    const completedProduction = production.filter(p => p.status === 'completed').length

    const plannedMaintenance = maintenance.filter(m => m.status === 'planned').length
    const inProgressMaintenance = maintenance.filter(m => m.status === 'in_progress').length

    // 生成系统状态
    let systemStatus = 'excellent'
    if (criticalAlarms > 0 || deviceHealth < 70) {
      systemStatus = 'critical'
    } else if (activeAlarms > 5 || deviceHealth < 85) {
      systemStatus = 'warning'
    } else if (activeAlarms > 2 || deviceHealth < 95) {
      systemStatus = 'good'
    }

    res.json({
      success: true,
      data: {
        systemStatus,
        metrics: {
          deviceHealth: Math.round(deviceHealth * 100) / 100,
          activeDevices,
          totalDevices,
          activeAlarms,
          criticalAlarms,
          inProgressProduction,
          completedProduction,
          plannedMaintenance,
          inProgressMaintenance
        },
        alerts: [
          criticalAlarms > 0 ? `${criticalAlarms}个严重报警需要立即处理` : null,
          activeAlarms > 5 ? `${activeAlarms}个活动报警需要关注` : null,
          deviceHealth < 80 ? `设备健康度较低(${deviceHealth.toFixed(1)}%)` : null,
          plannedMaintenance > 3 ? `${plannedMaintenance}个维护计划待执行` : null
        ].filter(Boolean),
        lastUpdated: new Date().toISOString()
      },
      message: '获取系统概览成功'
    })
  } catch (error) {
    console.error('获取系统概览失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统概览失败',
      error: error.message
    })
  }
} 