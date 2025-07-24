import { supabase } from '../config/database.js'

// 获取企业列表
export const getEnterprises = async (req, res) => {
  try {
    const { data: enterprises, error } = await supabase
      .from('enterprises')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch enterprises',
        message: '获取企业列表失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: enterprises,
      count: enterprises.length
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 获取单个企业详情
export const getEnterprise = async (req, res) => {
  try {
    const { id } = req.params

    const { data: enterprise, error } = await supabase
      .from('enterprises')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Enterprise not found',
          message: '企业不存在'
        })
      }
      return res.status(500).json({
        error: 'Failed to fetch enterprise',
        message: '获取企业详情失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: enterprise
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 创建企业
export const createEnterprise = async (req, res) => {
  try {
    const {
      name,
      description,
      industry_type,
      address,
      contact_email,
      contact_phone,
      website,
      settings
    } = req.body

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        error: 'Name is required',
        message: '企业名称是必填项'
      })
    }

    const { data: enterprise, error } = await supabase
      .from('enterprises')
      .insert({
        name,
        description,
        industry_type,
        address,
        contact_email,
        contact_phone,
        website,
        settings: settings || {}
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        error: 'Failed to create enterprise',
        message: '创建企业失败',
        details: error.message
      })
    }

    res.status(201).json({
      success: true,
      data: enterprise,
      message: '企业创建成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 更新企业
export const updateEnterprise = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // 移除不允许更新的字段
    delete updateData.id
    delete updateData.created_at

    const { data: enterprise, error } = await supabase
      .from('enterprises')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Enterprise not found',
          message: '企业不存在'
        })
      }
      return res.status(500).json({
        error: 'Failed to update enterprise',
        message: '更新企业失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: enterprise,
      message: '企业更新成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 删除企业
export const deleteEnterprise = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('enterprises')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete enterprise',
        message: '删除企业失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      message: '企业删除成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 获取企业统计信息
export const getEnterpriseStats = async (req, res) => {
  try {
    const { id } = req.params

    // 获取工厂数量
    const { count: factoriesCount } = await supabase
      .from('factories')
      .select('*', { count: 'exact', head: true })
      .eq('enterprise_id', id)

    // 获取车间数量
    const { count: workshopsCount } = await supabase
      .from('workshops')
      .select('*', { count: 'exact', head: true })
      .eq('factory_id', id)

    // 获取设备数量
    const { count: devicesCount } = await supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', id)

    // 获取用户数量
    const { count: usersCount } = await supabase
      .from('user_enterprises')
      .select('*', { count: 'exact', head: true })
      .eq('enterprise_id', id)

    res.json({
      success: true,
      data: {
        factories: factoriesCount || 0,
        workshops: workshopsCount || 0,
        devices: devicesCount || 0,
        users: usersCount || 0
      }
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

export default {
  getEnterprises,
  getEnterprise,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
  getEnterpriseStats
} 