import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface DataPoint {
  timestamp: number;
  value: number;
}

interface DataMonitorProps {
  deviceId: string;
}

export const DataMonitor: React.FC<DataMonitorProps> = ({ deviceId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{
    temperature: DataPoint[];
    pressure: DataPoint[];
    speed: DataPoint[];
  }>({
    temperature: [],
    pressure: [],
    speed: []
  });

  // WebSocket连接
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      newSocket.emit('subscribe_device', deviceId);
      toast.success('已连接到数据监控服务');
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
      setError('无法连接到数据监控服务');
      toast.error('数据监控连接失败');
    });

    newSocket.on('device_data', (newData) => {
      if (newData.deviceId === deviceId) {
        const timestamp = Date.now();
        setData(prev => ({
          temperature: [...prev.temperature.slice(-50), { timestamp, value: newData.data.temperature }],
          pressure: [...prev.pressure.slice(-50), { timestamp, value: newData.data.pressure }],
          speed: [...prev.speed.slice(-50), { timestamp, value: newData.data.speed }]
        }));
        setLoading(false);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('数据监控连接断开');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('unsubscribe_device', deviceId);
        newSocket.close();
      }
    };
  }, [deviceId]);

  // 绘制图表
  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawChart = () => {
      const width = canvas.width;
      const height = canvas.height;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 绘制背景网格
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;

      // 横向网格线
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // 纵向网格线
      for (let i = 0; i <= 10; i++) {
        const x = padding + (chartWidth / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }

      // 绘制数据线
      const drawLine = (points: DataPoint[], color: string) => {
        if (points.length < 2) return;

        const minTime = points[0].timestamp;
        const maxTime = points[points.length - 1].timestamp;
        const timeRange = maxTime - minTime;

        const values = points.map(p => p.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue || 1;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        points.forEach((point, i) => {
          const x = padding + (chartWidth * (point.timestamp - minTime)) / timeRange;
          const y = height - padding - (chartHeight * (point.value - minValue)) / valueRange;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      };

      // 绘制三种数据线
      drawLine(data.temperature, 'rgba(239, 68, 68, 0.8)'); // 红色 - 温度
      drawLine(data.pressure, 'rgba(59, 130, 246, 0.8)'); // 蓝色 - 压力
      drawLine(data.speed, 'rgba(34, 197, 94, 0.8)'); // 绿色 - 速度
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawChart();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const interval = setInterval(drawChart, 1000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(interval);
    };
  }, [data, loading]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">正在加载数据...</p>
        </div>
      </div>
    );
  }

  const getLatestValue = (dataPoints: DataPoint[]) => {
    return dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0;
  };

  return (
    <div className="data-monitor space-y-6">
      {/* 实时数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="tech-stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">温度</span>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
          <span className="text-2xl font-bold text-white">
            {getLatestValue(data.temperature).toFixed(1)}°C
          </span>
        </div>
        <div className="tech-stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">压力</span>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <span className="text-2xl font-bold text-white">
            {getLatestValue(data.pressure).toFixed(2)} MPa
          </span>
        </div>
        <div className="tech-stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">速度</span>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-2xl font-bold text-white">
            {getLatestValue(data.speed).toFixed(0)} RPM
          </span>
        </div>
      </div>

      {/* 图表 */}
      <div className="relative bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">实时趋势</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-400 text-sm">温度</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-400 text-sm">压力</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-400 text-sm">速度</span>
            </div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-64 bg-slate-900/50 rounded-lg"
        />
      </div>

      {/* 连接状态 */}
      <div className={`flex items-center justify-between p-4 rounded-lg ${
        isConnected ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'
      }`}>
        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnected ? '数据监控已连接' : '数据监控未连接'}
        </span>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
      </div>
    </div>
  );
};

export default DataMonitor; 