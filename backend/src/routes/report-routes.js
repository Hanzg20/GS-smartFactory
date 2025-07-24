import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getComprehensiveReport,
  getDeviceReport,
  getTrendAnalysis
} from '../controllers/report-controller.js'

const router = express.Router()

// 所有路由都需要认证
router.use(authenticateToken)

// 报表功能
router.get('/comprehensive', getComprehensiveReport)
router.get('/device/:device_id', getDeviceReport)
router.get('/trends', getTrendAnalysis)

export default router 