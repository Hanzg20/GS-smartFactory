# SmartFactory Studio 完整设置指南

## 🚀 第一步：安装Node.js

### Windows系统
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载并安装 **LTS版本** (推荐18.x或20.x)
3. 安装完成后，重启命令行
4. 验证安装：
   ```bash
   node --version
   npm --version
   ```

### 验证安装
```bash
# 检查Node.js版本
node --version

# 检查npm版本  
npm --version
```

## 🔧 第二步：Supabase设置

### 1. 获取Service Key
1. 访问您的Supabase项目：https://ukuvlbiywoywlyhxdbtv.supabase.co
2. 进入 **Settings** → **API**
3. 复制 **service_role key** (以 `eyJ...` 开头的长字符串)

### 2. 创建数据库表
1. 在Supabase仪表板中，进入 **SQL Editor**
2. 复制 `supabase-setup.sql` 文件中的所有内容
3. 粘贴到SQL编辑器中并执行
4. 这将创建所有必要的表和测试数据

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp env.example backend/.env
cp env.example frontend/.env

# 编辑 backend/.env，替换service key
# 将 SUPABASE_SERVICE_KEY=your-service-key-here
# 替换为实际的service key
```

## 📦 第三步：安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd frontend
npm install
```

## 🧪 第四步：测试连接

### 运行测试脚本
```bash
# 在项目根目录
node test-supabase.js
```

### 预期输出
```
🔍 测试Supabase连接...
URL: https://ukuvlbiywoywlyhxdbtv.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📡 测试数据库连接...
✅ 企业表连接成功
📊 企业数据: [{ id: '...', name: 'GoldSky Technologies', ... }]
✅ 车间表连接成功
📊 车间数据: [{ id: '...', name: 'CNC加工车间', ... }]
✅ 设备表连接成功
📊 设备数据: [{ id: '...', name: '精密加工中心', ... }]

📡 测试实时订阅...
✅ 实时订阅工作正常
✅ 实时订阅测试完成

🎉 所有测试通过！Supabase集成成功！
```

## 🚀 第五步：启动系统

### 方式一：使用Docker (推荐)
```bash
# 启动完整系统
./scripts/start.sh

# 或者Windows
./scripts/start.bat
```

### 方式二：分别启动
```bash
# 启动后端
cd backend
npm run dev

# 新开一个终端，启动前端
cd frontend
npm run dev
```

## 📊 第六步：验证系统

### 1. 检查服务状态
- 后端API: http://localhost:3001/api/health
- 前端界面: http://localhost:3000
- 健康检查: http://localhost:3001/api/health

### 2. 查看数据
在Supabase仪表板的 **Table Editor** 中查看：
- `enterprises` 表 - 企业信息
- `workshops` 表 - 车间信息
- `devices` 表 - 设备信息

### 3. 测试实时功能
- 访问前端界面
- 查看设备状态实时更新
- 测试设备控制功能

## 🔧 故障排除

### Node.js未安装
```bash
# 错误信息：'node' is not recognized
# 解决方案：安装Node.js LTS版本
```

### npm未安装
```bash
# 错误信息：'npm' is not recognized  
# 解决方案：重新安装Node.js，确保包含npm
```

### Supabase连接失败
```bash
# 检查环境变量
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# 测试网络连接
curl -I https://ukuvlbiywoywlyhxdbtv.supabase.co
```

### 数据库表不存在
```bash
# 错误信息：relation "enterprises" does not exist
# 解决方案：在Supabase中执行supabase-setup.sql脚本
```

### 权限错误
在Supabase SQL编辑器中执行：
```sql
-- 临时禁用RLS进行测试
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
```

## 📈 成功标志

✅ **Node.js和npm正常工作**
✅ **Supabase连接成功**
✅ **数据库表创建完成**
✅ **测试数据插入成功**
✅ **实时订阅功能正常**
✅ **前端界面可以访问**
✅ **后端API响应正常**

## 🎯 下一步

1. **功能测试**：测试设备监控和控制功能
2. **数据验证**：确认实时数据更新正常
3. **用户认证**：配置用户登录和权限管理
4. **生产部署**：配置生产环境变量
5. **性能优化**：监控和优化系统性能

## 📞 支持

如果遇到问题：
1. 检查Node.js和npm是否正确安装
2. 验证Supabase项目配置
3. 查看浏览器控制台错误
4. 检查后端日志：`logs/app.log`
5. 参考Supabase仪表板的 **Logs** 部分

---

**恭喜！** 如果所有步骤都成功完成，您的SmartFactory Studio系统已经成功集成了Supabase，具备了完整的数据持久化和实时功能！