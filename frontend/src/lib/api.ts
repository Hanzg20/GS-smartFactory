import axios from 'axios'
import { supabase } from './supabase'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('获取认证token失败:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && data.session) {
          // 重新发送请求
          const originalRequest = error.config
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token刷新失败:', refreshError)
        // 跳转到登录页
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API类型定义
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  count?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 企业相关API
export const enterpriseApi = {
  // 获取企业列表
  getEnterprises: () => api.get<ApiResponse>('/enterprises'),
  
  // 获取单个企业
  getEnterprise: (id: string) => api.get<ApiResponse>(`/enterprises/${id}`),
  
  // 创建企业
  createEnterprise: (data: any) => api.post<ApiResponse>('/enterprises', data),
  
  // 更新企业
  updateEnterprise: (id: string, data: any) => api.put<ApiResponse>(`/enterprises/${id}`, data),
  
  // 删除企业
  deleteEnterprise: (id: string) => api.delete<ApiResponse>(`/enterprises/${id}`),
  
  // 获取企业统计
  getEnterpriseStats: (id: string) => api.get<ApiResponse>(`/enterprises/${id}/stats`),
}

// 设备相关API
export const deviceApi = {
  // 获取设备列表
  getDevices: (params?: any) => api.get<ApiResponse>('/devices', { params }),
  
  // 获取单个设备
  getDevice: (id: string) => api.get<ApiResponse>(`/devices/${id}`),
  
  // 创建设备
  createDevice: (data: any) => api.post<ApiResponse>('/devices', data),
  
  // 更新设备
  updateDevice: (id: string, data: any) => api.put<ApiResponse>(`/devices/${id}`, data),
  
  // 删除设备
  deleteDevice: (id: string) => api.delete<ApiResponse>(`/devices/${id}`),
  
  // 获取设备状态
  getDeviceStatus: (id: string) => api.get<ApiResponse>(`/devices/${id}/status`),
  
  // 更新设备状态
  updateDeviceStatus: (id: string, data: any) => api.put<ApiResponse>(`/devices/${id}/status`, data),
  
  // 获取设备类型
  getDeviceTypes: () => api.get<ApiResponse>('/device-types'),
}

// 实时数据API
export const realtimeApi = {
  // 获取实时数据
  getRealtimeData: (deviceId: string) => api.get<ApiResponse>(`/realtime/${deviceId}`),
}

// 通用API
export const commonApi = {
  // 健康检查
  healthCheck: () => api.get<ApiResponse>('/health'),
  
  // 上传文件
  uploadFile: (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return api.post<ApiResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// 错误处理工具
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return '未知错误'
}

export default api 