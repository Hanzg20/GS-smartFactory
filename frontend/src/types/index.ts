export interface AxisData {
  id: string
  name: string
  position: number
  targetPosition: number
  velocity: number
  status: 'idle' | 'moving' | 'error' | 'homing'
  enabled: boolean
  errorCode: number
  errorMessage: string
  timestamp: Date
}

export type SystemStatus = 'connected' | 'disconnected' | 'error' | 'connecting'

export interface AxisCommand {
  axisId: string
  command: 'enable' | 'disable' | 'home' | 'moveTo' | 'stop' | 'jog'
  value?: number
}

export interface SystemInfo {
  version: string
  uptime: number
  cpuUsage: number
  memoryUsage: number
  connectedClients: number
} 