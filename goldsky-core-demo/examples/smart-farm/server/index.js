import express from 'express'
import { GoldskyServer } from '@goldsky/core'
import { agriculturePlugin } from '@goldsky/agriculture-plugin'

const app = express()
const port = process.env.PORT || 3001

// 创建 Goldsky 服务器实例
const goldskyServer = new GoldskyServer({
  plugins: [agriculturePlugin],
  database: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY
  }
})

// 注册 Goldsky 路由
app.use('/api', goldskyServer.router)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Smart Farm API',
    plugins: goldskyServer.getLoadedPlugins()
  })
})

// 启动服务器
goldskyServer.start(app, port).then(() => {
  console.log(`🌱 Smart Farm API 启动成功 - http://localhost:${port}`)
  console.log(`📋 API 文档: http://localhost:${port}/api/docs`)
  console.log(`🔧 健康检查: http://localhost:${port}/health`)
}) 