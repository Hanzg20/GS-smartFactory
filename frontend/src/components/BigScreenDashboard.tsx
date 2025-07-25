import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import ReactECharts from 'echarts-for-react';
import { Card, Badge, Typography, Progress } from 'antd';
import { 
  DashboardOutlined, 
  SettingOutlined, 
  ExperimentOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import WorkshopFloorPlan from './WorkshopFloorPlan';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/styles.css';

const { Title, Text } = Typography;

interface BigScreenDashboardProps {
  fullScreen?: boolean;
}

const BigScreenDashboard: React.FC<BigScreenDashboardProps> = ({ fullScreen = false }) => {
  const { 
    kpiData, 
    deviceStatus, 
    alarms, 
    envData, 
    qualityData,
    materialData,
    processData,
    personnelData 
  } = useSupabaseRealtime();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // KPI指标配置
  const getKPIOption = () => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          borderWidth: 1,
          borderColor: '#464646'
        }
      },
      axisLine: { lineStyle: { width: 40 } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: [
        {
          value: kpiData.oee || 85,
          name: 'OEE',
          title: { offsetCenter: ['0%', '-30%'] },
          detail: { 
            offsetCenter: ['0%', '-20%'],
            formatter: '{value}%'
          }
        }
      ],
      title: {
        fontSize: 14,
        color: '#ffffff'
      },
      detail: {
        width: 50,
        height: 14,
        fontSize: 14,
        color: '#ffffff',
        borderColor: 'auto',
        borderRadius: 20,
        borderWidth: 1,
        formatter: '{value}%'
      }
    }]
  });

  // 设备状态饼图配置
  const getDeviceStatusOption = () => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#ffffff' }
    },
    series: [{
      name: '设备状态',
      type: 'pie',
      radius: '50%',
      data: [
        { value: deviceStatus.running || 12, name: '运行中', itemStyle: { color: '#52c41a' } },
        { value: deviceStatus.maintenance || 2, name: '维护中', itemStyle: { color: '#faad14' } },
        { value: deviceStatus.fault || 1, name: '故障', itemStyle: { color: '#ff4d4f' } },
        { value: deviceStatus.idle || 3, name: '空闲', itemStyle: { color: '#d9d9d9' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: { color: '#ffffff' }
    }]
  });

  // 趋势图配置
  const getTrendOption = () => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['温度', '湿度', '能耗'],
      textStyle: { color: '#ffffff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLabel: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#ffffff' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#ffffff' } },
      splitLine: { lineStyle: { color: '#333333' } }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        stack: 'Total',
        data: envData.temperature || [23, 24, 23, 25, 24, 23],
        itemStyle: { color: '#ff7875' }
      },
      {
        name: '湿度',
        type: 'line',
        stack: 'Total',
        data: envData.humidity || [55, 56, 54, 58, 57, 55],
        itemStyle: { color: '#40a9ff' }
      },
      {
        name: '能耗',
        type: 'line',
        stack: 'Total',
        data: envData.energy || [320, 332, 301, 334, 390, 330],
        itemStyle: { color: '#95de64' }
      }
    ]
  });

  // 报警统计配置
  const getAlarmPieOption = () => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      name: '报警分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold',
          color: '#ffffff'
        }
      },
      labelLine: { show: false },
      data: [
        { value: alarms.high || 5, name: '高级', itemStyle: { color: '#ff4d4f' } },
        { value: alarms.medium || 12, name: '中级', itemStyle: { color: '#faad14' } },
        { value: alarms.low || 8, name: '低级', itemStyle: { color: '#52c41a' } }
      ]
    }]
  });

  // 质量趋势配置
  const getQualityTrendOption = () => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLabel: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#ffffff' } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { 
        color: '#ffffff',
        formatter: '{value}%'
      },
      axisLine: { lineStyle: { color: '#ffffff' } },
      splitLine: { lineStyle: { color: '#333333' } }
    },
    series: [{
      name: '合格率',
      type: 'line',
      data: qualityData.passRate || [98.5, 99.2, 97.8, 98.9, 99.1, 98.7, 99.3],
      itemStyle: { color: '#52c41a' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(82, 196, 26, 0.8)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
          ]
        }
      }
    }]
  });

  // 物料库存配置
  const getMaterialInventoryOption = () => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['轴承钢', '精密轴承', '润滑油', '密封圈', '螺栓'],
      axisLabel: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#ffffff' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#ffffff' } },
      splitLine: { lineStyle: { color: '#333333' } }
    },
    series: [{
      name: '库存',
      type: 'bar',
      data: materialData.inventory || [1000, 500, 200, 800, 300],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#40a9ff' },
            { offset: 1, color: '#1890ff' }
          ]
        }
      }
    }]
  });

  // 布局配置
  const layout = [
    { i: 'header', x: 0, y: 0, w: 12, h: 1, static: true },
    { i: 'kpi', x: 0, y: 1, w: 2, h: 3 },
    { i: 'device-status', x: 2, y: 1, w: 2, h: 3 },
    { i: 'alarm-stats', x: 4, y: 1, w: 2, h: 3 },
    { i: 'personnel', x: 6, y: 1, w: 2, h: 3 },
    { i: 'workshop-map', x: 8, y: 1, w: 4, h: 6 },
    { i: 'material-inventory', x: 0, y: 4, w: 4, h: 3 },
    { i: 'quality-trend', x: 4, y: 4, w: 4, h: 3 },
    { i: 'env-trend', x: 0, y: 7, w: 6, h: 3 },
    { i: 'alarm-marquee', x: 6, y: 7, w: 6, h: 1, static: true },
    { i: 'process-monitor', x: 6, y: 8, w: 6, h: 2 }
  ];

  return (
    <div className={`big-screen-dashboard ${fullScreen ? 'fullscreen' : ''}`}>
      <style jsx>{`
        .big-screen-dashboard {
          background: linear-gradient(135deg, #0c1022 0%, #1a1f3a 100%);
          min-height: 100vh;
          color: white;
          overflow: hidden;
        }
        .big-screen-dashboard.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
        }
        .dashboard-header {
          background: linear-gradient(90deg, #1890ff 0%, #722ed1 100%);
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .dashboard-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          height: 100%;
          padding: 16px;
          transition: all 0.3s ease;
        }
        .dashboard-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .kpi-card {
          text-align: center;
        }
        .kpi-number {
          font-size: 48px;
          font-weight: bold;
          color: #52c41a;
          text-shadow: 0 0 10px rgba(82, 196, 26, 0.5);
        }
        .kpi-label {
          font-size: 16px;
          color: #d9d9d9;
          margin-top: 8px;
        }
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .alarm-marquee {
          background: rgba(255, 77, 79, 0.1);
          border: 1px solid #ff4d4f;
          border-radius: 8px;
          padding: 12px;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        .marquee-content {
          display: flex;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .process-monitor {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .process-step {
          display: flex;
          align-items: center;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .workshop-map-container {
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1920}
        isDraggable={false}
        isResizable={false}
        margin={[8, 8]}
      >
        {/* 顶部标题栏 */}
        <div key="header" className="dashboard-header">
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            智能制造工厂运营中心
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {currentTime.toLocaleString('zh-CN')} | 实时监控 | 数据驱动决策
          </Text>
        </div>

        {/* 人 - KPI总览 */}
        <div key="kpi" className="dashboard-card kpi-card">
          <UserOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 16 }} />
          <div className="kpi-number">{kpiData.oee || 85}</div>
          <div className="kpi-label">设备综合效率(OEE)</div>
          <Progress 
            percent={kpiData.oee || 85} 
            strokeColor="#52c41a" 
            trailColor="rgba(255,255,255,0.1)"
            showInfo={false}
            style={{ marginTop: 16 }}
          />
        </div>

        {/* 机 - 设备状态 */}
        <div key="device-status" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <SettingOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>设备状态</Title>
          </div>
          <ReactECharts option={getDeviceStatusOption()} style={{ height: '200px' }} />
        </div>

        {/* 测 - 报警统计 */}
        <div key="alarm-stats" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <WarningOutlined style={{ fontSize: 20, color: '#faad14', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>报警统计</Title>
          </div>
          <ReactECharts option={getAlarmPieOption()} style={{ height: '200px' }} />
        </div>

        {/* 人 - 人员状态 */}
        <div key="personnel" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <UserOutlined style={{ fontSize: 20, color: '#52c41a', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>人员状态</Title>
          </div>
          <div className="status-item">
            <Text style={{ color: '#d9d9d9' }}>在岗人员</Text>
            <Badge count={personnelData.onDuty || 45} style={{ backgroundColor: '#52c41a' }} />
          </div>
          <div className="status-item">
            <Text style={{ color: '#d9d9d9' }}>请假人员</Text>
            <Badge count={personnelData.leave || 3} style={{ backgroundColor: '#faad14' }} />
          </div>
          <div className="status-item">
            <Text style={{ color: '#d9d9d9' }}>培训人员</Text>
            <Badge count={personnelData.training || 8} style={{ backgroundColor: '#1890ff' }} />
          </div>
        </div>

        {/* 机 - 车间地图 */}
        <div key="workshop-map" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <DashboardOutlined style={{ fontSize: 20, color: '#722ed1', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>车间布局</Title>
          </div>
          <div className="workshop-map-container">
            <WorkshopFloorPlan deviceData={deviceStatus} />
          </div>
        </div>

        {/* 料 - 物料库存 */}
        <div key="material-inventory" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <ExperimentOutlined style={{ fontSize: 20, color: '#40a9ff', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>物料库存</Title>
          </div>
          <ReactECharts option={getMaterialInventoryOption()} style={{ height: '180px' }} />
        </div>

        {/* 测 - 质量趋势 */}
        <div key="quality-trend" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>质量趋势</Title>
          </div>
          <ReactECharts option={getQualityTrendOption()} style={{ height: '180px' }} />
        </div>

        {/* 环 - 环境趋势 */}
        <div key="env-trend" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <EnvironmentOutlined style={{ fontSize: 20, color: '#95de64', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>环境监测</Title>
          </div>
          <ReactECharts option={getTrendOption()} style={{ height: '180px' }} />
        </div>

        {/* 报警跑马灯 */}
        <div key="alarm-marquee" className="alarm-marquee">
          <div className="marquee-content">
            <Text style={{ color: '#ff4d4f', whiteSpace: 'nowrap' }}>
              🚨 设备A001温度异常 | 🔧 设备B005需要维护 | ⚠️ 车间C区湿度过高 | 📊 质检发现异常批次 |
            </Text>
          </div>
        </div>

        {/* 法 - 工艺监控 */}
        <div key="process-monitor" className="dashboard-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <SafetyOutlined style={{ fontSize: 20, color: '#fa8c16', marginRight: 8 }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>工艺监控</Title>
          </div>
          <div className="process-monitor">
            <div className="process-step">
              <Text style={{ color: '#52c41a' }}>粗加工</Text>
              <Badge status="success" text="正常" />
            </div>
            <div className="process-step">
              <Text style={{ color: '#1890ff' }}>精加工</Text>
              <Badge status="processing" text="运行中" />
            </div>
          </div>
        </div>
      </GridLayout>
    </div>
  );
};

export default BigScreenDashboard; 