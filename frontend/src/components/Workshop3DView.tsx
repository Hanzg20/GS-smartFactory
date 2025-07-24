import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface Workshop3DViewProps {
  deviceId?: string;
}

export const Workshop3DView: React.FC<Workshop3DViewProps> = ({ deviceId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(deviceId || null);

  // 优化：使用useCallback缓存函数
  const drawScene = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    try {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 绘制背景网格
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = 0; x < ctx.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < ctx.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
      }

      // 模拟设备数据
      const devices = [
        { id: 'device1', x: 100, y: 150, name: 'CNC机床', status: 'online', type: 'cnc' },
        { id: 'device2', x: 300, y: 150, name: '机器人', status: 'online', type: 'robot' },
        { id: 'device3', x: 500, y: 150, name: '传送带', status: 'warning', type: 'conveyor' },
        { id: 'device4', x: 100, y: 350, name: '检测设备', status: 'offline', type: 'sensor' },
        { id: 'device5', x: 300, y: 350, name: '包装机', status: 'maintenance', type: 'packager' },
        { id: 'device6', x: 500, y: 350, name: '存储系统', status: 'online', type: 'storage' }
      ];

      // 绘制设备
      devices.forEach(device => {
        const isSelected = selectedDevice === device.id;
        const isHighlighted = deviceId === device.id;

        // 设备主体
        ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = isSelected ? 'rgba(59, 130, 246, 1)' : 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = isSelected ? 3 : 1;

        // 根据设备类型绘制不同形状
        switch (device.type) {
          case 'cnc':
            // CNC机床 - 矩形
            ctx.fillRect(device.x - 40, device.y - 30, 80, 60);
            ctx.strokeRect(device.x - 40, device.y - 30, 80, 60);
            break;
          case 'robot':
            // 机器人 - 圆形
            ctx.beginPath();
            ctx.arc(device.x, device.y, 30, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            break;
          case 'conveyor':
            // 传送带 - 长矩形
            ctx.fillRect(device.x - 50, device.y - 15, 100, 30);
            ctx.strokeRect(device.x - 50, device.y - 15, 100, 30);
            break;
          case 'sensor':
            // 传感器 - 小圆形
            ctx.beginPath();
            ctx.arc(device.x, device.y, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            break;
          case 'packager':
            // 包装机 - 六边形
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const x = device.x + 25 * Math.cos(angle);
              const y = device.y + 25 * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
          default:
            // 存储系统 - 大矩形
            ctx.fillRect(device.x - 45, device.y - 35, 90, 70);
            ctx.strokeRect(device.x - 45, device.y - 35, 90, 70);
        }

        // 状态指示器
        const statusColors = {
          online: 'rgba(34, 197, 94, 1)',
          offline: 'rgba(239, 68, 68, 1)',
          warning: 'rgba(234, 179, 8, 1)',
          maintenance: 'rgba(147, 51, 234, 1)'
        };

        ctx.fillStyle = statusColors[device.status as keyof typeof statusColors] || 'rgba(148, 163, 184, 1)';
        ctx.beginPath();
        ctx.arc(device.x + 35, device.y - 25, 6, 0, 2 * Math.PI);
        ctx.fill();

        // 设备名称
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(device.name, device.x, device.y + 50);

        // 高亮效果
        if (isHighlighted) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(device.x - 50, device.y - 40, 100, 80);
          ctx.setLineDash([]);
        }
      });

      // 绘制连接线
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);

      // 连接设备
      const connections = [
        ['device1', 'device2'],
        ['device2', 'device3'],
        ['device4', 'device5'],
        ['device5', 'device6']
      ];

      connections.forEach(([from, to]) => {
        const fromDevice = devices.find(d => d.id === from);
        const toDevice = devices.find(d => d.id === to);
        if (fromDevice && toDevice) {
          ctx.beginPath();
          ctx.moveTo(fromDevice.x, fromDevice.y);
          ctx.lineTo(toDevice.x, toDevice.y);
          ctx.stroke();
        }
      });

      ctx.setLineDash([]);

      // 绘制数据流动画
      connections.forEach(([from, to], index) => {
        const fromDevice = devices.find(d => d.id === from);
        const toDevice = devices.find(d => d.id === to);
        if (fromDevice && toDevice) {
          const progress = (time + index * 0.5) % 1;
          const x = fromDevice.x + (toDevice.x - fromDevice.x) * progress;
          const y = fromDevice.y + (toDevice.y - fromDevice.y) * progress;

          ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    } catch (err) {
      console.error('绘制场景错误:', err);
      setError('绘制3D场景时发生错误');
    }
  }, [deviceId, selectedDevice]);

  // 优化：使用useCallback缓存函数
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('浏览器不支持Canvas');
      return;
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let startTime = Date.now();
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001;
      drawScene(ctx, time);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoading, drawScene, handleResize]);

  useEffect(() => {
    // 模拟3D场景加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeviceClick = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId);
    toast.success(`已选择设备: ${deviceId}`);
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">正在加载3D场景...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // 检测设备点击
          const devices = [
            { id: 'device1', x: 100, y: 150 },
            { id: 'device2', x: 300, y: 150 },
            { id: 'device3', x: 500, y: 150 },
            { id: 'device4', x: 100, y: 350 },
            { id: 'device5', x: 300, y: 350 },
            { id: 'device6', x: 500, y: 350 }
          ];

          devices.forEach(device => {
            const distance = Math.sqrt((x - device.x) ** 2 + (y - device.y) ** 2);
            if (distance < 40) {
              handleDeviceClick(device.id);
            }
          });
        }}
      />
      
      {/* 设备列表 */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-300 mb-2">设备列表</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'device1', name: 'CNC机床', status: 'online' },
            { id: 'device2', name: '机器人', status: 'online' },
            { id: 'device3', name: '传送带', status: 'warning' },
            { id: 'device4', name: '检测设备', status: 'offline' },
            { id: 'device5', name: '包装机', status: 'maintenance' },
            { id: 'device6', name: '存储系统', status: 'online' }
          ].map(device => (
            <button
              key={device.id}
              onClick={() => handleDeviceClick(device.id)}
              className={`p-3 rounded-lg text-left transition-all duration-300 ${
                selectedDevice === device.id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'bg-slate-700/50 hover:bg-slate-600/50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${
                  device.status === 'online' ? 'bg-green-500' :
                  device.status === 'offline' ? 'bg-red-500' :
                  device.status === 'warning' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}></div>
                <span className="text-white text-sm font-medium">{device.name}</span>
              </div>
              <p className="text-slate-400 text-xs">
                {device.status === 'online' ? '在线' :
                 device.status === 'offline' ? '离线' :
                 device.status === 'warning' ? '警告' : '维护中'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workshop3DView; 