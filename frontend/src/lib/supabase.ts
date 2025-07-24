import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 认证相关工具函数
export const auth = {
  // 注册
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // 登录
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 获取当前会话
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 监听认证状态变化
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // 重置密码
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  // 更新密码
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    return { data, error }
  },

  // 更新用户信息
  updateProfile: async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  }
}

// 数据库操作工具函数
export const db = {
  // 获取企业列表
  getEnterprises: async () => {
    const { data, error } = await supabase
      .from('enterprises')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 获取设备列表
  getDevices: async (filters?: any) => {
    let query = supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(name, factory:factories(name, enterprise:enterprises(name))),
        device_type:device_types(name, category)
      `)

    if (filters?.workshop_id) {
      query = query.eq('workshop_id', filters.workshop_id)
    }
    if (filters?.device_type_id) {
      query = query.eq('device_type_id', filters.device_type_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  // 获取实时数据
  getRealtimeData: async (deviceId: string, limit = 100) => {
    const { data, error } = await supabase
      .from('realtime_data')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // 订阅实时数据变化
  subscribeToRealtimeData: (deviceId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`realtime_data_${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'realtime_data',
          filter: `device_id=eq.${deviceId}`
        },
        callback
      )
      .subscribe()
  },

  // 订阅设备状态变化
  subscribeToDeviceStatus: (deviceId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`device_status_${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
          filter: `id=eq.${deviceId}`
        },
        callback
      )
      .subscribe()
  },

  // 订阅报警信息
  subscribeToAlarms: (enterpriseId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`alarms_${enterpriseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alarms',
          filter: `enterprise_id=eq.${enterpriseId}`
        },
        callback
      )
      .subscribe()
  }
}

// 文件存储工具函数
export const storage = {
  // 上传文件
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  // 获取文件URL
  getFileUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // 删除文件
  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { data, error }
  },

  // 列出文件
  listFiles: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)
    return { data, error }
  }
}

export default supabase

// 类型定义
export interface Workshop {
  id: string
  name: string
  description?: string
  floor_plan_url?: string
  width?: number
  height?: number
  created_at: string
  updated_at: string
}

export interface Device {
  id: string
  workshop_id: string
  name: string
  model?: string
  type: string
  axes_count: number
  position_x?: number
  position_y?: number
  rotation?: number
  image_url?: string
  status: any
  parameters: any
  created_at: string
  updated_at: string
  workshop?: {
    name: string
    description?: string
  }
}

export interface RealtimeData {
  id: string
  device_id: string
  data_type: string
  value: any
  timestamp: string
}

export interface DeviceStatusHistory {
  id: string
  device_id: string
  status: any
  timestamp: string
} 