import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Device {
  id: string;
  name: string;
  type: 'CNC' | 'Robot' | 'Conveyor' | 'Inspection';
  position: {
    x: number;
    y: number;
    rotation: number;
  };
  status: {
    online: boolean;
    running: boolean;
    alarm: boolean;
  };
}

interface Workshop {
  id: string;
  name: string;
  width: number;
  height: number;
  devices: Device[];
}

interface WorkshopFloorPlanProps {
  workshop: Workshop;
  onDeviceSelect: (device: Device) => void;
}

const WorkshopFloorPlan: React.FC<WorkshopFloorPlanProps> = ({ workshop, onDeviceSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workshop || !workshop.devices) {
      setError('车间数据无效');
      return;
    }
    setError(null);
  }, [workshop]);

  const getDeviceColor = (device: Device) => {
    if (device.status.alarm) return '#ef4444'; // red
    if (!device.status.online) return '#6b7280'; // gray
    if (device.status.running) return '#10b981'; // green
    return '#f59e0b'; // yellow
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'CNC':
        return '🔧';
      case 'Robot':
        return '🤖';
      case 'Conveyor':
        return '📦';
      case 'Inspection':
        return '🔍';
      default:
        return '⚙️';
    }
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="workshop-floor-plan">
      <h3 className="text-lg font-semibold mb-4 text-white">{workshop.name} - 平面图</h3>
      
      <div className="relative bg-slate-800 rounded-lg overflow-hidden">
        <svg
          width="100%"
          height="400"
          viewBox={`0 0 ${workshop.width} ${workshop.height}`}
          className="bg-slate-900/50"
        >
          {/* 车间背景网格 */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 设备图标 */}
          {workshop.devices.map((device) => (
            <g
              key={device.id}
              transform={`translate(${device.position.x}, ${device.position.y}) rotate(${device.position.rotation})`}
              onClick={() => {
                onDeviceSelect(device);
                toast.success(`已选择设备: ${device.name}`);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {/* 设备状态指示圈 */}
              <circle
                cx="0"
                cy="0"
                r="25"
                fill={getDeviceColor(device)}
                opacity="0.2"
                stroke={getDeviceColor(device)}
                strokeWidth="2"
              />
              
              {/* 设备图标 */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="20"
                className="pointer-events-none select-none"
                fill="#fff"
              >
                {getDeviceIcon(device.type)}
              </text>
              
              {/* 设备名称 */}
              <text
                x="0"
                y="35"
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                className="pointer-events-none select-none"
              >
                {device.name}
              </text>
              
              {/* 状态指示点 */}
              <circle
                cx="15"
                cy="-15"
                r="3"
                fill={getDeviceColor(device)}
                className="pointer-events-none"
              />
            </g>
          ))}
          
          {/* 图例 */}
          <g transform="translate(20, 20)">
            <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#94a3b8">图例:</text>
            <circle cx="10" cy="15" r="3" fill="#10b981" />
            <text x="20" y="18" fontSize="10" fill="#94a3b8">运行中</text>
            <circle cx="10" cy="30" r="3" fill="#f59e0b" />
            <text x="20" y="33" fontSize="10" fill="#94a3b8">待机</text>
            <circle cx="10" cy="45" r="3" fill="#ef4444" />
            <text x="20" y="48" fontSize="10" fill="#94a3b8">报警</text>
            <circle cx="10" cy="60" r="3" fill="#6b7280" />
            <text x="20" y="63" fontSize="10" fill="#94a3b8">离线</text>
          </g>
        </svg>
      </div>
      
      {/* 设备状态列表 */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-300 mb-2">设备状态列表</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {workshop.devices.map((device) => (
            <div
              key={device.id}
              onClick={() => onDeviceSelect(device)}
              className="flex items-center p-2 bg-slate-800/50 border border-slate-700/50 rounded cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getDeviceColor(device) }}
              />
              <span className="flex-1 text-slate-300">{device.name}</span>
              <span className="text-xs text-slate-400">
                {device.status.running ? '运行中' : device.status.online ? '待机' : '离线'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopFloorPlan; 