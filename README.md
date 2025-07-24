# Industrial Control System Demo

## 🏭 GoldSky Technologies - 工业控制系统演示项目

### 项目概述
这是一个完整的工业控制系统演示项目，展示了现代工业自动化的核心技术和最佳实践。项目集成了TwinCAT ADS通信、OPC UA协议、实时数据监控和现代化的Web HMI界面。

### 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React HMI     │    │   Node.js       │    │   TwinCAT PLC   │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Controller)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   OPC UA Server │◄─────────────┘
                        └─────────────────┘
```

### 🛠️ 技术栈

- **前端**: React 18 + Vite + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + Socket.IO
- **通信**: ADS (Beckhoff TwinCAT) + OPC UA
- **容器化**: Docker + Docker Compose
- **监控**: InfluxDB + Grafana (可选)
- **流程控制**: Node-RED (可选)

### 📁 项目结构

```
industrial-control-demo/
├── frontend/                 # React HMI 前端
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── types/          # TypeScript类型定义
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Node.js 后端
│   ├── src/
│   │   ├── services/       # 服务层 (ADS, OPC UA)
│   │   ├── controllers/    # 控制器
│   │   ├── socket/         # Socket.IO处理器
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Docker编排配置
├── scripts/                 # 部署脚本
├── docs/                    # 项目文档
└── README.md
```

### 🚀 快速开始

#### 1. 克隆项目
```bash
git clone <repository-url>
cd industrial-control-demo
```

#### 2. 配置环境
```bash
cp backend/env.example .env
# 编辑 .env 文件，配置您的环境
```

#### 3. 启动系统
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

#### 4. 访问界面
- **HMI界面**: http://localhost:3000
- **后端API**: http://localhost:3001
- **健康检查**: http://localhost:3001/api/health

### 🎯 核心功能

#### 运动轴控制
- **实时监控**: 位置、速度、状态等参数
- **轴控制**: 使能/失能、回零、移动、点动
- **状态显示**: 空闲、运动中、错误、回零中
- **错误处理**: 错误代码和错误信息显示

#### 通信协议
- **ADS通信**: 与Beckhoff TwinCAT系统通信
- **OPC UA**: 工业标准OPC UA协议支持
- **实时数据**: WebSocket实时数据推送
- **容错机制**: 多协议备份和模拟模式

#### 用户界面
- **响应式设计**: 适配不同屏幕尺寸
- **实时更新**: 100ms数据刷新频率
- **状态指示**: 直观的连接状态和轴状态
- **操作控制**: 直观的按钮和输入控件

### 🔧 开发指南

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

#### 后端开发
```bash
cd backend
npm install
npm run dev
```

#### 添加新轴
1. 在 `backend/src/controllers/axis-controller.js` 中添加轴配置
2. 在 `backend/src/services/ads-client.js` 中添加ADS变量映射
3. 在前端组件中更新轴显示

#### 自定义UI组件
1. 在 `frontend/src/components/` 中创建新组件
2. 在 `frontend/src/types/` 中定义相关类型
3. 在主应用中集成组件

### 📊 监控和扩展

#### 启用监控系统
```bash
docker-compose --profile monitoring up -d
```
- **Grafana**: http://localhost:3002 (admin/admin)
- **InfluxDB**: http://localhost:8086

#### 启用Node-RED
```bash
docker-compose --profile nodered up -d
```
- **Node-RED**: http://localhost:1880

#### 启用OPC UA服务器
```bash
docker-compose --profile opcua up -d
```

### 🔒 安全特性

- **CORS配置**: 跨域请求安全控制
- **输入验证**: 所有用户输入验证
- **错误处理**: 完善的错误处理机制
- **日志记录**: 详细的操作日志
- **环境隔离**: Docker容器化部署

### 📈 性能特性

- **实时通信**: WebSocket实时数据推送
- **高效渲染**: React 18并发特性
- **缓存优化**: 静态资源缓存策略
- **负载均衡**: 支持多实例部署
- **监控指标**: 系统性能监控

### 🛠️ 部署选项

#### 开发环境
```bash
./scripts/start.sh
```

#### 生产环境
```bash
# 设置生产环境变量
export NODE_ENV=production

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

#### 高可用部署
- **Docker Swarm**: 支持集群部署
- **Kubernetes**: 支持K8s部署
- **负载均衡**: 支持多实例负载均衡

### 📚 文档

- [开发指南](docs/development.md) - 详细的开发文档
- [部署指南](docs/deployment.md) - 部署和运维文档
- [API文档](docs/api.md) - API接口文档

### 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

### 📞 联系信息

**GoldSky Technologies**  
📍 加拿大渥太华  
📧 contact@goldskytech.com  
🌐 www.goldskytech.com

### 🙏 致谢

- Beckhoff Automation GmbH - TwinCAT技术
- OPC Foundation - OPC UA标准
- React Team - 前端框架
- Node.js Community - 后端运行时

---

*此项目为工业控制系统演示和模板项目，可用于学习和二次开发* 

# [2025-07-17] 项目问题修复与改进记录

## 已修复问题
- 修复了Docker后端容器依赖安装问题，确保所有依赖都能正确安装。
- 优化了Windows下的启动脚本，提升一键启动体验。
- 补充了缺失的静态资源 clipboard_error.svg，解决前端404。
- 健康检查接口增加了数据库、WebSocket等依赖服务的状态检测。
- 修复了前端控制台警告（如重复ID、资源404）。

## 建议与后续改进
- 持续完善文档和注释。
- 加强日志和监控。
- 优化前后端数据流和高级功能。

--- 