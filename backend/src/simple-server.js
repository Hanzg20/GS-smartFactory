import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartFactory Studio Backend',
    timestamp: new Date().toISOString(),
    version: '1.0',
    uptime: process.uptime()
  });
});

// --- Mock Data ---
const mockDevices = [
  {
    id: 1,
    name: 'CNC机床-01',
    type: 'CNC',
    status: 'running',
    position: { x: 100 },
    temperature: 45.5,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 2,
    name: '机器人-01',
    type: 'Robot',
    status: 'idle',
    position: { x: 300 },
    temperature: 38.2,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 3,
    name: '传送带-01',
    type: 'Conveyor',
    status: 'running',
    speed: 2.5,
    temperature: 42.1,
    lastUpdate: new Date().toISOString()
  }
];

app.get('/api/devices', (req, res) => {
  res.json({
    success: true,
    data: mockDevices,
    total: mockDevices.length
  });
});

app.get('/api/devices/:id', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const device = mockDevices.find(d => d.id === deviceId);
  if (!device) {
    return res.status(404).json({ success: false, message: '设备未找到' });
  }
  res.json({ success: true, data: device });
});

const mockAlarms = [
  {
    id: 1,
    deviceId: 1,
    type: 'warning',
    message: '温度过高',
    timestamp: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 2,
    deviceId: 2,
    type: 'error',
    message: '通信异常',
    timestamp: new Date().toISOString(),
    status: 'resolved'
  }
];

app.get('/api/alarms', (req, res) => {
  res.json({ success: true, data: mockAlarms, total: mockAlarms.length });
});

const mockProduction = [
  {
    id: 1,
    productName: '零件A',
    quantity: 150,
    completed: 120,
    status: 'running',
    startTime: new Date(Date.now() - 3600 * 1000).toISOString(),
    estimatedEndTime: new Date(Date.now() + 1800 * 1000).toISOString()
  }
];

app.get('/api/production', (req, res) => {
  res.json({ success: true, data: mockProduction, total: mockProduction.length });
});

app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    data: {
      totalDevices: mockDevices.length,
      runningDevices: mockDevices.filter(d => d.status === 'running').length,
      activeAlarms: mockAlarms.filter(a => a.status === 'active').length,
      productionLines: mockProduction.length,
      systemUptime: process.uptime(),
      lastUpdate: new Date().toISOString()
    }
  });
});

io.on('connection', (socket) => {
  console.log('🔌 客户端连接:', socket.id);

  // 发送实时数据
  const sendRealTimeData = () => {
    const realTimeData = {
      devices: mockDevices.map(device => ({
        id: device.id,
        status: device.status,
        position: device.position,
        temperature: device.temperature,
        lastUpdate: new Date().toISOString()
      })),
      alarms: mockAlarms.filter(alarm => alarm.status === 'active'),
      production: mockProduction,
      timestamp: new Date().toISOString()
    };
    socket.emit('real_time_data', realTimeData);
  };

  sendRealTimeData();
  const interval = setInterval(sendRealTimeData, 5000);

  socket.on('device_command', (data) => {
    const { deviceId, command } = data;
    const device = mockDevices.find(d => d.id === deviceId);
    if (device) {
      if (command === 'enable') {
        device.status = 'running';
      } else if (command === 'disable') {
        device.status = 'idle';
      }
      io.emit('device_status_update', {
        deviceId,
        status: device.status,
        timestamp: new Date().toISOString()
      });
    }
    socket.emit('command_result', {
      deviceId,
      command,
      success: true,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 客户端断开连接:', socket.id);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log('🚀 SmartFactory Studio 简化后端服务启动成功!');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('📊 模拟数据已加载');
}); 