import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getProductionPlans,
  createProductionPlan,
  updateProductionPlan,
  startProduction,
  pauseProduction,
  completeProduction,
  getProductionRecords,
  getProductionStats
} from '../controllers/production-controller.js'

const router = express.Router()

// 所有路由都需要认证
router.use(authenticateToken)

// 生产计划管理
router.get('/plans', getProductionPlans)
router.post('/plans', createProductionPlan)
router.put('/plans/:id', updateProductionPlan)

// 生产控制
router.post('/plans/:id/start', startProduction)
router.post('/plans/:id/pause', pauseProduction)
router.post('/plans/:id/complete', completeProduction)

// 生产记录
router.get('/records', getProductionRecords)

// 生产统计
router.get('/stats', getProductionStats)

export default router 