import { supabase } from '../config/database.js'

// 获取设备列表
export const getDevices = async (req, res) => {
  try {
    const { workshop_id, device_type_id, status } = req.query

    let query = supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(name, factory:factories(name, enterprise:enterprises(name))),
        device_type:device_types(name, category)
      `)

    // 添加过滤条件
    if (workshop_id) {
      query = query.eq('workshop_id', workshop_id)
    }
    if (device_type_id) {
      query = query.eq('device_type_id', device_type_id)
    }
    if (status) {
      query = query.contains('status', { status })
    }

    const { data: devices, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch devices',
        message: '获取设备列表失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: devices,
      count: devices.length
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 获取单个设备详情
export const getDevice = async (req, res) => {
  try {
    const { id } = req.params

    const { data: device, error } = await supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(name, factory:factories(name, enterprise:enterprises(name))),
        device_type:device_types(name, category),
        device_axes(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Device not found',
          message: '设备不存在'
        })
      }
      return res.status(500).json({
        error: 'Failed to fetch device',
        message: '获取设备详情失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: device
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 创建设备
export const createDevice = async (req, res) => {
  try {
    const {
      workshop_id,
      device_type_id,
      name,
      model,
      serial_number,
      manufacturer,
      installation_date,
      warranty_expiry,
      axes_count,
      position_x,
      position_y,
      position_z,
      rotation_x,
      rotation_y,
      rotation_z,
      image_url,
      model_3d_url,
      status,
      parameters,
      specifications,
      maintenance_info,
      settings
    } = req.body

    // 验证必填字段
    if (!workshop_id || !name) {
      return res.status(400).json({
        error: 'Workshop ID and name are required',
        message: '车间ID和设备名称是必填项'
      })
    }

    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        workshop_id,
        device_type_id,
        name,
        model,
        serial_number,
        manufacturer,
        installation_date,
        warranty_expiry,
        axes_count: axes_count || 0,
        position_x: position_x || 0,
        position_y: position_y || 0,
        position_z: position_z || 0,
        rotation_x: rotation_x || 0,
        rotation_y: rotation_y || 0,
        rotation_z: rotation_z || 0,
        image_url,
        model_3d_url,
        status: status || { online: false, running: false, alarm: false },
        parameters: parameters || {},
        specifications: specifications || {},
        maintenance_info: maintenance_info || {},
        settings: settings || {}
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        error: 'Failed to create device',
        message: '创建设备失败',
        details: error.message
      })
    }

    res.status(201).json({
      success: true,
      data: device,
      message: '设备创建成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 更新设备
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // 移除不允许更新的字段
    delete updateData.id
    delete updateData.created_at

    const { data: device, error } = await supabase
      .from('devices')
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
          error: 'Device not found',
          message: '设备不存在'
        })
      }
      return res.status(500).json({
        error: 'Failed to update device',
        message: '更新设备失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: device,
      message: '设备更新成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 删除设备
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete device',
        message: '删除设备失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      message: '设备删除成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 获取设备实时状态
export const getDeviceStatus = async (req, res) => {
  try {
    const { id } = req.params

    // 获取设备基本信息
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, status, parameters')
      .eq('id', id)
      .single()

    if (deviceError) {
      return res.status(404).json({
        error: 'Device not found',
        message: '设备不存在'
      })
    }

    // 获取最新的实时数据
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('realtime_data')
      .select('*')
      .eq('device_id', id)
      .order('timestamp', { ascending: false })
      .limit(10)

    // 获取设备轴状态
    const { data: axes, error: axesError } = await supabase
      .from('device_axes')
      .select('*')
      .eq('device_id', id)

    res.json({
      success: true,
      data: {
        device,
        realtime_data: realtimeData || [],
        axes: axes || []
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

// 更新设备状态
export const updateDeviceStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, parameters } = req.body

    const { data: device, error } = await supabase
      .from('devices')
      .update({
        status: status || {},
        parameters: parameters || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        error: 'Failed to update device status',
        message: '更新设备状态失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: device,
      message: '设备状态更新成功'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器内部错误',
      details: error.message
    })
  }
}

// 获取设备类型列表
export const getDeviceTypes = async (req, res) => {
  try {
    const { data: deviceTypes, error } = await supabase
      .from('device_types')
      .select('*')
      .order('name')

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch device types',
        message: '获取设备类型失败',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: deviceTypes,
      count: deviceTypes.length
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
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceStatus,
  updateDeviceStatus,
  getDeviceTypes
} 