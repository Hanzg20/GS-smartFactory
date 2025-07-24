# 开发指南

## 目录
1. 项目结构与核心模块
2. 开发环境与技术栈
3. 功能分类设计说明
4. 业务流程与典型用例
5. API与数据结构
6. 用户与权限管理
7. 前后端开发规范
8. 测试与质量保障
9. 部署与运维
10. 安全与合规
11. 国际化与本地化
12. 高级功能与未来规划
13. 贡献指南
14. 常见问题与故障排查

---

## 3. 功能分类设计说明

本系统功能采用业界最佳实践，按“人/机/料/法/环/测”六大生产要素进行专业化分类：
- **人**：人员管理、班组排班、操作记录、权限分配、培训档案等。
- **机**：设备管理、设备台账、设备状态监控、维保、报警、产线监控、OEE分析等。
- **料**：物料台账、库存管理、物料流转、批次追溯、物料预警等。
- **法**：工艺参数管理、作业指导书、工序流程配置、工艺变更记录等。
- **环**：车间环境监测（温湿度、能耗）、安环报警、能耗分析等。
- **测**：质量检测、检验记录、异常管理、返工返修、质量追溯、客户投诉等。

此分类有助于界面简洁、重点突出、专业化展示，并便于后续功能扩展和权限分配。

---

## 4. 业务流程与典型用例
- 工单流转、报警处理、设备维护、数据追溯等关键业务流程，建议配合流程图或时序图说明。
- 典型用例/用户故事，帮助开发者理解实际业务场景。

---

## 6. 用户与权限管理
- 详细说明角色类型（如老板/高管、主管、工程师、操作员、大屏等）、权限粒度、典型场景、接口设计。
- 权限模型建议采用RBAC，支持数据范围控制和操作粒度控制。

---

## 7. 前后端开发规范
- 代码风格、目录结构、命名约定、接口文档要求、测试覆盖率等。
- 代码审查、分支管理、CI/CD流程说明。

---

## 8. 测试与质量保障
- 单元测试、集成测试、端到端测试，测试用例编写、Mock策略、覆盖率要求。
- 自动化测试运行步骤。

---

## 9. 部署与运维
- 开发、测试、生产环境部署流程、配置差异、常见问题。
- 运维指南：日志分析、监控告警、备份恢复、升级/回滚流程。

---

## 10. 安全与合规
- 认证授权、数据加密、接口安全、操作审计、合规要求等。

---

## 11. 国际化与本地化
- 多语言支持、资源文件管理、切换机制、文化适配等。

---

## 12. 高级功能与未来规划
- 已规划功能、待评估功能，优先级和预期上线时间。

---

## 13. 贡献指南
- 参与开发、提Issue/PR、代码评审流程等。

---

## 14. 常见问题与故障排查
- 常见问题、排查步骤、日志分析方法等。

---

## 大屏可视化设计与实现建议

### 1. 视觉风格与品牌感
- 深色/夜景主题，主色调与企业VI一致，LOGO/品牌元素点缀。
- 大字号、大图标，适合远距离观看。
- 动效与渐变，适度使用数据动态增长、波纹、流光、渐变等，提升科技感。

### 2. 信息布局与内容创新
- 六大要素分区（人/机/料/法/环/测），形成独特业务地图。
- 多维数据融合：设备、产线、能耗、报警、质量、人员、物料等同屏展示，打造“工厂驾驶舱”。
- 地图+3D视图：嵌入2D/3D车间地图、设备分布、状态流动动画。
- 实时数据流/跑马灯：报警、异常、工单等用滚动条或弹窗实时推送。
- 趋势与对比：关键指标趋势线、同比/环比、目标达成率等，支持一键切换。

### 3. 交互与体验
- 全屏自适应，支持一键全屏、自动适配不同分辨率。
- 轮播与分屏，支持多页轮播、分屏展示不同车间/产线/业务线。
- 钻取与联动，点击某一板块可下钻到详细页面，或联动其他区域高亮/过滤。
- 自定义配置，支持管理员自定义大屏布局、主题、展示内容。

### 4. 创新亮点建议
- AI智能摘要：自动生成“今日工厂健康摘要”或“异常预警摘要”，用自然语言+图标展示。
- 数字孪生动画：设备/产线状态用动画流转、颜色变换、能耗流线等方式动态呈现。
- KPI仪表盘+进度环：核心指标用仪表盘、进度环、能量条等方式直观展示。
- 多终端联动：大屏与移动端、Pad联动，扫码查看详情或推送报警。
- 节日/特殊事件皮肤：节日、重大活动时自动切换主题皮肤，增强仪式感。

### 5. 业界最佳实践参考
- 华为、阿里云、腾讯云工业大屏：深色科技风、数据流动动画、3D地图、实时报警。
- 三一重工、海尔COSMOPlat：多维业务驾驶舱、六大要素分区、AI健康摘要、异常高亮。
- 腾讯智慧园区：园区地图+能耗流+人员分布+安防联动，极强空间感和互动性。

### 6. 推荐开源可视化组件/库
- ECharts（https://echarts.apache.org/）：工业大屏、仪表盘、地图、趋势图等。
- AntV G2/G6/L7（https://antv.vision/）：图表、关系图、地理可视化。
- Three.js（https://threejs.org/）：3D车间、设备、数字孪生。
- D3.js（https://d3js.org/）：自定义数据动画、复杂图表。
- Lottie（https://airbnb.io/lottie/）：高质量动效。
- GSAP（https://greensock.com/gsap/）：动画流畅。
- React-Grid-Layout、GoldenLayout：大屏自定义布局。

### 7. 技术实现建议
- 前端采用React+ECharts/AntV/Three.js等，后端通过WebSocket推送实时数据。
- 动效用CSS3、GSAP、Lottie、WebGL等提升流畅度。
- 支持大屏自定义配置、主题切换、内容轮播。

---

### 大屏可视化实现方案（技术选型与落地实践）

#### 1. 技术选型与组件分工
- ECharts / AntV G2：仪表盘、KPI大数字、趋势图、环形进度、报警统计等
- Three.js（@react-three/fiber）：3D车间、设备分布、数字孪生动画
- React-Grid-Layout：大屏自定义布局、分区拖拽、响应式适配
- AntV L7 / Mapbox：2D/3D地图、工厂/车间/设备地理分布、能耗流向
- WebSocket / Supabase Realtime：实时数据推送，前端自动刷新

#### 2. 推荐大屏页面结构（React 伪代码）
```jsx
import React from 'react';
import GridLayout from 'react-grid-layout';
import { Chart, Gauge, Line, Pie } from 'echarts-for-react';
import { MapboxScene, LineLayer } from '@antv/l7-react';
import { Canvas } from '@react-three/fiber';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';

export default function BigScreenDashboard() {
  const { kpiData, deviceStatus, alarms, envData, mapData, threeDData } = useSupabaseRealtime();
  return (
    <GridLayout className="layout" cols={12} rowHeight={100} width={1920}>
      {/* KPI大数字 */}
      <div key="kpi" data-grid={{x:0, y:0, w:3, h:2}}>
        <Chart option={getKPIOption(kpiData)} />
      </div>
      {/* 设备状态仪表盘 */}
      <div key="gauge" data-grid={{x:3, y:0, w:3, h:2}}>
        <Gauge option={getGaugeOption(deviceStatus)} />
    </div>
      {/* 趋势图 */}
      <div key="trend" data-grid={{x:6, y:0, w:3, h:2}}>
        <Line option={getTrendOption(envData)} />
    </div>
      {/* 报警统计饼图 */}
      <div key="alarm" data-grid={{x:9, y:0, w:3, h:2}}>
        <Pie option={getAlarmPieOption(alarms)} />
      </div>
      {/* 2D/3D地图 */}
      <div key="map" data-grid={{x:0, y:2, w:6, h:4}}>
        <MapboxScene map={{ center: [lng, lat], zoom: 16 }}>
          <LineLayer source={mapData} color="red" />
        </MapboxScene>
      </div>
      {/* 3D车间 */}
      <div key="three" data-grid={{x:6, y:2, w:6, h:4}}>
        <Canvas>
          <ThreeDWorkshopScene data={threeDData} />
        </Canvas>
    </div>
      {/* 实时报警跑马灯 */}
      <div key="marquee" data-grid={{x:0, y:6, w:12, h:1}}>
        <AlarmMarquee alarms={alarms} />
      </div>
    </GridLayout>
  );
}
```

#### 3. 实时数据推送（Supabase Realtime Hook 示例）
```js
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useSupabaseRealtime() {
  const [kpiData, setKpiData] = useState({});
  const [deviceStatus, setDeviceStatus] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [envData, setEnvData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [threeDData, setThreeDData] = useState([]);

  useEffect(() => {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    supabase.channel('device_status')
      .on('postgres_changes', { event: 'UPDATE', table: 'devices' }, payload => {
        setDeviceStatus(ds => updateDeviceStatus(ds, payload.new));
      }).subscribe();
    supabase.channel('alarms')
      .on('postgres_changes', { event: 'INSERT', table: 'alarm_records' }, payload => {
        setAlarms(a => [payload.new, ...a]);
      }).subscribe();
    supabase.channel('env_data')
      .on('postgres_changes', { event: 'INSERT', table: 'environment_data' }, payload => {
        setEnvData(e => [payload.new, ...e]);
      }).subscribe();
    // ... 其他表的订阅
    return () => supabase.removeAllChannels();
  }, []);
  return { kpiData, deviceStatus, alarms, envData, mapData, threeDData };
}
```

#### 4. 推荐开源组件/库
- ECharts for React：https://github.com/hustcc/echarts-for-react
- AntV G2Plot：https://g2plot.antv.vision/
- AntV L7：https://l7.antv.vision/
- Mapbox GL JS：https://docs.mapbox.com/mapbox-gl-js/
- Three.js（@react-three/fiber）：https://threejs.org/
- React-Grid-Layout：https://github.com/react-grid-layout/react-grid-layout
- GSAP/Lottie：动效增强
- Supabase-js：https://supabase.com/docs/reference/javascript

#### 5. 开发建议
- 先用 React-Grid-Layout 搭好大屏分区，逐步填充各业务组件。
- 每个区块用 ECharts/AntV/Three.js/L7 独立开发，数据通过 Supabase Realtime 实时推送。
- 业务数据和大屏配置可用 Supabase 表管理，支持自定义布局和主题。
- 动效和品牌感可用 CSS3/GSAP/Lottie 增强。

#### 6. 端到端测试建议
- 用 Cypress/Playwright 自动化测试大屏各区块数据刷新、交互、联动。
- 用 Supabase 控制台和 Postman 验证数据推送和 API。

---

<!-- 以上为标准化结构，后续可在各章节下细化具体内容 -->

--- 