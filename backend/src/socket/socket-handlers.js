import cron from 'node-cron'

export function setupSocketHandlers(io, axisController, logger) {
  // 连接处理
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`)
    
    // 发送初始数据
    sendAxisData(socket)
    
    // 处理轴命令
    socket.on('axisCommand', async (data) => {
      try {
        const { axisId, command, value } = data
        logger.info(`Received command from ${socket.id}: ${axisId} ${command} ${value}`)
        
        const result = await axisController.sendCommand(axisId, command, value)
        socket.emit('commandResult', result)
      } catch (error) {
        logger.error('Error processing axis command:', error)
        socket.emit('commandError', { error: error.message })
      }
    })
    
    // 处理断开连接
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)
    })
  })
  
  // 定期发送轴数据更新 (每秒)
  cron.schedule('* * * * * *', async () => {
    try {
      const axisData = await axisController.getAllAxes()
      io.emit('axisData', axisData)
    } catch (error) {
      logger.error('Error sending axis data update:', error)
    }
  })
  
  // 定期发送系统状态 (每5秒)
  cron.schedule('*/5 * * * * *', () => {
    try {
      const systemStatus = axisController.getSystemStatus()
      io.emit('systemStatus', systemStatus)
    } catch (error) {
      logger.error('Error sending system status:', error)
    }
  })
  
  // 发送轴数据的辅助函数
  async function sendAxisData(socket) {
    try {
      const axisData = await axisController.getAllAxes()
      socket.emit('axisData', axisData)
      
      const systemStatus = axisController.getSystemStatus()
      socket.emit('systemStatus', systemStatus)
    } catch (error) {
      logger.error('Error sending initial axis data:', error)
    }
  }
} 