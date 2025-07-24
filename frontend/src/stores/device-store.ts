import { create } from 'zustand'
import { deviceApi } from '../lib/api'

interface Device {
  id: string
  workshop_id: string
  device_type_id?: string
  name: string
  model?: string
  serial_number?: string
  manufacturer?: string
  installation_date?: string
  warranty_expiry?: string
  axes_count: number
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  image_url?: string
  model_3d_url?: string
  status: {
    online: boolean
    running: boolean
    alarm: boolean
  }
  parameters: any
  specifications: any
  maintenance_info: any
  settings: any
  created_at: string
  updated_at: string
  workshop?: {
    name: string
    factory?: {
      name: string
      enterprise?: {
        name: string
      }
    }
  }
  device_type?: {
    name: string
    category: string
  }
}

interface DeviceState {
  devices: Device[]
  selectedDevice: Device | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchDevices: (filters?: any) => Promise<void>
  fetchDevice: (id: string) => Promise<void>
  createDevice: (data: any) => Promise<void>
  updateDevice: (id: string, data: any) => Promise<void>
  deleteDevice: (id: string) => Promise<void>
  setSelectedDevice: (device: Device | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetError: () => void
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,

  fetchDevices: async (filters?: any) => {
    set({ loading: true, error: null })
    try {
      const response = await deviceApi.getDevices(filters)
      set({
        devices: response.data.data || [],
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '获取设备列表失败',
        loading: false
      })
    }
  },

  fetchDevice: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await deviceApi.getDevice(id)
      set({
        selectedDevice: response.data.data,
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '获取设备详情失败',
        loading: false
      })
    }
  },

  createDevice: async (data: any) => {
    set({ loading: true, error: null })
    try {
      const response = await deviceApi.createDevice(data)
      const newDevice = response.data.data
      
      set(state => ({
        devices: [newDevice, ...state.devices],
        loading: false
      }))
      
      return newDevice
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '创建设备失败',
        loading: false
      })
      throw error
    }
  },

  updateDevice: async (id: string, data: any) => {
    set({ loading: true, error: null })
    try {
      const response = await deviceApi.updateDevice(id, data)
      const updatedDevice = response.data.data
      
      set(state => ({
        devices: state.devices.map(device => 
          device.id === id ? updatedDevice : device
        ),
        selectedDevice: state.selectedDevice?.id === id ? updatedDevice : state.selectedDevice,
        loading: false
      }))
      
      return updatedDevice
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '更新设备失败',
        loading: false
      })
      throw error
    }
  },

  deleteDevice: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await deviceApi.deleteDevice(id)
      
      set(state => ({
        devices: state.devices.filter(device => device.id !== id),
        selectedDevice: state.selectedDevice?.id === id ? null : state.selectedDevice,
        loading: false
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '删除设备失败',
        loading: false
      })
      throw error
    }
  },

  setSelectedDevice: (device: Device | null) => set({ selectedDevice: device }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  resetError: () => set({ error: null })
})) 