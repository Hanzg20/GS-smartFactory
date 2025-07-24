import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { testConnection, getDatabaseStats } from './config/database.js'
import routes from './routes/index.js'
import { performanceMonitor, memoryMonitor, healthCheck } from './middleware/monitoring.js'
import { cacheMiddleware } from './middleware/cache.js'

// 加载环境变量
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 5000,
  transports: ['websocket', 'polling']
})

const PORT = process.env.PORT || 3001

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", process.env.FRONTEND_URL || "http://localhost:3000"]
    },
  },
}))

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests',
    message: '请求过于频繁，请稍后再试'
  }
})

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 500
})

app.use('/api/', limiter)
app.use('/api/', speedLimiter)

// 中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(memoryMonitor)
app.use(performanceMonitor)
app.use(morgan('combined'))
app.use(cacheMiddleware)

// API路由
app.use('/api', routes)

// 健康检查端点
app.get('/health', healthCheck)

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('🔌 客户端连接:', socket.id)

  // 错误处理
  socket.on('error', (error) => {
    console.error('Socket错误:', error)
  })

  // 订阅设备实时数据
  socket.on('subscribe_device', (deviceId) => {
    socket.join(`device_${deviceId}`)
    console.log(`📡 订阅设备 ${deviceId} 的实时数据`)
    
    // 发送初始数据
    io.to(`device_${deviceId}`).emit('device_data', {
      deviceId,
      timestamp: new Date().toISOString(),
      status: 'online',
      data: {
        temperature: Math.random() * 50 + 20,
        pressure: Math.random() * 5 + 1,
        speed: Math.random() * 100
      }
    })
  })

  // 取消订阅设备实时数据
  socket.on('unsubscribe_device', (deviceId) => {
    socket.leave(`device_${deviceId}`)
    console.log(`📡 取消订阅设备 ${deviceId} 的实时数据`)
  })

  // 订阅企业数据
  socket.on('subscribe_enterprise', (enterpriseId) => {
    socket.join(`enterprise_${enterpriseId}`)
    console.log(`📡 订阅企业 ${enterpriseId} 的数据`)
  })

  // 设备控制命令
  socket.on('device_command', (data) => {
    const { deviceId, command, parameters } = data
    console.log(`🎮 设备 ${deviceId} 收到命令:`, command, parameters)
    
    // 广播命令执行结果
    io.to(`device_${deviceId}`).emit('command_result', {
      deviceId,
      command,
      success: true,
      timestamp: new Date().toISOString()
    })
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('🔌 客户端断开连接:', socket.id)
  })
})

// 定时发送模拟数据
setInterval(() => {
  const devices = ['device1', 'device2', 'device3']
  devices.forEach(deviceId => {
    io.to(`device_${deviceId}`).emit('device_data', {
      deviceId,
      timestamp: new Date().toISOString(),
      status: 'online',
      data: {
        temperature: Math.random() * 50 + 20,
        pressure: Math.random() * 5 + 1,
        speed: Math.random() * 100
      }
    })
  })
}, 1000)

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err)
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
})

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    console.log('🔍 测试数据库连接...')
    const dbConnected = await testConnection()
    
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务器启动中止')
      process.exit(1)
    }

    // 获取数据库统计信息
    const stats = await getDatabaseStats()
    console.log('📊 数据库统计信息:', stats)

    server.listen(PORT, () => {
      console.log('🚀 SmartFactory Studio 后端服务启动成功!')
      console.log(`📍 服务地址: http://localhost:${PORT}`)
      console.log(`🔗 API文档: http://localhost:${PORT}/api/health`)
      console.log(`📡 WebSocket: ws://localhost:${PORT}`)
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...')
  server.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...')
  server.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})

// 启动服务器
startServer()

export { io } 