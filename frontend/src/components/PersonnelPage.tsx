import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';

interface PersonnelProfile {
  id: string;
  name: string;
  employee_id: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  hire_date: string;
  status: string;
}

interface Position {
  id: string;
  name: string;
  department: string;
  description: string;
  requirements: string;
  created_at: string;
}

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  description: string;
  created_at: string;
}

interface Schedule {
  id: string;
  person_id: string;
  person_name?: string;
  shift_id: string;
  shift_name?: string;
  date: string;
  created_at: string;
}

const PersonnelPage: React.FC = () => {
  const [profiles, setProfiles] = useState<PersonnelProfile[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentTab, setCurrentTab] = useState('profiles');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setProfiles([
      { id: '1', name: '张三', employee_id: 'EMP001', position: 'CNC操作员', department: '生产部', phone: '138****1234', email: 'zhangsan@company.com', hire_date: '2023-01-15', status: '在职' },
      { id: '2', name: '李四', employee_id: 'EMP002', position: '质检员', department: '质量部', phone: '139****5678', email: 'lisi@company.com', hire_date: '2023-02-20', status: '在职' },
      { id: '3', name: '王五', employee_id: 'EMP003', position: '维修工程师', department: '设备部', phone: '137****9012', email: 'wangwu@company.com', hire_date: '2022-08-10', status: '在职' },
      { id: '4', name: '赵六', employee_id: 'EMP004', position: '班组长', department: '生产部', phone: '136****3456', email: 'zhaoliu@company.com', hire_date: '2021-05-03', status: '在职' },
      { id: '5', name: '钱七', employee_id: 'EMP005', position: '工艺工程师', department: '技术部', phone: '135****7890', email: 'qianqi@company.com', hire_date: '2023-03-12', status: '请假' }
    ]);

    setPositions([
      { id: '1', name: 'CNC操作员', department: '生产部', description: '负责CNC设备的操作和日常维护', requirements: '技校以上学历，有CNC操作经验', created_at: '2024-01-01' },
      { id: '2', name: '质检员', department: '质量部', description: '负责产品质量检验和记录', requirements: '大专以上学历，熟悉质量标准', created_at: '2024-01-01' },
      { id: '3', name: '维修工程师', department: '设备部', description: '负责设备维修和保养', requirements: '本科以上学历，机械或电气专业', created_at: '2024-01-01' },
      { id: '4', name: '班组长', department: '生产部', description: '负责班组管理和生产协调', requirements: '3年以上相关工作经验', created_at: '2024-01-01' },
      { id: '5', name: '工艺工程师', department: '技术部', description: '负责生产工艺设计和优化', requirements: '本科以上学历，工艺设计经验', created_at: '2024-01-01' }
    ]);

    setShifts([
      { id: '1', name: '早班', start_time: '08:00', end_time: '16:00', description: '早班 8小时工作制', created_at: '2024-01-01' },
      { id: '2', name: '中班', start_time: '16:00', end_time: '00:00', description: '中班 8小时工作制', created_at: '2024-01-01' },
      { id: '3', name: '夜班', start_time: '00:00', end_time: '08:00', description: '夜班 8小时工作制', created_at: '2024-01-01' },
      { id: '4', name: '白班', start_time: '09:00', end_time: '17:00', description: '白班 标准工作时间', created_at: '2024-01-01' }
    ]);

    setSchedules([
      { id: '1', person_id: '1', person_name: '张三', shift_id: '1', shift_name: '早班', date: '2024-03-01', created_at: '2024-02-28' },
      { id: '2', person_id: '2', person_name: '李四', shift_id: '4', shift_name: '白班', date: '2024-03-01', created_at: '2024-02-28' },
      { id: '3', person_id: '3', person_name: '王五', shift_id: '1', shift_name: '早班', date: '2024-03-01', created_at: '2024-02-28' },
      { id: '4', person_id: '4', person_name: '赵六', shift_id: '2', shift_name: '中班', date: '2024-03-01', created_at: '2024-02-28' },
      { id: '5', person_id: '1', person_name: '张三', shift_id: '2', shift_name: '中班', date: '2024-03-02', created_at: '2024-02-28' }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '在职': return 'text-green-400 bg-green-400/20';
      case '请假': return 'text-yellow-400 bg-yellow-400/20';
      case '离职': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const renderProfiles = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">人员档案</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增人员
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{profile.name}</h4>
                  <p className="text-sm text-slate-400">{profile.employee_id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(profile.status)}`}>
                {profile.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">岗位:</span>
                <span className="text-slate-300">{profile.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">部门:</span>
                <span className="text-slate-300">{profile.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">手机:</span>
                <span className="text-slate-300">{profile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">入职日期:</span>
                <span className="text-slate-300">{profile.hire_date}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                编辑
              </button>
              <button className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                查看详情
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPositions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">岗位管理</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增岗位
        </button>
      </div>
      
      <div className="space-y-3">
        {positions.map((position) => (
          <div key={position.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-white font-medium">{position.name}</h4>
                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">{position.department}</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{position.description}</p>
                <p className="text-xs text-slate-500">任职要求: {position.requirements}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  编辑
                </button>
                <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  招聘
                </button>
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">当前人数:</span>
                <span className="text-blue-400">{profiles.filter(p => p.position === position.name).length} 人</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShifts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">班次管理</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          新增班次
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => (
          <div key={shift.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-medium mb-1">{shift.name}</h4>
                <p className="text-sm text-slate-400">{shift.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-400">
                  {shift.start_time} - {shift.end_time}
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-400">今日安排人数:</span>
                <span className="text-green-400 font-medium">
                  {schedules.filter(s => s.shift_id === shift.id && s.date === '2024-03-01').length} 人
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                  编辑
                </button>
                <button className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  排班
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">排班计划</h3>
        <div className="flex space-x-2">
          <input 
            type="date" 
            defaultValue="2024-03-01"
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            查询
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            新增排班
          </button>
        </div>
      </div>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">姓名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">班次</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {schedules.map((schedule) => {
                const shift = shifts.find(s => s.id === schedule.shift_id);
                return (
                  <tr key={schedule.id} className="hover:bg-slate-700/25">
                    <td className="px-4 py-3 text-sm text-white">{schedule.person_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                        {schedule.shift_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{schedule.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {shift ? `${shift.start_time} - ${shift.end_time}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="text-xs text-blue-400 hover:text-blue-300">编辑</button>
                        <button className="text-xs text-red-400 hover:text-red-300">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { key: 'profiles', label: '人员档案', content: renderProfiles },
    { key: 'positions', label: '岗位管理', content: renderPositions },
    { key: 'shifts', label: '班次管理', content: renderShifts },
    { key: 'schedules', label: '排班计划', content: renderSchedules }
  ];

  const getPersonnelStats = () => {
    const totalPersonnel = profiles.length;
    const onDutyPersonnel = profiles.filter(p => p.status === '在职').length;
    const totalPositions = positions.length;
    const todaySchedules = schedules.filter(s => s.date === '2024-03-01').length;

    return { totalPersonnel, onDutyPersonnel, totalPositions, todaySchedules };
  };

  const stats = getPersonnelStats();

  return (
    <ResponsiveContainer>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">人员管理</h1>
            <p className="text-slate-400">管理人员档案、岗位配置、班次安排</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">总人数</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalPersonnel}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">在职人员</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.onDutyPersonnel}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">岗位数量</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.totalPositions}</p>
              </div>
              <div className="text-3xl">💼</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">今日排班</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{stats.todaySchedules}</p>
              </div>
              <div className="text-3xl">📅</div>
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

export default PersonnelPage; 