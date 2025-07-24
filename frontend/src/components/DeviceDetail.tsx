import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AxisControl } from './AxisControl';
import { DataMonitor } from './DataMonitor';
import { Workshop3DView } from './Workshop3DView';
import toast from 'react-hot-toast';

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

interface DeviceDetailProps {
  device: Device;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ device }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'control' | '3dview' | 'data'>('info');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState(device.metrics);

  // 实时数据订阅
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      // 订阅设备数据
      newSocket.emit('subscribe_device', device.id);
      toast.success('已连接到实时数据服务');
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
      setError('无法连接到实时数据服务');
      toast.error('实时数据连接失败');
    });

    newSocket.on('device_data', (data) => {
      if (data.deviceId === device.id) {
        setMetrics(data.data);
        setLoading(false);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('实时数据连接断开');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('unsubscribe_device', device.id);
        newSocket.close();
      }
    };
  }, [device.id]);

  // 发送控制命令
  const sendCommand = useCallback((command: string, parameters: any) => {
    if (!socket || !isConnected) {
      toast.error('未连接到控制服务');
      return;
    }

    socket.emit('device_command', {
      deviceId: device.id,
      command,
      parameters
    });

    toast.success('命令已发送');
  }, [socket, isConnected, device.id]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="device-detail space-y-6">
      {/* 设备状态卡片 */}
      <div className="tech-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white flex items-center space-x-3">
            <span>{device.name}</span>
            <div className={`w-3 h-3 rounded-full ${
              device.status.alarm ? 'bg-red-500' :
              !device.status.online ? 'bg-gray-500' :
              device.status.running ? 'bg-green-500' :
              'bg-yellow-500'
            }`}></div>
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '实时数据已连接' : '实时数据未连接'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="tech-stat-card">
            <span className="text-slate-400">设备型号</span>
            <span className="text-white font-medium">{device.model}</span>
          </div>
          <div className="tech-stat-card">
            <span className="text-slate-400">设备类型</span>
            <span className="text-white font-medium">{device.type}</span>
          </div>
          <div className="tech-stat-card">
            <span className="text-slate-400">运行状态</span>
            <span className={`font-medium ${
              device.status.alarm ? 'text-red-400' :
              !device.status.online ? 'text-gray-400' :
              device.status.running ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {device.status.alarm ? '报警' :
               !device.status.online ? '离线' :
               device.status.running ? '运行中' :
               '待机'}
            </span>
          </div>
          <div className="tech-stat-card">
            <span className="text-slate-400">运行时间</span>
            <span className="text-white font-medium">
              {metrics?.runtime ? `${Math.floor(metrics.runtime / 3600)}小时` : '计算中...'}
            </span>
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex space-x-2">
        {[
          { id: 'info', label: '基本信息' },
          { id: 'control', label: '设备控制' },
          { id: '3dview', label: '3D视图' },
          { id: 'data', label: '数据监控' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 标签页内容 */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📊</span>
              实时数据
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="tech-stat-card">
                  <span className="text-slate-400">温度</span>
                  <span className="text-white font-medium">{metrics?.temperature.toFixed(1)}°C</span>
                </div>
                <div className="tech-stat-card">
                  <span className="text-slate-400">压力</span>
                  <span className="text-white font-medium">{metrics?.pressure.toFixed(2)} MPa</span>
                </div>
                <div className="tech-stat-card">
                  <span className="text-slate-400">速度</span>
                  <span className="text-white font-medium">{metrics?.speed.toFixed(0)} RPM</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'control' && (
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🎮</span>
              设备控制
            </h3>
            <AxisControl deviceId={device.id} onCommand={sendCommand} />
          </div>
        )}

        {activeTab === '3dview' && (
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              3D仿真视图
            </h3>
            <Workshop3DView deviceId={device.id} />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📈</span>
              数据监控
            </h3>
            <DataMonitor deviceId={device.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceDetail; 