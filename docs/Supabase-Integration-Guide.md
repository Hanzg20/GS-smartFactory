# Supabase 快速集成指南

## 概述

本指南将帮助您在SmartFactory Studio项目中快速集成Supabase，实现数据持久化和实时功能。

## 1. 设置Supabase项目

### 1.1 创建项目
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用GitHub或Google账号登录
4. 创建新项目，选择组织

### 1.2 获取配置信息
在项目设置中找到：
- **Project URL**: `https://your-project.supabase.co`
- **anon public key**: 用于前端
- **service_role key**: 用于后端（保密）

## 2. 数据库设置

### 2.1 创建表结构
在Supabase SQL编辑器中执行以下SQL：

```sql
-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 企业表
CREATE TABLE enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 车间表
CREATE TABLE workshops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  floor_plan_url TEXT,
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设备表
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  type VARCHAR(50) NOT NULL,
  axes_count INTEGER DEFAULT 0,
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  rotation DECIMAL(5,2),
  image_url TEXT,
  status JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设备状态历史表
CREATE TABLE device_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  status JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 实时数据表
CREATE TABLE realtime_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  value JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_devices_workshop ON devices(workshop_id);
CREATE INDEX idx_device_status_history_device_timestamp ON device_status_history(device_id, timestamp DESC);
CREATE INDEX idx_realtime_data_device_timestamp ON realtime_data(device_id, timestamp DESC);
```

### 2.2 启用实时功能
1. 在Supabase仪表板中，进入 "Database" → "Replication"
2. 启用所有表的实时复制
3. 配置实时订阅权限

## 3. 环境配置

### 3.1 后端配置
编辑 `backend/.env` 文件：

```bash
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3.2 前端配置
创建 `frontend/.env` 文件：

```bash
# Supabase配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 安装依赖

### 4.1 后端依赖
```bash
cd backend
npm install @supabase/supabase-js
```

### 4.2 前端依赖
```bash
cd frontend
npm install @supabase/supabase-js
```

## 5. 代码集成

### 5.1 后端集成
已创建的文件：
- `backend/src/services/supabase-service.js` - Supabase服务类
- 更新了 `backend/package.json` 和 `backend/env.example`

### 5.2 前端集成
已创建的文件：
- `frontend/src/lib/supabase.ts` - Supabase客户端配置
- `frontend/src/hooks/useSupabase.ts` - 数据查询Hook
- 更新了 `frontend/package.json` 和 `frontend/src/vite-env.d.ts`

## 6. 数据迁移

### 6.1 从内存数据迁移
```javascript
// 在backend/src/index.js中添加
import { SupabaseService } from './services/supabase-service.js'

const supabaseService = new SupabaseService()

// 迁移现有数据
async function migrateData() {
  try {
    const workshopService = new WorkshopService()
    const workshops = workshopService.getWorkshops()
    const devices = workshopService.getAllDevices()
    
    await supabaseService.migrateFromMemory(workshops, devices)
    console.log('数据迁移完成')
  } catch (error) {
    console.error('数据迁移失败:', error)
  }
}

// 在服务启动时执行迁移
migrateData()
```

### 6.2 测试数据插入
```sql
-- 插入测试企业
INSERT INTO enterprises (name, description) 
VALUES ('GoldSky Technologies', '智能制造解决方案提供商');

-- 插入测试车间
INSERT INTO workshops (name, description, width, height) 
VALUES ('CNC加工车间', '精密零件加工车间', 800, 600);

-- 插入测试设备
INSERT INTO devices (workshop_id, name, model, type, axes_count, position_x, position_y) 
SELECT 
  w.id,
  '精密加工中心',
  'DMG MORI NHX5000',
  'CNC',
  5,
  100,
  150
FROM workshops w 
WHERE w.name = 'CNC加工车间';
```

## 7. 实时功能测试

### 7.1 后端实时订阅
```javascript
// 在backend/src/index.js中设置实时订阅
supabaseService.setupRealtimeSubscriptions(io)
```

### 7.2 前端实时监听
```typescript
// 在React组件中使用
import { useRealtimeSubscription } from '../hooks/useSupabase'

function FactoryOverview() {
  useRealtimeSubscription() // 启用实时订阅
  
  // 组件逻辑...
}
```

## 8. 权限配置

### 8.1 行级安全策略
```sql
-- 启用RLS
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_data ENABLE ROW LEVEL SECURITY;

-- 创建策略（示例：允许所有操作）
CREATE POLICY "Allow all operations" ON workshops FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON devices FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON realtime_data FOR ALL USING (true);
```

### 8.2 认证配置
```sql
-- 创建用户角色表
CREATE TABLE user_enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, enterprise_id)
);
```

## 9. 部署配置

### 9.1 Docker环境变量
更新 `docker-compose.yml`：

```yaml
services:
  backend:
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
  
  frontend:
    environment:
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

### 9.2 生产环境配置
```bash
# 生产环境变量
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-production-service-key
SUPABASE_ANON_KEY=your-production-anon-key
```

## 10. 监控和调试

### 10.1 Supabase仪表板
- **Database**: 查看表结构和数据
- **Logs**: 查看API调用日志
- **Realtime**: 监控实时连接
- **Auth**: 管理用户认证

### 10.2 健康检查
```javascript
// 检查数据库连接
const health = await supabaseService.healthCheck()
console.log('数据库状态:', health)
```

## 11. 性能优化

### 11.1 查询优化
```sql
-- 添加复合索引
CREATE INDEX idx_devices_workshop_type ON devices(workshop_id, type);
CREATE INDEX idx_realtime_data_device_type ON realtime_data(device_id, data_type, timestamp DESC);
```

### 11.2 数据分区
```sql
-- 按时间分区实时数据表
CREATE TABLE realtime_data_2024 PARTITION OF realtime_data
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## 12. 故障排除

### 12.1 常见问题

#### 连接失败
```bash
# 检查环境变量
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# 检查网络连接
curl -I https://your-project.supabase.co
```

#### 权限错误
```sql
-- 检查RLS策略
SELECT * FROM pg_policies WHERE tablename = 'devices';

-- 临时禁用RLS进行测试
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
```

#### 实时订阅不工作
```javascript
// 检查实时连接
supabase
  .channel('test')
  .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## 13. 下一步

### 13.1 功能扩展
- [ ] 用户认证和权限管理
- [ ] 数据备份和恢复
- [ ] 性能监控和告警
- [ ] 多租户支持

### 13.2 最佳实践
- [ ] 定期数据备份
- [ ] 监控API使用量
- [ ] 优化查询性能
- [ ] 安全审计

## 总结

通过以上步骤，您已经成功将Supabase集成到SmartFactory Studio项目中。Supabase提供了：

1. **开箱即用的数据库**：PostgreSQL + 实时功能
2. **自动API生成**：减少后端开发工作量
3. **实时订阅**：完美匹配工业监控需求
4. **云托管**：零运维成本
5. **免费额度**：适合SME使用

现在您的系统具备了完整的数据持久化、实时功能和用户管理能力，可以支持从原型到生产环境的平滑扩展。 