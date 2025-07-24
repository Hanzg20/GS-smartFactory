import React, { useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from './base/ResponsiveContainer';
import { Card } from './base/Card';
import { DeviceList } from './DeviceList';
import DeviceDetail from './DeviceDetail';

interface Device {
  id: string;
  name: string;
  type: string;
  model: string;
  status: {
    online: boolean;
    running: boolean;
    alarm: boolean;
  };
  metrics?: {
    temperature: number;
    pressure: number;
    speed: number;
    runtime: number;
  };
}

export const DevicePage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const { isMobile } = useBreakpoint();

  return (
    <ResponsiveContainer maxWidth="2xl" className="py-6">
      <ResponsiveStack
        direction={{
          xs: 'column',
          lg: 'row'
        }}
        spacing={6}
      >
        {/* 设备列表 */}
        <div className={isMobile ? 'w-full' : 'w-1/3'}>
          <Card title="设备列表" isHoverable>
            <DeviceList onDeviceSelect={setSelectedDevice} />
          </Card>
        </div>

        {/* 设备详情 */}
        <div className={isMobile ? 'w-full' : 'w-2/3'}>
          {selectedDevice ? (
            <Card
              title={selectedDevice.name}
              subtitle={`类型: ${selectedDevice.type}`}
              variant="primary"
              isHoverable
            >
              <DeviceDetail device={selectedDevice} />
            </Card>
          ) : (
            <Card
              variant="secondary"
              className="h-full flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-slate-400">请选择一个设备查看详情</p>
              </div>
            </Card>
          )}
        </div>
      </ResponsiveStack>

      {/* 设备统计卡片 */}
      <div className="mt-6">
        <ResponsiveGrid
          cols={{
            xs: 1,
            sm: 2,
            lg: 4
          }}
          gap={6}
        >
          <Card
            title="总设备数"
            variant="primary"
            isHoverable
          >
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">24</p>
              <p className="text-sm text-slate-400 mt-1">台设备</p>
            </div>
          </Card>

          <Card
            title="在线设备"
            variant="success"
            isHoverable
          >
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">18</p>
              <p className="text-sm text-slate-400 mt-1">台在线</p>
            </div>
          </Card>

          <Card
            title="故障设备"
            variant="danger"
            isHoverable
          >
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm text-slate-400 mt-1">台故障</p>
            </div>
          </Card>

          <Card
            title="维护中"
            variant="warning"
            isHoverable
          >
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm text-slate-400 mt-1">台维护中</p>
            </div>
          </Card>
        </ResponsiveGrid>
      </div>

      {/* 移动端提示 */}
      <ResponsiveContainer
        showOn={['xs', 'sm']}
        className="mt-6"
      >
        <Card variant="info">
          <p className="text-center text-sm text-slate-400">
            提示：在移动设备上，建议横屏查看以获得更好的体验
          </p>
        </Card>
      </ResponsiveContainer>
    </ResponsiveContainer>
  );
}; 