import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';

interface EnvironmentData {
  id: string;
  workshop_id: string;
  workshop_name?: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface EnvAlarmRecord {
  id: string;
  workshop_id: string;
  workshop_name?: string;
  type: string;
  level: string;
  description: string;
  triggered_at: string;
  resolved_at?: string;
}

const EnvironmentPage: React.FC = () => {
  const [envData, setEnvData] = useState<EnvironmentData[]>([]);
  const [alarms, setAlarms] = useState<EnvAlarmRecord[]>([]);
  const [currentTab, setCurrentTab] = useState('monitoring');
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setEnvData([
      { id: '1', workshop_id: 'WS001', workshop_name: '车间A', type: '温度', value: 23.5, unit: '°C', timestamp: '2024-03-01 10:00:00' },
      { id: '2', workshop_id: 'WS001', workshop_name: '车间A', type: '湿度', value: 55.2, unit: '%', timestamp: '2024-03-01 10:00:00' },
      { id: '3', workshop_id: 'WS001', workshop_name: '车间A', type: '能耗', value: 325.8, unit: 'kWh', timestamp: '2024-03-01 10:00:00' },
      { id: '4', workshop_id: 'WS002', workshop_name: '车间B', type: '温度', value: 25.1, unit: '°C', timestamp: '2024-03-01 10:00:00' },
      { id: '5', workshop_id: 'WS002', workshop_name: '车间B', type: '湿度', value: 48.7, unit: '%', timestamp: '2024-03-01 10:00:00' },
      { id: '6', workshop_id: 'WS002', workshop_name: '车间B', type: '能耗', value: 289.3, unit: 'kWh', timestamp: '2024-03-01 10:00:00' },
      { id: '7', workshop_id: 'WS003', workshop_name: '车间C', type: '温度', value: 22.8, unit: '°C', timestamp: '2024-03-01 10:00:00' },
      { id: '8', workshop_id: 'WS003', workshop_name: '车间C', type: '湿度', value: 62.4, unit: '%', timestamp: '2024-03-01 10:00:00' },
      { id: '9', workshop_id: 'WS003', workshop_name: '车间C', type: '能耗', value: 412.6, unit: 'kWh', timestamp: '2024-03-01 10:00:00' }
    ]);

    setAlarms([
      { id: '1', workshop_id: 'WS001', workshop_name: '车间A', type: '温度', level: 'high', description: '温度超过设定阈值25°C', triggered_at: '2024-03-01 09:15:00' },
      { id: '2', workshop_id: 'WS002', workshop_name: '车间B', type: '湿度', level: 'medium', description: '湿度过低，可能影响生产质量', triggered_at: '2024-03-01 08:30:00', resolved_at: '2024-03-01 09:45:00' },
      { id: '3', workshop_id: 'WS003', workshop_name: '车间C', type: '能耗', level: 'high', description: '能耗异常升高，需要检查设备运行状态', triggered_at: '2024-03-01 07:20:00' },
      { id: '4', workshop_id: 'WS001', workshop_name: '车间A', type: '空气质量', level: 'low', description: '空气质量指数偏高', triggered_at: '2024-03-01 11:10:00', resolved_at: '2024-03-01 12:30:00' }
    ]);
  };

  const getDataByType = (type: string) => {
    const filteredData = selectedWorkshop === 'all' 
      ? envData.filter(d => d.type === type)
      : envData.filter(d => d.type === type && d.workshop_id === selectedWorkshop);
    
    return filteredData;
  };

  const getAlarmLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const renderMonitoring = () => {
    const temperatureData = getDataByType('温度');
    const humidityData = getDataByType('湿度');
    const energyData = getDataByType('能耗');

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">环境监控</h3>
          <select 
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          >
            <option value="all">全部车间</option>
            <option value="WS001">车间A</option>
            <option value="WS002">车间B</option>
            <option value="WS003">车间C</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 温度监控 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">温度监控</h4>
              <div className="text-2xl">🌡️</div>
            </div>
            <div className="space-y-3">
              {temperatureData.map((data) => (
                <div key={data.id} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{data.workshop_name}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{data.value}</span>
                    <span className="text-slate-400 text-sm ml-1">{data.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">平均值:</span>
                <span className="text-blue-400">
                  {temperatureData.length > 0 
                    ? (temperatureData.reduce((sum, d) => sum + d.value, 0) / temperatureData.length).toFixed(1)
                    : '0'
                  }°C
                </span>
              </div>
            </div>
          </div>

          {/* 湿度监控 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">湿度监控</h4>
              <div className="text-2xl">💧</div>
            </div>
            <div className="space-y-3">
              {humidityData.map((data) => (
                <div key={data.id} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{data.workshop_name}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{data.value}</span>
                    <span className="text-slate-400 text-sm ml-1">{data.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">平均值:</span>
                <span className="text-green-400">
                  {humidityData.length > 0 
                    ? (humidityData.reduce((sum, d) => sum + d.value, 0) / humidityData.length).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </div>

          {/* 能耗监控 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">能耗监控</h4>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="space-y-3">
              {energyData.map((data) => (
                <div key={data.id} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{data.workshop_name}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{data.value}</span>
                    <span className="text-slate-400 text-sm ml-1">{data.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">总消耗:</span>
                <span className="text-purple-400">
                  {energyData.reduce((sum, d) => sum + d.value, 0).toFixed(1)}kWh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 实时趋势图占位 */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h4 className="text-white font-medium mb-4">24小时趋势</h4>
          <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="text-4xl mb-2">📊</div>
              <p>ECharts 图表将在此显示实时趋势</p>
              <p className="text-sm mt-1">温度、湿度、能耗等参数的24小时变化曲线</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlarms = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">环境报警</h3>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          手动报警
        </button>
      </div>
      
      <div className="space-y-3">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-white font-medium">{alarm.description}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getAlarmLevelColor(alarm.level)}`}>
                    {alarm.level === 'high' ? '高级' : alarm.level === 'medium' ? '中级' : '低级'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>{alarm.workshop_name}</span>
                  <span>类型: {alarm.type}</span>
                  <span>触发: {alarm.triggered_at}</span>
                  {alarm.resolved_at && (
                    <span className="text-green-400">已处理: {alarm.resolved_at}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {!alarm.resolved_at && (
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    标记解决
                  </button>
                )}
                <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  查看详情
                </button>
              </div>
            </div>
            
            {/* 报警级别指示器 */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    alarm.level === 'high' ? 'bg-red-500 w-full' : 
                    alarm.level === 'medium' ? 'bg-yellow-500 w-2/3' : 
                    'bg-blue-500 w-1/3'
                  }`}
                ></div>
              </div>
              <span className="text-xs text-slate-400">
                紧急程度: {alarm.level === 'high' ? '紧急' : alarm.level === 'medium' ? '一般' : '提醒'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { key: 'monitoring', label: '环境监控', content: renderMonitoring },
    { key: 'alarms', label: '环境报警', content: renderAlarms }
  ];

  const getEnvStats = () => {
    const totalAlarms = alarms.length;
    const unresolvedAlarms = alarms.filter(a => !a.resolved_at).length;
    const avgTemperature = envData.filter(d => d.type === '温度').reduce((sum, d) => sum + d.value, 0) / envData.filter(d => d.type === '温度').length;
    const totalEnergy = envData.filter(d => d.type === '能耗').reduce((sum, d) => sum + d.value, 0);

    return { totalAlarms, unresolvedAlarms, avgTemperature: avgTemperature.toFixed(1), totalEnergy: totalEnergy.toFixed(1) };
  };

  const stats = getEnvStats();

  return (
    <ResponsiveContainer>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">环境监测</h1>
            <p className="text-slate-400">实时监控车间环境参数和能耗数据</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">平均温度</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.avgTemperature}°C</p>
              </div>
              <div className="text-3xl">🌡️</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">总能耗</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{stats.totalEnergy}</p>
                <p className="text-xs text-slate-400">kWh</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">环境报警</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.totalAlarms}</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">待处理</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.unresolvedAlarms}</p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCurrentTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentTab === tab.key
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {tabs.find(tab => tab.key === currentTab)?.content()}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default EnvironmentPage; 