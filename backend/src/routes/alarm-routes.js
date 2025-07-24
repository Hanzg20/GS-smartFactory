import express from 'express';
import {
  getAlarms,
  getAlarmById,
  createAlarm,
  acknowledgeAlarm,
  resolveAlarm,
  getAlarmStats,
  bulkUpdateAlarms
} from '../controllers/alarm-controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件
router.use(authMiddleware);

// 获取报警列表
router.get('/', getAlarms);

// 获取报警统计
router.get('/stats', getAlarmStats);

// 获取报警详情
router.get('/:id', getAlarmById);

// 创建报警
router.post('/', createAlarm);

// 确认报警
router.post('/:id/acknowledge', acknowledgeAlarm);

// 解决报警
router.post('/:id/resolve', resolveAlarm);

// 批量更新报警
router.post('/bulk-update', bulkUpdateAlarms);

export default router; 