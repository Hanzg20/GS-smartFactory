import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface KPIData {
  oee: number;
  productivity: number;
  quality: number;
  availability: number;
}

interface DeviceStatus {
  running: number;
  maintenance: number;
  fault: number;
  idle: number;
  total: number;
}

interface AlarmData {
  high: number;
  medium: number;
  low: number;
  total: number;
  recent: Array<{
    id: string;
    message: string;
    level: string;
    time: string;
  }>;
}

interface EnvData {
  temperature: number[];
  humidity: number[];
  energy: number[];
  current: {
    temperature: number;
    humidity: number;
    energy: number;
  };
}

interface QualityData {
  passRate: number[];
  currentPassRate: number;
  defectRate: number;
  totalInspections: number;
}

interface MaterialData {
  inventory: number[];
  lowStock: number;
  totalMaterials: number;
  recentTransactions: Array<{
    id: string;
    material: string;
    type: string;
    quantity: number;
    time: string;
  }>;
}

interface ProcessData {
  steps: Array<{
    name: string;
    status: string;
    progress: number;
  }>;
  efficiency: number;
  currentStep: string;
}

interface PersonnelData {
  onDuty: number;
  leave: number;
  training: number;
  total: number;
  shifts: Array<{
    name: string;
    count: number;
  }>;
}

export function useSupabaseRealtime() {
  const [kpiData, setKpiData] = useState<KPIData>({
    oee: 85,
    productivity: 92,
    quality: 98,
    availability: 87
  });

  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    running: 12,
    maintenance: 2,
    fault: 1,
    idle: 3,
    total: 18
  });

  const [alarms, setAlarms] = useState<AlarmData>({
    high: 5,
    medium: 12,
    low: 8,
    total: 25,
    recent: [
      { id: '1', message: '设备A001温度异常', level: 'high', time: '10:30' },
      { id: '2', message: '设备B005需要维护', level: 'medium', time: '09:45' },
      { id: '3', message: '车间C区湿度过高', level: 'low', time: '09:15' }
    ]
  });

  const [envData, setEnvData] = useState<EnvData>({
    temperature: [23, 24, 23, 25, 24, 23],
    humidity: [55, 56, 54, 58, 57, 55],
    energy: [320, 332, 301, 334, 390, 330],
    current: {
      temperature: 23.5,
      humidity: 55.2,
      energy: 325
    }
  });

  const [qualityData, setQualityData] = useState<QualityData>({
    passRate: [98.5, 99.2, 97.8, 98.9, 99.1, 98.7, 99.3],
    currentPassRate: 98.8,
    defectRate: 1.2,
    totalInspections: 2456
  });

  const [materialData, setMaterialData] = useState<MaterialData>({
    inventory: [1000, 500, 200, 800, 300],
    lowStock: 3,
    totalMaterials: 25,
    recentTransactions: [
      { id: '1', material: '轴承钢', type: '入库', quantity: 100, time: '14:30' },
      { id: '2', material: '精密轴承', type: '出库', quantity: 50, time: '13:45' }
    ]
  });

  const [processData, setProcessData] = useState<ProcessData>({
    steps: [
      { name: '粗加工', status: 'completed', progress: 100 },
      { name: '精加工', status: 'running', progress: 75 },
      { name: '检验', status: 'pending', progress: 0 }
    ],
    efficiency: 87,
    currentStep: '精加工'
  });

  const [personnelData, setPersonnelData] = useState<PersonnelData>({
    onDuty: 45,
    leave: 3,
    training: 8,
    total: 56,
    shifts: [
      { name: '早班', count: 18 },
      { name: '中班', count: 15 },
      { name: '晚班', count: 12 }
    ]
  });

  useEffect(() => {
    // 模拟数据定时更新
    const interval = setInterval(() => {
      // 模拟KPI数据变化
      setKpiData(prev => ({
        ...prev,
        oee: 80 + Math.random() * 20,
        productivity: 85 + Math.random() * 15,
        quality: 95 + Math.random() * 5,
        availability: 80 + Math.random() * 20
      }));

      // 模拟设备状态变化
      setDeviceStatus(prev => ({
        ...prev,
        running: 10 + Math.floor(Math.random() * 8),
        fault: Math.floor(Math.random() * 3)
      }));

      // 模拟环境数据变化
      setEnvData(prev => ({
        ...prev,
        current: {
          temperature: 20 + Math.random() * 10,
          humidity: 50 + Math.random() * 20,
          energy: 300 + Math.random() * 100
        }
      }));

      // 模拟质量数据变化
      setQualityData(prev => ({
        ...prev,
        currentPassRate: 95 + Math.random() * 5
      }));
    }, 3000); // 每3秒更新一次

    return () => clearInterval(interval);
  }, []);

  return {
    kpiData,
    deviceStatus,
    alarms,
    envData,
    qualityData,
    materialData,
    processData,
    personnelData
  };
} 