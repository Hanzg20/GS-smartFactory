import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getMaintenancePlans,
  createMaintenancePlan,
  updateMaintenancePlan,
  startMaintenance,
  completeMaintenance,
  getMaintenanceRecords,
  getMaintenanceStats
} from '../controllers/maintenance-controller.js'

const router = express.Router()

// 所有路由都需要认证
router.use(authenticateToken)

// 维护计划管理
router.get('/plans', getMaintenancePlans)
router.post('/plans', createMaintenancePlan)
router.put('/plans/:id', updateMaintenancePlan)

// 维护控制
router.post('/plans/:id/start', startMaintenance)
router.post('/plans/:id/complete', completeMaintenance)

// 维护记录
router.get('/records', getMaintenanceRecords)

// 维护统计
router.get('/stats', getMaintenanceStats)

export default router 