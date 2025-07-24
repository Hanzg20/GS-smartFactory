import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useDeviceStore } from '../stores/device-store'

interface DeviceFormProps {
  device?: any
  onClose: () => void
  onSuccess: () => void
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ device, onClose, onSuccess }) => {
  const { createDevice, updateDevice } = useDeviceStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: device?.name || '',
    type: device?.type || '',
    location: device?.location || '',
    ip_address: device?.ip_address || '',
    serial_number: device?.serial_number || '',
    manufacturer: device?.manufacturer || '',
    model: device?.model || '',
    status: device?.status || 'offline',
    parameters: device?.parameters || {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const deviceTypes = [
    { id: 'cnc', name: 'CNC机床', icon: '🔧' },
    { id: 'robot', name: '工业机器人', icon: '🤖' },
    { id: 'conveyor', name: '传送带', icon: '📦' },
    { id: 'sensor', name: '传感器', icon: '📡' },
    { id: 'packager', name: '包装机', icon: '📦' },
    { id: 'storage', name: '存储系统', icon: '🗄️' },
    { id: 'inspection', name: '检测设备', icon: '🔍' },
    { id: 'other', name: '其他', icon: '⚙️' }
  ]

  const statusOptions = [
    { id: 'online', name: '在线', color: 'text-green-400' },
    { id: 'offline', name: '离线', color: 'text-red-400' },
    { id: 'maintenance', name: '维护中', color: 'text-purple-400' },
    { id: 'warning', name: '警告', color: 'text-yellow-400' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '设备名称不能为空'
    }

    if (!formData.type) {
      newErrors.type = '请选择设备类型'
    }

    if (!formData.ip_address.trim()) {
      newErrors.ip_address = 'IP地址不能为空'
    } else {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(formData.ip_address)) {
        newErrors.ip_address = '请输入有效的IP地址'
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = '安装位置不能为空'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('请检查表单错误')
      return
    }

    setLoading(true)
    try {
      if (device) {
        await updateDevice(device.id, formData)
        toast.success('设备更新成功')
      } else {
        await createDevice(formData)
        toast.success('设备创建成功')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const generateSerialNumber = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    const serial = `DEV-${timestamp.toUpperCase()}-${random.toUpperCase()}`
    setFormData(prev => ({ ...prev, serial_number: serial }))
  }

  const generateIPAddress = () => {
    const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    setFormData(prev => ({ ...prev, ip_address: ip }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="tech-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">{device ? '✏️' : '➕'}</span>
            {device ? '编辑设备' : '添加设备'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                设备名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`tech-input w-full ${errors.name ? 'border-red-500/50' : ''}`}
                placeholder="请输入设备名称"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                设备类型 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`tech-input w-full ${errors.type ? 'border-red-500/50' : ''}`}
              >
                <option value="">请选择设备类型</option>
                {deviceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-400 text-xs mt-1">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                安装位置 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`tech-input w-full ${errors.location ? 'border-red-500/50' : ''}`}
                placeholder="例如：车间A-01"
              />
              {errors.location && (
                <p className="text-red-400 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                IP地址 <span className="text-red-400">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.ip_address}
                  onChange={(e) => handleInputChange('ip_address', e.target.value)}
                  className={`tech-input flex-1 ${errors.ip_address ? 'border-red-500/50' : ''}`}
                  placeholder="192.168.1.100"
                />
                <button
                  type="button"
                  onClick={generateIPAddress}
                  className="btn-secondary px-3 text-xs"
                >
                  生成
                </button>
              </div>
              {errors.ip_address && (
                <p className="text-red-400 text-xs mt-1">{errors.ip_address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                序列号
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                  className="tech-input flex-1"
                  placeholder="设备序列号"
                />
                <button
                  type="button"
                  onClick={generateSerialNumber}
                  className="btn-secondary px-3 text-xs"
                >
                  生成
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                设备状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="tech-input w-full"
              >
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                制造商
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="tech-input w-full"
                placeholder="设备制造商"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                型号
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="tech-input w-full"
                placeholder="设备型号"
              />
            </div>
          </div>

          {/* 设备参数 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              设备参数
            </label>
            <textarea
              value={JSON.stringify(formData.parameters, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value)
                  setFormData(prev => ({ ...prev, parameters: params }))
                } catch (error) {
                  // 忽略JSON解析错误
                }
              }}
              className="tech-input w-full h-32 font-mono text-sm"
              placeholder='{
  "max_speed": 1000,
  "precision": 0.01,
  "power": 5.5
}'
            />
            <p className="text-slate-400 text-xs mt-1">请输入有效的JSON格式参数</p>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {device ? '更新中...' : '创建中...'}
                </div>
              ) : (
                device ? '更新设备' : '创建设备'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 