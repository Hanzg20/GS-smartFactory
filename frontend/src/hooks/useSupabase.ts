import { useState, useEffect } from 'react'
import { supabase, type Workshop, type Device, type RealtimeData } from '../lib/supabase'

// 车间数据Hook
export function useWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setWorkshops(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取车间数据失败')
    } finally {
      setLoading(false)
    }
  }

  return { workshops, loading, error, refetch: fetchWorkshops }
}

// 设备数据Hook
export function useDevices(workshopId?: string) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [workshopId])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      let query = supabase
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
      setDevices(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取设备数据失败')
    } finally {
      setLoading(false)
    }
  }

  return { devices, loading, error, refetch: fetchDevices }
}

// 实时数据Hook
export function useRealtimeData(deviceId: string, dataType: string, limit = 100) {
  const [data, setData] = useState<RealtimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (deviceId && dataType) {
      fetchRealtimeData()
    }
  }, [deviceId, dataType])

  const fetchRealtimeData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('realtime_data')
        .select('*')
        .eq('device_id', deviceId)
        .eq('data_type', dataType)
        .order('timestamp', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      setData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取实时数据失败')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch: fetchRealtimeData }
}

// 设备状态更新Hook
export function useDeviceStatus() {
  const updateDeviceStatus = async (deviceId: string, status: any) => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新设备状态失败')
    }
  }

  return { updateDeviceStatus }
}

// 实时订阅Hook
export function useRealtimeSubscription() {
  useEffect(() => {
    // 设备状态变化订阅
    const deviceStatusChannel = supabase
      .channel('device_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices'
        },
        (payload) => {
          console.log('设备状态更新:', payload.new)
          // 这里可以触发状态更新回调
        }
      )
      .subscribe()

    // 实时数据订阅
    const realtimeDataChannel = supabase
      .channel('realtime_data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_data'
        },
        (payload) => {
          console.log('实时数据更新:', payload.new)
          // 这里可以触发数据更新回调
        }
      )
      .subscribe()

    return () => {
      deviceStatusChannel.unsubscribe()
      realtimeDataChannel.unsubscribe()
    }
  }, [])

  return {}
} 