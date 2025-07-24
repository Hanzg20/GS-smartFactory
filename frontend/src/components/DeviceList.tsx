import React, { useEffect, useState } from 'react'
import { useDeviceStore } from '../stores/device-store'
import { toast } from 'react-hot-toast'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { Loader2, RefreshCw } from 'lucide-react'
import { DeviceForm } from './DeviceForm'

interface Device {
  id: string;
  name: string;
  type: string;
  model: string;
  status: {
    online: boolean;
    running: boolean;
    alarm: boolean;
  };
  metrics?: {
    temperature: number;
    pressure: number;
    speed: number;
    runtime: number;
  };
}

interface DeviceListProps {
  onDeviceSelect?: (device: Device) => void;
  onAddDevice?: () => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ onDeviceSelect, onAddDevice }) => {
  const { devices, loading: storeLoading, fetchDevices, deleteDevice } = useDeviceStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<any>(null)

  // 使用错误处理hook
  const {
    execute: executeFetch,
    isError: isFetchError,
    retry: retryFetch
  } = useErrorHandler(fetchDevices, {
    fallbackMessage: '加载设备列表失败',
    maxRetries: 3
  })

  const {
    execute: executeDelete,
    isError: isDeleteError,
    retry: retryDelete
  } = useErrorHandler(deleteDevice, {
    fallbackMessage: '删除设备失败',
    maxRetries: 1
  })

  useEffect(() => {
    executeFetch()
  }, [executeFetch])

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'status-online'
      case 'offline': return 'status-offline'
      case 'warning': return 'status-warning'
      case 'maintenance': return 'status-maintenance'
      default: return 'status-offline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '在线'
      case 'offline': return '离线'
      case 'warning': return '警告'
      case 'maintenance': return '维护中'
      default: return '未知'
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm('确定要删除这个设备吗？')) {
      try {
        await executeDelete(deviceId)
        toast.success('设备删除成功')
      } catch (error) {
        // 错误已经由hook处理
      }
    }
  }

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (isFetchError) {
    return (
      <div className="tech-card p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">加载设备列表失败</p>
          <button
            onClick={() => retryFetch()}
            className="btn-primary inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="搜索设备..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="tech-input flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="tech-input w-32"
        >
          <option value="all">全部</option>
          <option value="online">在线</option>
          <option value="offline">离线</option>
          <option value="maintenance">维护中</option>
        </select>
      </div>

      {/* 设备列表 */}
      <div className="space-y-4">
        {filteredDevices.length === 0 ? (
          <div className="tech-card p-6 text-center text-slate-400">
            没有找到匹配的设备
          </div>
        ) : (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              className="tech-card tech-card-hover p-4 cursor-pointer"
              onClick={() => onDeviceSelect?.(device)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`status-indicator ${getStatusColor(device.status)}`} />
                  <div>
                    <h3 className="font-medium text-slate-200">{device.name}</h3>
                    <p className="text-sm text-slate-400">{device.type}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteDevice(device.id)
                  }}
                  className="btn-danger text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加设备按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="btn-primary w-full"
      >
        添加新设备
      </button>

      {/* 添加设备模态框 */}
      {showAddModal && (
        <DeviceForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            executeFetch()
          }}
        />
      )}
    </div>
  )
} 