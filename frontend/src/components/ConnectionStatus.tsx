import React from 'react'

interface ConnectionStatusProps {
  lastUpdate: Date
  isBackendConnected: boolean
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ lastUpdate, isBackendConnected }) => {
  const getStatusColor = () => {
    if (isBackendConnected) return 'bg-green-500'
    return 'bg-red-500'
  }
  const getStatusText = () => {
    if (isBackendConnected) return '已连接'
    return '未连接'
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">系统状态</h2>
      
      <div className="space-y-4">
        {/* 连接状态 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">后端连接</span>
          <div className="flex items-center">
            <span className={`status-indicator ${getStatusColor()}`}></span>
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        {/* 最后更新时间 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">最后更新</span>
          <span className="text-sm text-gray-500">
            {lastUpdate.toLocaleTimeString('zh-CN')}
          </span>
        </div>

        {/* 系统信息 */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">系统信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">版本</span>
              <span className="text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">运行时间</span>
              <span className="text-gray-900">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CPU使用率</span>
              <span className="text-gray-900">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">内存使用率</span>
              <span className="text-gray-900">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus 