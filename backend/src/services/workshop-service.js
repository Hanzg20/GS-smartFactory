import winston from 'winston'

export class WorkshopService {
  constructor() {
    this.workshops = new Map()
    this.devices = new Map()
    this.simulationIntervals = new Map()
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: [new winston.transports.Console()]
    })
    
    this.initializeWorkshops()
    this.startSimulation()
  }

  initializeWorkshops() {
    // 初始化车间和设备数据
    const workshopData = [
      {
        id: 'workshop-1',
        name: 'CNC加工车间',
        description: '主要进行精密零件加工',
        width: 800,
        height: 600,
        devices: [
          {
            id: 'cnc-001',
            name: '精密加工中心',
            model: 'DMG MORI NHX5000',
            type: 'CNC',
            axes: 5,
            position: { x: 100, y: 150, rotation: 0 },
            status: {
              online: true,
              running: true,
              alarm: false,
              maintenance: false,
              efficiency: 85,
              temperature: 35,
              vibration: 2.5
            },
            parameters: {
              axes: {
                'X': { position: 50, targetPosition: 50, velocity: 5, status: 'idle', enabled: true },
                'Y': { position: 30, targetPosition: 30, velocity: 3, status: 'idle', enabled: true },
                'Z': { position: 20, targetPosition: 20, velocity: 2, status: 'idle', enabled: true },
                'A': { position: 0, targetPosition: 0, velocity: 1, status: 'idle', enabled: true },
                'C': { position: 0, targetPosition: 0, velocity: 1, status: 'idle', enabled: true }
              },
              production: {
                currentJob: 'JOB-2024-001',
                completed: 45,
                total: 100,
                quality: 98.5
              },
              maintenance: {
                nextMaintenance: new Date('2024-02-15'),
                runtime: 1250,
                cycles: 4500
              }
            }
          },
          {
            id: 'cnc-002',
            name: '立式加工中心',
            model: 'HAAS VF-2',
            type: 'CNC',
            axes: 3,
            position: { x: 300, y: 150, rotation: 0 },
            status: {
              online: true,
              running: false,
              alarm: false,
              maintenance: false,
              efficiency: 0,
              temperature: 25,
              vibration: 0.5
            },
            parameters: {
              axes: {
                'X': { position: 0, targetPosition: 0, velocity: 0, status: 'idle', enabled: false },
                'Y': { position: 0, targetPosition: 0, velocity: 0, status: 'idle', enabled: false },
                'Z': { position: 0, targetPosition: 0, velocity: 0, status: 'idle', enabled: false }
              },
              production: {
                currentJob: '',
                completed: 0,
                total: 0,
                quality: 0
              },
              maintenance: {
                nextMaintenance: new Date('2024-02-20'),
                runtime: 800,
                cycles: 3200
              }
            }
          }
        ]
      },
      {
        id: 'workshop-2',
        name: '装配车间',
        description: '自动化装配生产线',
        width: 600,
        height: 400,
        devices: [
          {
            id: 'robot-001',
            name: '六轴机器人',
            model: 'ABB IRB 1200',
            type: 'Robot',
            axes: 6,
            position: { x: 150, y: 100, rotation: 45 },
            status: {
              online: true,
              running: true,
              alarm: false,
              maintenance: false,
              efficiency: 92,
              temperature: 28,
              vibration: 1.8
            },
            parameters: {
              axes: {
                'J1': { position: 0, targetPosition: 0, velocity: 2, status: 'idle', enabled: true },
                'J2': { position: -90, targetPosition: -90, velocity: 2, status: 'idle', enabled: true },
                'J3': { position: 0, targetPosition: 0, velocity: 2, status: 'idle', enabled: true },
                'J4': { position: 0, targetPosition: 0, velocity: 2, status: 'idle', enabled: true },
                'J5': { position: 0, targetPosition: 0, velocity: 2, status: 'idle', enabled: true },
                'J6': { position: 0, targetPosition: 0, velocity: 2, status: 'idle', enabled: true }
              },
              production: {
                currentJob: 'ASSEMBLY-2024-001',
                completed: 120,
                total: 200,
                quality: 99.2
              },
              maintenance: {
                nextMaintenance: new Date('2024-03-01'),
                runtime: 2100,
                cycles: 8500
              }
            }
          }
        ]
      },
      {
        id: 'workshop-3',
        name: '检测车间',
        description: '质量检测与测量',
        width: 500,
        height: 400,
        devices: [
          {
            id: 'inspection-001',
            name: '三坐标测量机',
            model: 'ZEISS CONTURA',
            type: 'Inspection',
            axes: 3,
            position: { x: 100, y: 100, rotation: 0 },
            status: {
              online: true,
              running: false,
              alarm: false,
              maintenance: false,
              efficiency: 0,
              temperature: 22,
              vibration: 0.1
            },
            parameters: {
              axes: {
                'X': { position: 0, targetPosition: 0, velocity: 0, status: 'idle', enabled: true },
                'Y': { position: 0, targetPosition: 0, velocity: 0, status: 'idle', enabled: true },
                'Z': { position: 0, targetPosition: 0, velocity: 0, status: 'idle', enabled: true }
              },
              production: {
                currentJob: '',
                completed: 0,
                total: 0,
                quality: 0
              },
              maintenance: {
                nextMaintenance: new Date('2024-02-25'),
                runtime: 500,
                cycles: 1500
              }
            }
          }
        ]
      }
    ]

    // 初始化车间和设备映射
    workshopData.forEach(workshop => {
      this.workshops.set(workshop.id, workshop)
      workshop.devices.forEach(device => {
        this.devices.set(device.id, device)
      })
    })

    this.logger.info(`Initialized ${this.workshops.size} workshops with ${this.devices.size} devices`)
  }

  async getWorkshops() {
    return Array.from(this.workshops.values())
  }

  async getWorkshop(id) {
    return this.workshops.get(id)
  }

  async getDevices(workshopId) {
    const workshop = await this.getWorkshop(workshopId)
    return workshop ? workshop.devices : []
  }

  async getDevice(deviceId) {
    return this.devices.get(deviceId)
  }

  async updateDeviceStatus(deviceId, status) {
    const device = this.devices.get(deviceId)
    if (device) {
      device.status = { ...device.status, ...status }
      this.logger.info(`Updated device ${deviceId} status:`, status)
      return device
    }
    return null
  }

  async sendDeviceCommand(deviceId, command, value) {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device ${deviceId} not found`)
    }

    this.logger.info(`Sending command to device ${deviceId}: ${command} ${value || ''}`)

    // 模拟命令执行
    switch (command) {
      case 'enable':
        Object.keys(device.parameters.axes).forEach(axisId => {
          device.parameters.axes[axisId].enabled = true
        })
        break
      case 'disable':
        Object.keys(device.parameters.axes).forEach(axisId => {
          device.parameters.axes[axisId].enabled = false
        })
        break
      case 'moveTo':
        if (value !== undefined) {
          // 模拟移动到指定位置
          Object.keys(device.parameters.axes).forEach(axisId => {
            device.parameters.axes[axisId].targetPosition = value
            device.parameters.axes[axisId].status = 'moving'
          })
        }
        break
      case 'stop':
        Object.keys(device.parameters.axes).forEach(axisId => {
          device.parameters.axes[axisId].status = 'idle'
        })
        break
    }

    return { success: true, message: `Command ${command} executed successfully` }
  }

  startSimulation() {
    // 为每个设备启动仿真
    this.devices.forEach((device, deviceId) => {
      const interval = setInterval(() => {
        this.simulateDeviceStatus(deviceId)
      }, 2000 + Math.random() * 3000) // 2-5秒随机间隔

      this.simulationIntervals.set(deviceId, interval)
    })

    this.logger.info('Started device simulation')
  }

  simulateDeviceStatus(deviceId) {
    const device = this.devices.get(deviceId)
    if (!device) return

    // 模拟状态变化
    const status = device.status
    
    // 随机状态变化
    if (Math.random() > 0.95) { // 5%概率状态变化
      status.running = !status.running
    }
    
    if (Math.random() > 0.98) { // 2%概率报警
      status.alarm = !status.alarm
    }
    
    if (Math.random() > 0.99) { // 1%概率离线
      status.online = !status.online
    }

    // 更新效率、温度、振动
    status.efficiency = Math.max(0, Math.min(100, status.efficiency + (Math.random() - 0.5) * 10))
    status.temperature = Math.max(20, Math.min(60, status.temperature + (Math.random() - 0.5) * 2))
    status.vibration = Math.max(0, Math.min(10, status.vibration + (Math.random() - 0.5) * 0.5))

    // 模拟轴状态
    Object.keys(device.parameters.axes).forEach(axisId => {
      const axis = device.parameters.axes[axisId]
      if (axis.status === 'moving') {
        // 模拟运动
        const diff = axis.targetPosition - axis.position
        if (Math.abs(diff) < 0.1) {
          axis.position = axis.targetPosition
          axis.status = 'idle'
        } else {
          axis.position += diff * 0.1
        }
      }
    })

    // 模拟生产进度
    if (status.running && device.parameters.production.currentJob) {
      device.parameters.production.completed = Math.min(
        device.parameters.production.total,
        device.parameters.production.completed + Math.random() * 2
      )
    }
  }

  stopSimulation() {
    this.simulationIntervals.forEach(interval => {
      clearInterval(interval)
    })
    this.simulationIntervals.clear()
    this.logger.info('Stopped device simulation')
  }

  getFactoryOverview() {
    const overview = {
      totalWorkshops: this.workshops.size,
      totalDevices: this.devices.size,
      onlineDevices: 0,
      runningDevices: 0,
      alarmDevices: 0,
      workshops: []
    }

    this.workshops.forEach(workshop => {
      const workshopStats = {
        id: workshop.id,
        name: workshop.name,
        deviceCount: workshop.devices.length,
        onlineCount: 0,
        runningCount: 0,
        alarmCount: 0
      }

      workshop.devices.forEach(device => {
        if (device.status.online) {
          overview.onlineDevices++
          workshopStats.onlineCount++
        }
        if (device.status.running) {
          overview.runningDevices++
          workshopStats.runningCount++
        }
        if (device.status.alarm) {
          overview.alarmDevices++
          workshopStats.alarmCount++
        }
      })

      overview.workshops.push(workshopStats)
    })

    return overview
  }
} 