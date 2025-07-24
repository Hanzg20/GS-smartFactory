import { supabase } from '../config/database.js'
import { io } from '../index.js'

// 生产状态枚举
export const PRODUCTION_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
}

// 获取生产计划
export const getProductionPlans = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { 
      page = 1, 
      limit = 20, 
      status, 
      start_date,
      end_date 
    } = req.query

    let query = supabase
      .from('production_plans')
      .select(`
        *,
        products (
          id,
          name,
          description,
          specifications
        ),
        devices (
          id,
          name,
          device_type
        )
      `, { count: 'exact' })
      .eq('enterprise_id', enterprise_id)

    // 应用过滤条件
    if (status) query = query.eq('status', status)
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
      message: '获取生产计划成功'
    })
  } catch (error) {
    console.error('获取生产计划失败:', error)
    res.status(500).json({
      success: false,
      message: '获取生产计划失败',
      error: error.message
    })
  }
}

// 创建生产计划
export const createProductionPlan = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const {
      name,
      description,
      product_id,
      device_id,
      planned_quantity,
      planned_start_date,
      planned_end_date,
      priority = 'normal',
      notes
    } = req.body

    // 验证产品是否属于该企业
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (productError || !product) {
      return res.status(400).json({
        success: false,
        message: '产品不存在或无权限访问'
      })
    }

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
      .from('production_plans')
      .insert({
        enterprise_id,
        name,
        description,
        product_id,
        device_id,
        planned_quantity,
        planned_start_date,
        planned_end_date,
        priority,
        notes,
        status: PRODUCTION_STATUS.PLANNED
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: '生产计划创建成功'
    })
  } catch (error) {
    console.error('创建生产计划失败:', error)
    res.status(500).json({
      success: false,
      message: '创建生产计划失败',
      error: error.message
    })
  }
}

// 更新生产计划
export const updateProductionPlan = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const updateData = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('production_plans')
      .select('id, status')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '生产计划不存在或无权限访问'
      })
    }

    const { data, error } = await supabase
      .from('production_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: '生产计划更新成功'
    })
  } catch (error) {
    console.error('更新生产计划失败:', error)
    res.status(500).json({
      success: false,
      message: '更新生产计划失败',
      error: error.message
    })
  }
}

// 开始生产
export const startProduction = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const { started_by } = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('production_plans')
      .select('id, status')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '生产计划不存在或无权限访问'
      })
    }

    if (plan.status !== PRODUCTION_STATUS.PLANNED) {
      return res.status(400).json({
        success: false,
        message: '只能开始计划状态的生产'
      })
    }

    const { data, error } = await supabase
      .from('production_plans')
      .update({
        status: PRODUCTION_STATUS.IN_PROGRESS,
        actual_start_date: new Date().toISOString(),
        started_by
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 创建生产记录
    const { error: recordError } = await supabase
      .from('production_records')
      .insert({
        enterprise_id,
        production_plan_id: id,
        status: PRODUCTION_STATUS.IN_PROGRESS,
        started_at: new Date().toISOString(),
        started_by
      })

    if (recordError) {
      console.error('创建生产记录失败:', recordError)
    }

    // 发送实时通知
    io.to(`enterprise_${enterprise_id}`).emit('production_started', {
      plan_id: id,
      started_by,
      timestamp: new Date().toISOString()
    })

    res.json({
      success: true,
      data,
      message: '生产开始成功'
    })
  } catch (error) {
    console.error('开始生产失败:', error)
    res.status(500).json({
      success: false,
      message: '开始生产失败',
      error: error.message
    })
  }
}

// 暂停生产
export const pauseProduction = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const { paused_by, reason } = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('production_plans')
      .select('id, status')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '生产计划不存在或无权限访问'
      })
    }

    if (plan.status !== PRODUCTION_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: '只能暂停进行中的生产'
      })
    }

    const { data, error } = await supabase
      .from('production_plans')
      .update({
        status: PRODUCTION_STATUS.PAUSED,
        paused_at: new Date().toISOString(),
        paused_by,
        pause_reason: reason
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 更新生产记录
    const { error: recordError } = await supabase
      .from('production_records')
      .update({
        status: PRODUCTION_STATUS.PAUSED,
        paused_at: new Date().toISOString(),
        paused_by,
        pause_reason: reason
      })
      .eq('production_plan_id', id)
      .eq('status', PRODUCTION_STATUS.IN_PROGRESS)

    if (recordError) {
      console.error('更新生产记录失败:', recordError)
    }

    res.json({
      success: true,
      data,
      message: '生产暂停成功'
    })
  } catch (error) {
    console.error('暂停生产失败:', error)
    res.status(500).json({
      success: false,
      message: '暂停生产失败',
      error: error.message
    })
  }
}

// 完成生产
export const completeProduction = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { id } = req.params
    const { 
      completed_by, 
      actual_quantity, 
      quality_issues = 0,
      notes 
    } = req.body

    // 验证计划是否属于该企业
    const { data: plan, error: planError } = await supabase
      .from('production_plans')
      .select('id, status, planned_quantity')
      .eq('id', id)
      .eq('enterprise_id', enterprise_id)
      .single()

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '生产计划不存在或无权限访问'
      })
    }

    if (plan.status !== PRODUCTION_STATUS.IN_PROGRESS && plan.status !== PRODUCTION_STATUS.PAUSED) {
      return res.status(400).json({
        success: false,
        message: '只能完成进行中或暂停的生产'
      })
    }

    const completionDate = new Date().toISOString()
    const efficiency = actual_quantity / plan.planned_quantity * 100

    const { data, error } = await supabase
      .from('production_plans')
      .update({
        status: PRODUCTION_STATUS.COMPLETED,
        actual_end_date: completionDate,
        completed_by,
        actual_quantity,
        quality_issues,
        efficiency,
        notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 更新生产记录
    const { error: recordError } = await supabase
      .from('production_records')
      .update({
        status: PRODUCTION_STATUS.COMPLETED,
        completed_at: completionDate,
        completed_by,
        actual_quantity,
        quality_issues,
        efficiency,
        notes
      })
      .eq('production_plan_id', id)
      .in('status', [PRODUCTION_STATUS.IN_PROGRESS, PRODUCTION_STATUS.PAUSED])

    if (recordError) {
      console.error('更新生产记录失败:', recordError)
    }

    // 发送实时通知
    io.to(`enterprise_${enterprise_id}`).emit('production_completed', {
      plan_id: id,
      completed_by,
      actual_quantity,
      efficiency,
      timestamp: completionDate
    })

    res.json({
      success: true,
      data,
      message: '生产完成成功'
    })
  } catch (error) {
    console.error('完成生产失败:', error)
    res.status(500).json({
      success: false,
      message: '完成生产失败',
      error: error.message
    })
  }
}

// 获取生产记录
export const getProductionRecords = async (req, res) => {
  try {
    const { enterprise_id } = req.user
    const { 
      page = 1, 
      limit = 20, 
      status, 
      device_id,
      start_date,
      end_date 
    } = req.query

    let query = supabase
      .from('production_records')
      .select(`
        *,
        production_plans (
          id,
          name,
          description,
          planned_quantity,
          products (
            id,
            name,
            description
          ),
          devices (
            id,
            name,
            device_type
          )
        )
      `, { count: 'exact' })
      .eq('enterprise_id', enterprise_id)

    // 应用过滤条件
    if (status) query = query.eq('status', status)
    if (device_id) query = query.eq('production_plans.device_id', device_id)
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
      message: '获取生产记录成功'
    })
  } catch (error) {
    console.error('获取生产记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取生产记录失败',
      error: error.message
    })
  }
}

// 获取生产统计
export const getProductionStats = async (req, res) => {
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

    // 获取生产计划统计
    const { data: plans, error: plansError } = await supabase
      .from('production_plans')
      .select('status, planned_quantity, actual_quantity, efficiency')
      .eq('enterprise_id', enterprise_id)
      .gte('created_at', timeFilter.toISOString())

    if (plansError) throw plansError

    // 获取生产记录统计
    const { data: records, error: recordsError } = await supabase
      .from('production_records')
      .select('status, actual_quantity, quality_issues')
      .eq('enterprise_id', enterprise_id)
      .gte('started_at', timeFilter.toISOString())

    if (recordsError) throw recordsError

    // 计算统计数据
    const planStats = plans.reduce((acc, plan) => {
      acc.totalPlanned += plan.planned_quantity || 0
      acc.totalActual += plan.actual_quantity || 0
      acc.totalEfficiency += plan.efficiency || 0
      acc.planCount++
      
      if (plan.status === PRODUCTION_STATUS.COMPLETED) {
        acc.completedCount++
      } else if (plan.status === PRODUCTION_STATUS.IN_PROGRESS) {
        acc.inProgressCount++
      } else if (plan.status === PRODUCTION_STATUS.PAUSED) {
        acc.pausedCount++
      }
      
      return acc
    }, {
      totalPlanned: 0,
      totalActual: 0,
      totalEfficiency: 0,
      planCount: 0,
      completedCount: 0,
      inProgressCount: 0,
      pausedCount: 0
    })

    const recordStats = records.reduce((acc, record) => {
      acc.totalProduced += record.actual_quantity || 0
      acc.totalQualityIssues += record.quality_issues || 0
      acc.recordCount++
      
      if (record.status === PRODUCTION_STATUS.COMPLETED) {
        acc.completedCount++
      }
      
      return acc
    }, {
      totalProduced: 0,
      totalQualityIssues: 0,
      recordCount: 0,
      completedCount: 0
    })

    const avgEfficiency = planStats.planCount > 0 ? planStats.totalEfficiency / planStats.planCount : 0
    const qualityRate = recordStats.totalProduced > 0 ? 
      ((recordStats.totalProduced - recordStats.totalQualityIssues) / recordStats.totalProduced) * 100 : 0

    res.json({
      success: true,
      data: {
        period,
        plans: {
          total: planStats.planCount,
          completed: planStats.completedCount,
          inProgress: planStats.inProgressCount,
          paused: planStats.pausedCount,
          totalPlanned: planStats.totalPlanned,
          totalActual: planStats.totalActual,
          avgEfficiency: Math.round(avgEfficiency * 100) / 100
        },
        records: {
          total: recordStats.recordCount,
          completed: recordStats.completedCount,
          totalProduced: recordStats.totalProduced,
          totalQualityIssues: recordStats.totalQualityIssues,
          qualityRate: Math.round(qualityRate * 100) / 100
        }
      },
      message: '获取生产统计成功'
    })
  } catch (error) {
    console.error('获取生产统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取生产统计失败',
      error: error.message
    })
  }
} 