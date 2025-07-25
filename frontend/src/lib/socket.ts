import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
  forceNew: true,
  path: '/socket.io'
});

// 添加全局事件监听器
socket.on('connect', () => {
  console.log('✅ Socket connected to:', SOCKET_URL);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
  console.log('🔄 Trying to connect to:', SOCKET_URL);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket disconnected from:', SOCKET_URL);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reconnection attempt #${attemptNumber} to:`, SOCKET_URL);
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Successfully reconnected after ${attemptNumber} attempts`);
});

socket.on('reconnect_failed', () => {
  console.log('❌ Failed to reconnect to:', SOCKET_URL);
});

// 心跳检测
setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
  }
}, 30000);

socket.on('pong', (data) => {
  console.log('💓 Received pong:', data);
});

export default socket; 