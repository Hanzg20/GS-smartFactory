# Supabase 快速设置指南

## 🚀 立即开始

### 1. 获取Service Key

1. 访问您的Supabase项目：https://ukuvlbiywoywlyhxdbtv.supabase.co
2. 进入 **Settings** → **API**
3. 复制 **service_role key** (以 `eyJ...` 开头的长字符串)
4. 将service key替换到环境变量文件中

### 2. 创建数据库表

1. 在Supabase仪表板中，进入 **SQL Editor**
2. 复制 `supabase-setup.sql` 文件中的所有内容
3. 粘贴到SQL编辑器中并执行
4. 这将创建所有必要的表和测试数据

### 3. 配置环境变量

#### 后端配置
创建 `backend/.env` 文件：
```bash
# 复制 env.example 到 backend/.env
cp env.example backend/.env

# 编辑 backend/.env，替换 service key
SUPABASE_SERVICE_KEY=your-actual-service-key-here
```

#### 前端配置
创建 `frontend/.env` 文件：
```bash
# 复制 env.example 到 frontend/.env
cp env.example frontend/.env
```

### 4. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd frontend
npm install
```

### 5. 启动系统

```bash
# 启动完整系统
./scripts/start.sh

# 或者分别启动
cd backend && npm run dev
cd frontend && npm run dev
```

## 📊 验证设置

### 1. 检查数据库连接
访问：http://localhost:3001/api/health

### 2. 查看测试数据
在Supabase仪表板的 **Table Editor** 中查看：
- `enterprises` 表
- `workshops` 表  
- `devices` 表

### 3. 测试实时功能
- 前端：http://localhost:3000
- 查看设备状态实时更新

## 🔧 故障排除

### 连接失败
```bash
# 检查环境变量
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# 测试连接
curl -I https://ukuvlbiywoywlyhxdbtv.supabase.co
```

### 权限错误
在Supabase SQL编辑器中执行：
```sql
-- 临时禁用RLS进行测试
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
```

### 实时订阅不工作
检查Supabase仪表板中的 **Realtime** 设置，确保启用了实时复制。

## 📈 下一步

1. ✅ 完成基础设置
2. 🔄 测试实时数据功能
3. 🔐 配置用户认证
4. 📊 添加数据可视化
5. 🚀 部署到生产环境

## 📞 支持

如果遇到问题：
1. 检查Supabase仪表板的 **Logs** 部分
2. 查看浏览器控制台错误
3. 检查后端日志：`logs/app.log` 