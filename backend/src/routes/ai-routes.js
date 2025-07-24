import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getDeviceHealthAnalysis,
  getProductionOptimization,
  getPredictiveMaintenance,
  getSystemOverview
} from '../controllers/ai-controller.js'

const router = express.Router()

// 所有路由都需要认证
router.use(authenticateToken)

// AI分析功能
router.get('/device-health/:device_id', getDeviceHealthAnalysis)
router.get('/production-optimization', getProductionOptimization)
router.get('/predictive-maintenance', getPredictiveMaintenance)
router.get('/system-overview', getSystemOverview)

export default router 