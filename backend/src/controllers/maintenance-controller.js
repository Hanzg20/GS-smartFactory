import { supabase } from '../config/database.js'
import { io } from '../index.js'

// 维护类型枚举
export const MAINTENANCE_TYPE = {
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  PREDICTIVE: 'predictive',
  EMERGENCY: 'emergency'
}

// 维护状态枚举
export const MAINTENANCE_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// 获取维护计划
export const getMaintenancePlans = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type,
      device_id,
      start_date,
      end_date 
    } = req.query

    let query = supabase
      .from('maintenance_plans')
      .select(`
        *,
        devices (
          id,
          name,
          device_type,
          location
        )
      `, { count: 'exact' })
      .eq('enterprise_id', enterprise_id)

    // 应用过滤条件
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('maintenance_type', type)
    if (device_id) query = query.eq('device_id', device_id)
    if (start_date) query = query.gte('planned_start_date', start_date)
    if (end_date) query = query.lte('planned_end_date', end_date)

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      message: '获取维护计划成功'
    })
  } catch (error) {
    console.error('获取维护计划失败:', error)
    res.status(500).json({
      success: false,
      message: '获取维护计划失败',
      error: error.message
    })
  }
}

// 创建维护计划
export const createMaintenancePlan = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const {
      name,
      description,
      device_id,
      maintenance_type,
      planned_start_date,
      planned_end_date,
      estimated_duration,
      priority = 'normal',
      assigned_to,
      parts_required,
      notes
    } = req.body

    // 验证设备是否属于该企业
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('id', device_id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (deviceError || !device) {
      return res.status(400).json({
        success: false,
        message: '设备不存在或无权限访问'
      })
    }

    const { data, error } = await supabase
      .from('maintenance_plans')
      .insert({
        enterprise_id,
        name,
        description,
        device_id,
        maintenance_type,
        planned_start_date,
        planned_end_date,
        estimated_duration,
        priority,
        assigned_to,
        parts_required,
        notes,
        status: MAINTENANCE_STATUS.PLANNED
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: '维护计划创建成功'
    })
  } catch (error) {
    console.error('创建维护计划失败:', error)
    res.status(500).json({
      success: false,
      message: '创建维护计划失败',
      error: error.message
    })
  }
}

// 更新维护计划
export const updateMaintenancePlan = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const updateData = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('maintenance_plans')
      .select('id, status')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '维护计划不存在或无权限访问'
      })
    }

    const { data, error } = await supabase
      .from('maintenance_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: '维护计划更新成功'
    })
  } catch (error) {
    console.error('更新维护计划失败:', error)
    res.status(500).json({
      success: false,
      message: '更新维护计划失败',
      error: error.message
    })
  }
}

// 开始维护
export const startMaintenance = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const { started_by, actual_start_time } = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('maintenance_plans')
      .select('id, status')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '维护计划不存在或无权限访问'
      })
    }

    if (plan.status !== MAINTENANCE_STATUS.PLANNED) {
      return res.status(400).json({
        success: false,
        message: '只能开始计划状态的维护'
      })
    }

    const { data, error } = await supabase
      .from('maintenance_plans')
      .update({
        status: MAINTENANCE_STATUS.IN_PROGRESS,
        actual_start_time: actual_start_time || new Date().toISOString(),
        started_by
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 创建维护记录
    const { error: recordError } = await supabase
      .from('maintenance_records')
      .insert({
        enterprise_id,
        maintenance_plan_id: id,
        status: MAINTENANCE_STATUS.IN_PROGRESS,
        started_at: actual_start_time || new Date().toISOString(),
        started_by
      })

    if (recordError) {
      console.error('创建维护记录失败:', recordError)
    }

    // 发送实时通知
    io.to(`enterprise_${enterprise_id}`).emit('maintenance_started', {
      plan_id: id,
      started_by,
      timestamp: new Date().toISOString()
    })

    res.json({
      success: true,
      data,
      message: '维护开始成功'
    })
  } catch (error) {
    console.error('开始维护失败:', error)
    res.status(500).json({
      success: false,
      message: '开始维护失败',
      error: error.message
    })
  }
}

// 完成维护
export const completeMaintenance = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const { 
      completed_by, 
      actual_end_time,
      work_performed,
      parts_used,
      total_cost,
      notes 
    } = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('maintenance_plans')
      .select('id, status, estimated_duration')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '维护计划不存在或无权限访问'
      })
    }

    if (plan.status !== MAINTENANCE_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: '只能完成进行中的维护'
      })
    }

    const completionTime = actual_end_time || new Date().toISOString()
    const actualDuration = plan.estimated_duration // 这里可以计算实际持续时间

    const { data, error } = await supabase
      .from('maintenance_plans')
      .update({
        status: MAINTENANCE_STATUS.COMPLETED,
        actual_end_time: completionTime,
        completed_by,
        work_performed,
        parts_used,
        total_cost,
        actual_duration: actualDuration,
        notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 更新维护记录
    const { error: recordError } = await supabase
      .from('maintenance_records')
      .update({
        status: MAINTENANCE_STATUS.COMPLETED,
        completed_at: completionTime,
        completed_by,
        work_performed,
        parts_used,
        total_cost,
        actual_duration: actualDuration,
        notes
      })
      .eq('maintenance_plan_id', id)
      .eq('status', MAINTENANCE_STATUS.IN_PROGRESS)

    if (recordError) {
      console.error('更新维护记录失败:', recordError)
    }

    // 发送实时通知
    io.to(`enterprise_${enterprise_id}`).emit('maintenance_completed', {
      plan_id: id,
      completed_by,
      total_cost,
      timestamp: completionTime
    })

    res.json({
      success: true,
      data,
      message: '维护完成成功'
    })
  } catch (error) {
    console.error('完成维护失败:', error)
    res.status(500).json({
      success: false,
      message: '完成维护失败',
      error: error.message
    })
  }
}

// 获取维护记录
export const getMaintenanceRecords = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type,
      device_id,
      start_date,
      end_date 
    } = req.query

    let query = supabase
      .from('maintenance_records')
      .select(`
        *,
        maintenance_plans (
          id,
          name,
          description,
          maintenance_type,
          estimated_duration,
          devices (
            id,
            name,
            device_type,
            location
          )
        )
      `, { count: 'exact' })
      .eq('enterprise_id', enterprise_id)

    // 应用过滤条件
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('maintenance_plans.maintenance_type', type)
    if (device_id) query = query.eq('maintenance_plans.device_id', device_id)
    if (start_date) query = query.gte('started_at', start_date)
    if (end_date) query = query.lte('completed_at', end_date)

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('started_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      message: '获取维护记录成功'
    })
  } catch (error) {
    console.error('获取维护记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取维护记录失败',
      error: error.message
    })
  }
}

// 获取维护统计
export const getMaintenanceStats = async (req, res) => {
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

    // 获取维护计划统计
    const { data: plans, error: plansError } = await supabase
      .from('maintenance_plans')
      .select('status, maintenance_type, estimated_duration, total_cost')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', timeFilter.toISOString())

    if (plansError) throw plansError

    // 获取维护记录统计
    const { data: records, error: recordsError } = await supabase
      .from('maintenance_records')
      .select('status, actual_duration, total_cost')
      .eq('enterprise_id', enterprise_id)
      .gte('started_at', timeFilter.toISOString())

    if (recordsError) throw recordsError

    // 计算统计数据
    const planStats = plans.reduce((acc, plan) => {
      acc.totalPlanned += plan.estimated_duration || 0
      acc.totalCost += plan.total_cost || 0
      acc.planCount++
      
      if (plan.status === MAINTENANCE_STATUS.COMPLETED) {
        acc.completedCount++
      } else if (plan.status === MAINTENANCE_STATUS.IN_PROGRESS) {
        acc.inProgressCount++
      }
      
      acc.byType[plan.maintenance_type] = (acc.byType[plan.maintenance_type] || 0) + 1
      
      return acc
    }, {
      totalPlanned: 0,
      totalCost: 0,
      planCount: 0,
      completedCount: 0,
      inProgressCount: 0,
      byType: {}
    })

    const recordStats = records.reduce((acc, record) => {
      acc.totalActual += record.actual_duration || 0
      acc.totalCost += record.total_cost || 0
      acc.recordCount++
      
      if (record.status === MAINTENANCE_STATUS.COMPLETED) {
        acc.completedCount++
      }
      
      return acc
    }, {
      totalActual: 0,
      totalCost: 0,
      recordCount: 0,
      completedCount: 0
    })

    const avgCost = planStats.planCount > 0 ? planStats.totalCost / planStats.planCount : 0
    const completionRate = planStats.planCount > 0 ? (planStats.completedCount / planStats.planCount) * 100 : 0

    res.json({
      success: true,
      data: {
        period,
        plans: {
          total: planStats.planCount,
          completed: planStats.completedCount,
          inProgress: planStats.inProgressCount,
          totalPlanned: planStats.totalPlanned,
          totalCost: planStats.totalCost,
          avgCost: Math.round(avgCost * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100,
          byType: planStats.byType
        },
        records: {
          total: recordStats.recordCount,
          completed: recordStats.completedCount,
          totalActual: recordStats.totalActual,
          totalCost: recordStats.totalCost
        }
      },
      message: '获取维护统计成功'
    })
  } catch (error) {
    console.error('获取维护统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取维护统计失败',
      error: error.message
    })
  }
} 