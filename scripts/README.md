# SmartFactory Studio 脚本使用说明

## 快速启动

### 一键启动 (推荐)
```bash
# 双击运行或命令行执行
scripts\start.bat
```

### 高级启动 (包含状态检查)
```bash
# 包含错误处理和状态检查的启动脚本
scripts\start-advanced.bat
```

## 服务管理

### 停止所有服务
```bash
scripts\stop.bat
```

### 检查服务状态
```bash
scripts\status.bat
```

## 脚本功能说明

### start.bat
- ✅ 自动结束端口占用进程
- ✅ 自动安装依赖 (如果不存在)
- ✅ 启动后端服务 (端口: 3001)
- ✅ 启动前端服务 (端口: 5173)
- ✅ 自动打开浏览器

### start-advanced.bat
- ✅ 包含 start.bat 的所有功能
- ✅ Node.js 环境检查
- ✅ 错误处理和状态检查
- ✅ 服务启动状态验证
- ✅ 详细的进度显示

### stop.bat
- ✅ 停止后端服务
- ✅ 停止前端服务
- ✅ 清理端口占用

### status.bat
- ✅ 检查服务运行状态
- ✅ 显示进程ID
- ✅ 显示访问地址

## 手动启动 (如果脚本有问题)

### 后端启动
```bash
cd backend
npm install
npm start
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:3001

## 故障排除

### 端口被占用
脚本会自动结束占用端口的进程，如果仍有问题，可以手动运行：
```bash
# 查看端口占用
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 结束进程 (替换 PID 为实际进程ID)
taskkill /F /PID <PID>
```

### 依赖安装失败
确保已安装 Node.js，然后手动安装依赖：
```bash
cd backend && npm install
cd frontend && npm install
```

### 服务启动失败
检查错误日志，常见问题：
1. Node.js 版本不兼容
2. 端口被其他程序占用
3. 依赖包版本冲突

## 开发模式

### 开发环境变量
创建 `.env` 文件配置环境变量：
```env
# 后端配置
PORT=3001
NODE_ENV=development

# 前端配置
VITE_API_URL=http://localhost:3001
```

### 热重载
前端支持热重载，修改代码后会自动刷新页面。 