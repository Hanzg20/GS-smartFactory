import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';

interface ProcessParameter {
  id: string;
  name: string;
  value: string;
  unit: string;
  device_id: string;
  process_id: string;
  created_at: string;
}

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  sequence: number;
  process_id: string;
  created_at: string;
}

interface WorkInstruction {
  id: string;
  title: string;
  content: string;
  process_id: string;
  version: string;
  created_at: string;
}

interface ProcessChange {
  id: string;
  process_id: string;
  change_desc: string;
  changed_by: string;
  changed_at: string;
}

const ProcessPage: React.FC = () => {
  const [parameters, setParameters] = useState<ProcessParameter[]>([]);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [instructions, setInstructions] = useState<WorkInstruction[]>([]);
  const [changes, setChanges] = useState<ProcessChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('parameters');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setParameters([
      { id: '1', name: '主轴转速', value: '12000', unit: 'rpm', device_id: 'CNC001', process_id: 'P001', created_at: '2024-01-01' },
      { id: '2', name: '进给速度', value: '500', unit: 'mm/min', device_id: 'CNC001', process_id: 'P001', created_at: '2024-01-01' },
      { id: '3', name: '切削深度', value: '2.5', unit: 'mm', device_id: 'CNC001', process_id: 'P001', created_at: '2024-01-01' },
      { id: '4', name: '冷却液流量', value: '5', unit: 'L/min', device_id: 'CNC001', process_id: 'P001', created_at: '2024-01-01' }
    ]);

    setSteps([
      { id: '1', name: '原料准备', description: '检查原材料质量，确保符合标准', sequence: 1, process_id: 'P001', created_at: '2024-01-01' },
      { id: '2', name: '粗加工', description: '初步去除多余材料，达到粗糙尺寸', sequence: 2, process_id: 'P001', created_at: '2024-01-01' },
      { id: '3', name: '精加工', description: '精细加工达到最终尺寸要求', sequence: 3, process_id: 'P001', created_at: '2024-01-01' },
      { id: '4', name: '质量检验', description: '检验产品是否达到质量标准', sequence: 4, process_id: 'P001', created_at: '2024-01-01' },
      { id: '5', name: '清洁包装', description: '清洁产品表面并进行包装', sequence: 5, process_id: 'P001', created_at: '2024-01-01' }
    ]);

    setInstructions([
      { id: '1', title: '轴承加工工艺指导书', content: '1. 检查原材料质量\n2. 设置设备参数\n3. 按工序进行加工\n4. 质量检验\n5. 包装入库', process_id: 'P001', version: 'v1.0', created_at: '2024-01-01' },
      { id: '2', title: 'CNC设备操作规程', content: '1. 开机检查\n2. 工件装夹\n3. 程序设定\n4. 加工监控\n5. 工件检查', process_id: 'P001', version: 'v2.1', created_at: '2024-01-15' }
    ]);

    setChanges([
      { id: '1', process_id: 'P001', change_desc: '优化了精加工工序的切削参数，提高表面光洁度', changed_by: '工艺工程师', changed_at: '2024-03-01 10:30:00' },
      { id: '2', process_id: 'P001', change_desc: '增加了冷却液流量监控，确保加工温度稳定', changed_by: '设备工程师', changed_at: '2024-03-01 14:20:00' }
    ]);
  };

  const renderParameters = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">工艺参数管理</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增参数
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parameters.map((param) => (
          <div key={param.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{param.name}</h4>
              <span className="text-xs text-slate-400">{param.device_id}</span>
            </div>
            <div className="flex items-end space-x-2 mb-3">
              <span className="text-2xl font-bold text-blue-400">{param.value}</span>
              <span className="text-sm text-slate-400">{param.unit}</span>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                编辑
              </button>
              <button className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                监控
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSteps = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">工序管理</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增工序
        </button>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {step.sequence}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{step.name}</h4>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  编辑
                </button>
                <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  查看
                </button>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center mt-3">
                <div className="w-px h-4 bg-slate-600"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">作业指导书</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增指导书
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {instructions.map((instruction) => (
          <div key={instruction.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-medium">{instruction.title}</h4>
              <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">{instruction.version}</span>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">{instruction.content}</pre>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">创建: {instruction.created_at}</span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  编辑
                </button>
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  下载
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChanges = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">变更记录</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增变更
        </button>
      </div>
      
      <div className="space-y-3">
        {changes.map((change) => (
          <div key={change.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-white mb-2">{change.change_desc}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>变更人: {change.changed_by}</span>
                  <span>时间: {change.changed_at}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  详情
                </button>
                <button className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                  审核
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { key: 'parameters', label: '工艺参数', content: renderParameters },
    { key: 'steps', label: '工序管理', content: renderSteps },
    { key: 'instructions', label: '作业指导书', content: renderInstructions },
    { key: 'changes', label: '变更记录', content: renderChanges }
  ];

  return (
    <ResponsiveContainer>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">工艺管理</h1>
            <p className="text-slate-400">管理生产工艺参数、工序流程、作业指导书</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">工艺参数</p>
                <p className="text-2xl font-bold text-white mt-1">{parameters.length}</p>
              </div>
              <div className="text-3xl text-blue-500">⚙️</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">工序数量</p>
                <p className="text-2xl font-bold text-white mt-1">{steps.length}</p>
              </div>
              <div className="text-3xl text-green-500">🔧</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">指导书</p>
                <p className="text-2xl font-bold text-white mt-1">{instructions.length}</p>
              </div>
              <div className="text-3xl text-purple-500">📋</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">变更记录</p>
                <p className="text-2xl font-bold text-white mt-1">{changes.length}</p>
              </div>
              <div className="text-3xl text-orange-500">📝</div>
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

export default ProcessPage; 