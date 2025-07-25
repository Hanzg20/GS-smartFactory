export interface DeviceStatus {
  online: boolean;
  running: boolean;
  alarm: boolean;
  maintenance: boolean;
  efficiency: number;
  temperature: number;
  vibration: number;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  type: 'CNC' | 'Robot' | 'Conveyor' | 'Inspection';
  axes: number;
  x: number;
  y: number;
  rotation: number;
  image?: string;
  status: DeviceStatus;
  parameters?: any;
}

export interface Workshop {
  id: string;
  name: string;
  description: string;
  floorPlan: string;
  width: number;
  height: number;
  devices: Device[];
} 