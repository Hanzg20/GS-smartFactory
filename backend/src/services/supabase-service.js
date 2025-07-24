import { createClient } from '@supabase/supabase-js'

export class SupabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    this.realtime = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  }

  // 车间管理
  async getWorkshops() {
    const { data, error } = await this.supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async getWorkshopById(id) {
    const { data, error } = await this.supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async createWorkshop(workshopData) {
    const { data, error } = await this.supabase
      .from('workshops')
      .insert(workshopData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateWorkshop(id, updates) {
    const { data, error } = await this.supabase
      .from('workshops')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteWorkshop(id) {
    const { error } = await this.supabase
      .from('workshops')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // 设备管理
  async getDevices(workshopId = null) {
    let query = this.supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(name, description)
      `)
    
    if (workshopId) {
      query = query.eq('workshop_id', workshopId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async getDeviceById(id) {
    const { data, error } = await this.supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(name, description)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async createDevice(deviceData) {
    const { data, error } = await this.supabase
      .from('devices')
      .insert(deviceData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateDevice(id, updates) {
    const { data, error } = await this.supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateDeviceStatus(id, status) {
    const { data, error } = await this.supabase
      .from('devices')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteDevice(id) {
    const { error } = await this.supabase
      .from('devices')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // 实时数据记录
  async recordRealtimeData(deviceId, dataType, value) {
    const { error } = await this.supabase
      .from('realtime_data')
      .insert({
        device_id: deviceId,
        data_type: dataType,
        value
      })
    
    if (error) throw error
  }

  async recordDeviceStatusHistory(deviceId, status) {
    const { error } = await this.supabase
      .from('device_status_history')
      .insert({
        device_id: deviceId,
        status
      })
    
    if (error) throw error
  }

  // 历史数据查询
  async getDeviceHistory(deviceId, startTime, endTime) {
    const { data, error } = await this.supabase
      .from('device_status_history')
      .select('*')
      .eq('device_id', deviceId)
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async getRealtimeData(deviceId, dataType, limit = 100) {
    const { data, error } = await this.supabase
      .from('realtime_data')
      .select('*')
      .eq('device_id', deviceId)
      .eq('data_type', dataType)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }

  // 实时订阅设置
  setupRealtimeSubscriptions(io) {
    // 设备状态变化订阅
    this.realtime
      .channel('device_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices'
        },
        (payload) => {
          io.emit('deviceStatusUpdate', payload.new)
        }
      )
      .subscribe()

    // 实时数据订阅
    this.realtime
      .channel('realtime_data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_data'
        },
        (payload) => {
          io.emit('realtimeDataUpdate', payload.new)
        }
      )
      .subscribe()

    // 车间数据变化订阅
    this.realtime
      .channel('workshop_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workshops'
        },
        (payload) => {
          io.emit('workshopUpdate', payload)
        }
      )
      .subscribe()
  }

  // 数据迁移辅助方法
  async migrateFromMemory(workshopData, deviceData) {
    try {
      // 迁移车间数据
      for (const workshop of workshopData) {
        await this.createWorkshop({
          id: workshop.id,
          name: workshop.name,
          description: workshop.description,
          floor_plan_url: workshop.floorPlan,
          width: workshop.width,
          height: workshop.height
        })
      }

      // 迁移设备数据
      for (const device of deviceData) {
        await this.createDevice({
          id: device.id,
          workshop_id: device.workshopId,
          name: device.name,
          model: device.model,
          type: device.type,
          axes_count: device.axes?.length || 0,
          position_x: device.position?.x,
          position_y: device.position?.y,
          rotation: device.position?.rotation,
          image_url: device.image,
          status: device.status,
          parameters: device.parameters
        })
      }

      return { success: true, message: '数据迁移完成' }
    } catch (error) {
      throw new Error(`数据迁移失败: ${error.message}`)
    }
  }

  // 健康检查
  async healthCheck() {
    try {
      const { data, error } = await this.supabase
        .from('workshops')
        .select('count')
        .limit(1)
      
      if (error) throw error
      return { status: 'healthy', database: 'connected' }
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected', error: error.message }
    }
  }
} 