import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';

interface QualityInspection {
  id: string;
  object_type: string;
  object_id: string;
  inspection_type: string;
  result: string;
  inspector_id: string;
  timestamp: string;
}

interface InspectionRecord {
  id: string;
  inspection_id: string;
  item: string;
  value: string;
  result: string;
  created_at: string;
}

interface QualityException {
  id: string;
  related_object_type: string;
  related_object_id: string;
  description: string;
  action_taken: string;
  resolved: boolean;
  created_at: string;
}

interface QualityTrace {
  id: string;
  batch_id: string;
  device_id: string;
  process_id: string;
  inspection_id: string;
  result: string;
  created_at: string;
}

const QualityPage: React.FC = () => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [exceptions, setExceptions] = useState<QualityException[]>([]);
  const [traces, setTraces] = useState<QualityTrace[]>([]);
  const [currentTab, setCurrentTab] = useState('inspections');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setInspections([
      { id: '1', object_type: '物料', object_id: 'MAT001', inspection_type: '外观检验', result: '合格', inspector_id: 'INS001', timestamp: '2024-03-01 09:30:00' },
      { id: '2', object_type: '物料', object_id: 'MAT002', inspection_type: '尺寸检验', result: '合格', inspector_id: 'INS002', timestamp: '2024-03-01 10:15:00' },
      { id: '3', object_type: '设备', object_id: 'DEV001', inspection_type: '精度检验', result: '不合格', inspector_id: 'INS001', timestamp: '2024-03-01 14:20:00' },
      { id: '4', object_type: '产品', object_id: 'PROD001', inspection_type: '功能测试', result: '合格', inspector_id: 'INS003', timestamp: '2024-03-01 16:45:00' }
    ]);

    setRecords([
      { id: '1', inspection_id: '1', item: '表面光洁度', value: 'Ra0.8', result: '合格', created_at: '2024-03-01 09:30:00' },
      { id: '2', inspection_id: '2', item: '外径', value: '25.00mm', result: '合格', created_at: '2024-03-01 10:15:00' },
      { id: '3', inspection_id: '2', item: '内径', value: '12.00mm', result: '合格', created_at: '2024-03-01 10:16:00' },
      { id: '4', inspection_id: '3', item: '重复定位精度', value: '0.015mm', result: '不合格', created_at: '2024-03-01 14:20:00' }
    ]);

    setExceptions([
      { id: '1', related_object_type: '物料', related_object_id: 'MAT003', description: '发现轻微划痕，影响外观质量', action_taken: '返工抛光处理', resolved: true, created_at: '2024-03-01 11:30:00' },
      { id: '2', related_object_type: '设备', related_object_id: 'DEV001', description: '设备精度超出公差范围', action_taken: '安排设备校准', resolved: false, created_at: '2024-03-01 14:25:00' },
      { id: '3', related_object_type: '产品', related_object_id: 'PROD002', description: '功能测试未通过规定标准', action_taken: '重新调试参数', resolved: false, created_at: '2024-03-01 15:10:00' }
    ]);

    setTraces([
      { id: '1', batch_id: 'BATCH-001', device_id: 'DEV001', process_id: 'PROC001', inspection_id: '1', result: '合格', created_at: '2024-03-01 09:30:00' },
      { id: '2', batch_id: 'BATCH-002', device_id: 'DEV002', process_id: 'PROC002', inspection_id: '2', result: '合格', created_at: '2024-03-01 10:15:00' },
      { id: '3', batch_id: 'BATCH-003', device_id: 'DEV001', process_id: 'PROC003', inspection_id: '3', result: '不合格', created_at: '2024-03-01 14:20:00' }
    ]);
  };

  const getStatusColor = (result: string) => {
    switch (result) {
      case '合格': return 'text-green-400 bg-green-400/20';
      case '不合格': return 'text-red-400 bg-red-400/20';
      case '待检': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const renderInspections = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">质量检测</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增检测
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">{inspection.inspection_type}</h4>
                <p className="text-sm text-slate-400">{inspection.object_type}: {inspection.object_id}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(inspection.result)}`}>
                {inspection.result}
              </span>
            </div>
            <div className="text-sm text-slate-400 mb-3">
              <p>检验员: {inspection.inspector_id}</p>
              <p>时间: {inspection.timestamp}</p>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                查看详情
              </button>
              <button className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                生成报告
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">检验记录</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          导出记录
        </button>
      </div>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">检测项目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">测量值</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">结果</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-700/25">
                  <td className="px-4 py-3 text-sm text-white">{record.item}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{record.value}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.result)}`}>
                      {record.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{record.created_at}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-blue-400 hover:text-blue-300">查看</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExceptions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">异常管理</h3>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          报告异常
        </button>
      </div>
      
      <div className="space-y-3">
        {exceptions.map((exception) => (
          <div key={exception.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{exception.description}</h4>
                <p className="text-sm text-slate-400">
                  {exception.related_object_type}: {exception.related_object_id}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                exception.resolved 
                  ? 'text-green-400 bg-green-400/20' 
                  : 'text-red-400 bg-red-400/20'
              }`}>
                {exception.resolved ? '已解决' : '待处理'}
              </span>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
              <p className="text-sm text-slate-300">处理措施: {exception.action_taken}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">时间: {exception.created_at}</span>
              <div className="flex space-x-2">
                {!exception.resolved && (
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    标记解决
                  </button>
                )}
                <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  查看详情
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTraces = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">质量追溯</h3>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="输入批次号搜索..." 
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            追溯
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {traces.map((trace) => (
          <div key={trace.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-medium">批次: {trace.batch_id}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(trace.result)}`}>
                {trace.result}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-400 mb-3">
              <div className="flex justify-between">
                <span>设备:</span>
                <span className="text-slate-300">{trace.device_id}</span>
              </div>
              <div className="flex justify-between">
                <span>工艺:</span>
                <span className="text-slate-300">{trace.process_id}</span>
              </div>
              <div className="flex justify-between">
                <span>检测:</span>
                <span className="text-slate-300">{trace.inspection_id}</span>
              </div>
              <div className="flex justify-between">
                <span>时间:</span>
                <span className="text-slate-300">{trace.created_at}</span>
              </div>
            </div>
            <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              查看完整追溯链
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { key: 'inspections', label: '质量检测', content: renderInspections },
    { key: 'records', label: '检验记录', content: renderRecords },
    { key: 'exceptions', label: '异常管理', content: renderExceptions },
    { key: 'traces', label: '质量追溯', content: renderTraces }
  ];

  const getQualityStats = () => {
    const totalInspections = inspections.length;
    const passedInspections = inspections.filter(i => i.result === '合格').length;
    const unresolvedExceptions = exceptions.filter(e => !e.resolved).length;
    const passRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0;

    return { totalInspections, passedInspections, unresolvedExceptions, passRate };
  };

  const stats = getQualityStats();

  return (
    <ResponsiveContainer>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">质量管理</h1>
            <p className="text-slate-400">质量检测、异常处理、追溯管理</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">总检测数</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalInspections}</p>
              </div>
              <div className="text-3xl text-blue-500">🔍</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">合格率</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.passRate}%</p>
              </div>
              <div className="text-3xl text-green-500">✅</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">待处理异常</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.unresolvedExceptions}</p>
              </div>
              <div className="text-3xl text-red-500">⚠️</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">追溯记录</p>
                <p className="text-2xl font-bold text-white mt-1">{traces.length}</p>
              </div>
              <div className="text-3xl text-purple-500">🔗</div>
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

export default QualityPage; 