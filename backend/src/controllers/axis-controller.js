import winston from 'winston'

export class AxisController {
  constructor(adsClient, opcuaClient) {
    this.adsClient = adsClient
    this.opcuaClient = opcuaClient
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: [new winston.transports.Console()]
    })
    
    this.axes = [
      { id: 'axis1', name: 'X轴', prefix: 'MAIN.Axis1' },
      { id: 'axis2', name: 'Y轴', prefix: 'MAIN.Axis2' },
      { id: 'axis3', name: 'Z轴', prefix: 'MAIN.Axis3' }
    ]
    
    // 初始化连接
    this.initializeConnections()
  }

  async initializeConnections() {
    try {
      // 尝试连接ADS
      await this.adsClient.connect()
      this.logger.info('ADS connection initialized')
    } catch (error) {
      this.logger.warn('ADS connection failed, using simulation mode')
    }

    try {
      // 尝试连接OPC UA
      await this.opcuaClient.connect()
      this.logger.info('OPC UA connection initialized')
    } catch (error) {
      this.logger.warn('OPC UA connection failed, using simulation mode')
    }
  }

  async getAllAxes() {
    try {
      // 优先使用ADS数据，如果不可用则使用OPC UA
      if (this.adsClient.isConnected()) {
        return await this.adsClient.getAllAxisData()
      } else if (this.opcuaClient.isConnected()) {
        return await this.opcuaClient.getAllAxisData()
      } else {
        // 如果都不可用，返回模拟数据
        return this.getSimulatedAxisData()
      }
    } catch (error) {
      this.logger.error('Error getting axis data:', error)
      return this.getSimulatedAxisData()
    }
  }

  async sendCommand(axisId, command, value = null) {
    try {
      this.logger.info(`Sending command to ${axisId}: ${command}${value !== null ? ` = ${value}` : ''}`)
      
      const axis = this.axes.find(a => a.id === axisId)
      if (!axis) {
        throw new Error(`Axis ${axisId} not found`)
      }

      let success = false

      // 尝试通过ADS发送命令
      if (this.adsClient.isConnected()) {
        try {
          await this.sendADSCommand(axis, command, value)
          success = true
        } catch (error) {
          this.logger.warn(`ADS command failed for ${axisId}:`, error)
        }
      }

      // 如果ADS失败，尝试通过OPC UA发送命令
      if (!success && this.opcuaClient.isConnected()) {
        try {
          await this.sendOPCUACommand(axis, command, value)
          success = true
        } catch (error) {
          this.logger.warn(`OPC UA command failed for ${axisId}:`, error)
        }
      }

      // 如果都失败，记录模拟命令
      if (!success) {
        this.logger.info(`Simulated command for ${axisId}: ${command}${value !== null ? ` = ${value}` : ''}`)
      }

      return {
        success: true,
        axisId,
        command,
        value,
        timestamp: new Date(),
        method: success ? (this.adsClient.isConnected() ? 'ADS' : 'OPC UA') : 'Simulation'
      }
    } catch (error) {
      this.logger.error(`Error sending command to ${axisId}:`, error)
      throw error
    }
  }

  async sendADSCommand(axis, command, value) {
    const variableMap = {
      enable: `${axis.prefix}.Enable`,
      disable: `${axis.prefix}.Disable`,
      home: `${axis.prefix}.Home`,
      stop: `${axis.prefix}.Stop`,
      moveTo: `${axis.prefix}.TargetPosition`,
      jog: `${axis.prefix}.Jog`
    }

    const variableName = variableMap[command]
    if (!variableName) {
      throw new Error(`Unknown command: ${command}`)
    }

    await this.adsClient.writeVariable(variableName, value !== null ? value : 1)
  }

  async sendOPCUACommand(axis, command, value) {
    const nodeIdMap = {
      enable: `ns=2;s=${axis.id}.Enable`,
      disable: `ns=2;s=${axis.id}.Disable`,
      home: `ns=2;s=${axis.id}.Home`,
      stop: `ns=2;s=${axis.id}.Stop`,
      moveTo: `ns=2;s=${axis.id}.TargetPosition`,
      jog: `ns=2;s=${axis.id}.Jog`
    }

    const nodeId = nodeIdMap[command]
    if (!nodeId) {
      throw new Error(`Unknown command: ${command}`)
    }

    await this.opcuaClient.writeVariable(nodeId, value !== null ? value : 1)
  }

  getSimulatedAxisData() {
    return this.axes.map(axis => ({
      id: axis.id,
      name: axis.name,
      position: Math.random() * 100,
      targetPosition: Math.random() * 100,
      velocity: Math.random() * 10,
      status: ['idle', 'moving', 'error', 'homing'][Math.floor(Math.random() * 4)],
      enabled: Math.random() > 0.5,
      errorCode: 0,
      errorMessage: '',
      timestamp: new Date()
    }))
  }

  getSystemStatus() {
    return {
      ads: this.adsClient.isConnected(),
      opcua: this.opcuaClient.isConnected(),
      timestamp: new Date()
    }
  }
} 