import React, { useState, useEffect } from 'react';
import socket from '../lib/socket';
import WorkshopFloorPlan from './WorkshopFloorPlan';
import { Workshop3DView } from './Workshop3DView';
import DeviceDetail from './DeviceDetail';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Device, Workshop, DeviceStatus } from '../types/common';

const FactoryOverview: React.FC = () => {
  console.log('FactoryOverview component loaded!');
  
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'floor' | '3d' | 'list'>('floor');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    // 从Supabase加载车间数据
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: dbError } = await supabase
          .from('workshops')
          .select(`
            *,
            devices (*)
          `);

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          setWorkshops(data);
          setSelectedWorkshop(data[0].id); // 默认选中第一个车间
        } else {
          setWorkshops([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载车间数据失败';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  useEffect(() => {
    // Socket.io 事件处理
    const onConnect = () => {
      console.log('Socket connected!');
      setSocketConnected(true);
      toast.success('实时数据连接成功');
    };

    const onDisconnect = () => {
      console.log('Socket disconnected!');
      setSocketConnected(false);
      toast.error('实时数据连接断开');
    };

    const onConnectError = (err: Error) => {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
      toast.error('实时数据连接失败，请检查网络');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // 订阅设备数据
    if (selectedDevice) {
      socket.emit('subscribe_device', selectedDevice.id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);

      if (selectedDevice) {
        socket.emit('unsubscribe_device', selectedDevice.id);
      }
    };
  }, [selectedDevice]);

  const getStatusColor = (status: DeviceStatus) => {
    if (status.alarm) return 'red';
    if (!status.online) return 'gray';
    if (status.running) return 'green';
    return 'yellow';
  };

  const getStatusText = (status: DeviceStatus) => {
    if (status.alarm) return '报警';
    if (!status.online) return '离线';
    if (status.running) return '运行中';
    return '待机';
  };

  const selected = workshops.find(w => w.id === selectedWorkshop);

  // 添加调试信息
  console.log('FactoryOverview render:', {
    workshops: workshops.length,
    selectedWorkshop,
    selected: !!selected,
    activeTab,
    socketConnected
  });

  if (loading) {
    return (
      <div className="factory-overview p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">正在加载车间数据...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="factory-overview p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <h2 className="text-red-500 font-semibold mb-2">加载失败</h2>
          <p className="text-red-400">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="factory-overview p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">工厂设备监控系统</h1>
      
      {/* 连接状态 */}
      <div className={`mb-4 p-4 rounded flex items-center space-x-2 ${
        socketConnected ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
      }`}>
        <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <p className={socketConnected ? 'text-green-300' : 'text-red-300'}>
          {socketConnected ? '实时数据连接正常' : '实时数据连接失败'}
        </p>
      </div>
      
      {/* 调试信息 */}
      <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500 rounded">
        <p className="text-blue-300">调试信息: 车间数量={workshops.length}, 选中车间={selectedWorkshop}, 有选中={!!selected}</p>
      </div>
      
      {/* 车间选择器 */}
      <div className="workshop-selector mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-300">车间选择</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workshops.map((workshop) => (
            <button
              key={workshop.id}
              className={`p-4 rounded-lg transition-all ${
                selectedWorkshop === workshop.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => setSelectedWorkshop(workshop.id)}
            >
              <h3 className="text-lg font-semibold">{workshop.name}</h3>
              <p className="text-sm opacity-80">{workshop.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 视图切换器 */}
      <div className="view-selector mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'floor'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => setActiveTab('floor')}
          >
            平面图
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === '3d'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => setActiveTab('3d')}
          >
            3D视图
          </button>
        </div>
      </div>

      {/* 视图内容 */}
      {selected && (
        <div className="view-content">
          {activeTab === 'floor' && (
            <WorkshopFloorPlan workshop={selected} onDeviceSelect={setSelectedDevice} />
          )}
          {activeTab === '3d' && (
            <Workshop3DView deviceId={selectedDevice?.id} />
          )}
        </div>
      )}

      {/* 设备详情 */}
      {selectedDevice && (
        <div className="device-detail mt-6">
          <DeviceDetail device={selectedDevice} />
        </div>
      )}
    </div>
  );
};

export default FactoryOverview; 