import React, { useState, useEffect } from 'react';
import { VirtualList } from './VirtualList';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Alarm {
  id: string;
  type: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

const ITEM_HEIGHT = 80; // 每个告警项的固定高度

const AlarmList: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    execute: fetchAlarms,
    isError,
    retry
  } = useErrorHandler(async () => {
    const response = await fetch('/api/alarms');
    if (!response.ok) throw new Error('Failed to fetch alarms');
    const data = await response.json();
    setAlarms(data);
  }, {
    fallbackMessage: '加载告警列表失败'
  });

  useEffect(() => {
    fetchAlarms();
  }, [fetchAlarms]);

  const filteredAlarms = alarms.filter(alarm => {
    const matchesFilter = filter === 'all' || alarm.type === filter;
    const matchesSearch = alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alarm.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAcknowledge = async (alarmId: string) => {
    try {
      const response = await fetch(`/api/alarms/${alarmId}/acknowledge`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to acknowledge alarm');
      
      setAlarms(prev =>
        prev.map(alarm =>
          alarm.id === alarmId
            ? { ...alarm, status: 'acknowledged' }
            : alarm
        )
      );
      
      toast.success('告警已确认');
    } catch (error) {
      toast.error('确认告警失败');
    }
  };

  const renderAlarmItem = (alarm: Alarm) => {
    const getIcon = () => {
      switch (alarm.type) {
        case 'critical':
          return <AlertTriangle className="w-6 h-6 text-red-500" />;
        case 'error':
          return <AlertCircle className="w-6 h-6 text-orange-500" />;
        case 'warning':
          return <Bell className="w-6 h-6 text-yellow-500" />;
        default:
          return <Info className="w-6 h-6 text-blue-500" />;
      }
    };

    return (
      <div
        key={alarm.id}
        className="tech-card tech-card-hover p-4 cursor-pointer"
        style={{ height: ITEM_HEIGHT }}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-slate-200 truncate">
                {alarm.deviceName}
              </h4>
              <span className="text-sm text-slate-400">
                {new Date(alarm.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400 line-clamp-2">
              {alarm.message}
            </p>
          </div>
          {alarm.status === 'active' && (
            <button
              onClick={() => handleAcknowledge(alarm.id)}
              className="btn-primary text-sm px-3 py-1"
            >
              确认
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 过滤器和搜索 */}
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="搜索告警..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="tech-input flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="tech-input w-32"
        >
          <option value="all">全部</option>
          <option value="critical">严重</option>
          <option value="error">错误</option>
          <option value="warning">警告</option>
          <option value="info">信息</option>
        </select>
      </div>

      {/* 虚拟列表 */}
      <VirtualList
        items={filteredAlarms}
        height={600}
        itemHeight={ITEM_HEIGHT}
        renderItem={(alarm) => renderAlarmItem(alarm)}
        className="tech-card"
      />
    </div>
  );
};

export default AlarmList; 