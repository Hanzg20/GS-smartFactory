import express from 'express'
import { authenticateToken, checkPermission, optionalAuth } from '../middleware/auth.js'

// 导入控制器
import enterpriseController from '../controllers/enterprise-controller.js'
import deviceController from '../controllers/device-controller.js'

// 导入报警路由
import alarmRoutes from './alarm-routes.js'
// 导入生产路由
import productionRoutes from './production-routes.js'
// 导入维护路由
import maintenanceRoutes from './maintenance-routes.js'
// 导入AI路由
import aiRoutes from './ai-routes.js'
// 导入报表路由
import reportRoutes from './report-routes.js'

const router = express.Router()

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'SmartFactory Studio API'
  })
})

// 企业相关路由
router.get('/enterprises', authenticateToken, enterpriseController.getEnterprises)
router.get('/enterprises/:id', authenticateToken, enterpriseController.getEnterprise)
router.post('/enterprises', authenticateToken, checkPermission('enterprise:create'), enterpriseController.createEnterprise)
router.put('/enterprises/:id', authenticateToken, checkPermission('enterprise:update'), enterpriseController.updateEnterprise)
router.delete('/enterprises/:id', authenticateToken, checkPermission('enterprise:delete'), enterpriseController.deleteEnterprise)
router.get('/enterprises/:id/stats', authenticateToken, enterpriseController.getEnterpriseStats)

// 设备相关路由
router.get('/devices', authenticateToken, deviceController.getDevices)
router.get('/devices/:id', authenticateToken, deviceController.getDevice)
router.post('/devices', authenticateToken, checkPermission('device:create'), deviceController.createDevice)
router.put('/devices/:id', authenticateToken, checkPermission('device:update'), deviceController.updateDevice)
router.delete('/devices/:id', authenticateToken, checkPermission('device:delete'), deviceController.deleteDevice)
router.get('/devices/:id/status', authenticateToken, deviceController.getDeviceStatus)
router.put('/devices/:id/status', authenticateToken, deviceController.updateDeviceStatus)
router.get('/device-types', authenticateToken, deviceController.getDeviceTypes)

// 报警相关路由
router.use('/alarms', alarmRoutes)

// 生产相关路由
router.use('/production', productionRoutes)

// 维护相关路由
router.use('/maintenance', maintenanceRoutes)

// AI相关路由
router.use('/ai', aiRoutes)

// 报表相关路由
router.use('/reports', reportRoutes)

// 实时数据路由
router.get('/realtime/:deviceId', optionalAuth, (req, res) => {
  // 实时数据将通过WebSocket提供
  res.json({
    message: 'Real-time data is available via WebSocket connection'
  })
})

// 404处理
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: '请求的路由不存在',
    path: req.originalUrl
  })
})

export default router 