import { testConnection } from './config/database.js';
import { Server } from 'socket.io';

export default async function healthcheck(req, res) {
  let dbStatus = 'unknown';
  try {
    dbStatus = (await testConnection()) ? 'ok' : 'fail';
  } catch {
    dbStatus = 'fail';
  }
  // WebSocket状态模拟
  const wsStatus = 'ok';
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'SmartFactory Studio API',
    db: dbStatus,
    websocket: wsStatus
  });
} 