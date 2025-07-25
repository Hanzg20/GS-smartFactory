import React from 'react';
import { Device, Workshop, DeviceStatus } from '../types/common';

interface WorkshopFloorPlanProps {
  workshop?: Workshop | null;
  onDeviceSelect?: (device: Device | null) => void;
}

const WorkshopFloorPlan: React.FC<WorkshopFloorPlanProps> = ({ 
  workshop, 
  onDeviceSelect 
}) => {
  // 如果没有车间数据，显示加载状态
  if (!workshop) {
    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '600px', 
        backgroundColor: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">正在加载车间数据...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#52c41a';
      case 'maintenance': return '#faad14';
      case 'fault': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'running': return '运行';
      case 'maintenance': return '维护';
      case 'fault': return '故障';
      default: return '空闲';
    }
  };

  // 确保 devices 存在，如果不存在使用空数组
  const devices = workshop.devices || [];

  const deviceStats = devices.reduce((acc, device) => {
    const status = device.status?.running ? 'running' :
                  device.status?.alarm ? 'fault' :
                  device.status?.online ? 'idle' : 'maintenance';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '600px', 
      backgroundColor: '#1a1a1a',
      border: '2px solid #333',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <style>{`
        .device-marker {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }
        .device-marker:hover {
          transform: scale(1.2);
          border-width: 3px;
          z-index: 20;
        }
        .device-marker .tooltip {
          position: absolute;
          bottom: 45px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .device-marker:hover .tooltip {
          opacity: 1;
        }
      `}</style>
      
      {/* 车间区域划分 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        height: '150px',
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        border: '1px dashed #444',
        borderRadius: '4px'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '200px',
        left: '20px',
        right: '20px',
        bottom: '80px',
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        border: '1px dashed #444',
        borderRadius: '4px'
      }}></div>

      {/* 设备标记 */}
      {devices.map((device) => {
        const status = device.status?.running ? 'running' :
                      device.status?.alarm ? 'fault' :
                      device.status?.online ? 'idle' : 'maintenance';
        
        return (
          <div
            key={device.id}
            className="device-marker"
            style={{
              left: `${device.x || Math.random() * 500 + 50}px`,
              top: `${device.y || Math.random() * 400 + 50}px`,
              backgroundColor: getStatusColor(status)
            }}
            onClick={() => onDeviceSelect?.(device)}
          >
            {device.id.slice(-1)}
            <div className="tooltip">
              {device.name}<br/>
              状态: {getStatusName(status)}
            </div>
          </div>
        );
      })}

      {/* 状态统计 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '12px',
        minWidth: '120px'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#52c41a' }}>●</span> 运行: {deviceStats.running || 0}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#faad14' }}>●</span> 维护: {deviceStats.maintenance || 0}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#ff4d4f' }}>●</span> 故障: {deviceStats.fault || 0}
        </div>
        <div>
          <span style={{ color: '#d9d9d9' }}>●</span> 空闲: {deviceStats.idle || 0}
        </div>
      </div>

      {/* 车间标题 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        {workshop.name || '智能制造车间'} - 实时监控
      </div>
    </div>
  );
};

export default WorkshopFloorPlan; 