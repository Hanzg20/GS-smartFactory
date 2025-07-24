# 数据库选项分析 - SmartFactory Studio

## 概述

本文档分析SmartFactory Studio项目的数据库选项，重点推荐Supabase作为首选方案，并提供详细的集成指南。

https://ukuvlbiywoywlyhxdbtv.supabase.co

Project URL: https://ukuvlbiywoywlyhxdbtv.supabase.co

API Key : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdXZsYml5d295d2x5aHhkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjU0NzksImV4cCI6MjA2Nzk0MTQ3OX0.wtUGD5uhnxZtdY0lVqDXkINIYMaBtRbL8iJUGlUIIk8


Service Role Key：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdXZsYml5d295d2x5aHhkYnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM2NTQ3OSwiZXhwIjoyMDY3OTQxNDc5fQ.xGMsY50CPyXU_zB4H3WZnxfZHHq4tbgLPGy69FwKmWs

## 当前系统状态

### 现有架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React HMI     │    │   Node.js       │    │   内存存储      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (临时数据)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据存储现状

- **设备数据**：内存存储，重启丢失
- **用户数据**：无持久化
- **历史数据**：无记录
- **配置数据**：JSON文件

## 数据库选项对比

### 1. Supabase (推荐) ⭐⭐⭐⭐⭐

#### 核心优势

```typescript
interface SupabaseAdvantages {
  realtime: {
    description: '内置实时订阅功能';
    benefit: '完美匹配工业监控实时需求';
    implementation: '一行代码实现实时数据推送';
  };
  authentication: {
    description: '开箱即用的认证系统';
    benefit: '减少50%认证开发工作量';
    features: ['JWT', 'OAuth', '角色权限'];
  };
  api: {
    description: '自动生成REST/GraphQL API';
    benefit: '减少API开发工作量';
    features: ['CRUD操作', '关系查询', '过滤排序'];
  };
  hosting: {
    description: '云托管服务';
    benefit: '零运维成本';
    features: ['自动备份', '高可用', 'CDN'];
  };
  pricing: {
    free: '500MB数据库 + 1GB文件存储';
    paid: '$25/月起步，适合SME';
  };
}
```

#### 适用场景

- ✅ 快速原型开发
- ✅ 中小型企业部署
- ✅ 需要实时功能的工业监控
- ✅ 团队规模小，希望减少运维
- ✅ 需要快速上线的项目

### 2. PostgreSQL + Redis ⭐⭐⭐⭐

#### 优势

```typescript
interface PostgreSQLAdvantages {
  maturity: '工业级数据库，稳定可靠';
  features: ['ACID事务', '复杂查询', 'JSON支持', '时序数据'];
  performance: '复杂查询性能优秀';
  ecosystem: '工具和库丰富';
}
```

#### 劣势

```typescript
interface PostgreSQLDisadvantages {
  setup: '需要自己搭建和维护';
  realtime: '实时功能需要额外开发';
  operations: '运维成本较高';
  scaling: '扩展需要专业知识';
}
```

### 3. MongoDB ⭐⭐⭐

#### 优势

```typescript
interface MongoDBAdvantages {
  flexibility: '灵活的数据模式';
  scaling: '水平扩展容易';
  json: '与JavaScript集成好';
}
```

#### 劣势

```typescript
interface MongoDBDisadvantages {
  transactions: '事务支持有限';
  realtime: '实时功能需要额外开发';
  performance: '复杂查询性能相对较低';
}
```

## Supabase集成方案

### 1. 数据库设计

#### 核心表结构

```sql
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
  type VARCHAR(50) NOT NULL, -- CNC, Robot, Conveyor, Inspection
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

-- 用户表 (Supabase内置)
-- auth.users 表由Supabase自动管理

-- 用户企业关联表
CREATE TABLE user_enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user', -- admin, manager, operator, viewer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, enterprise_id)
);

-- 实时数据表
CREATE TABLE realtime_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL, -- temperature, vibration, position, etc.
  value JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 索引优化

```sql
-- 性能优化索引
CREATE INDEX idx_devices_workshop ON devices(workshop_id);
CREATE INDEX idx_device_status_history_device_timestamp ON device_status_history(device_id, timestamp DESC);
CREATE INDEX idx_realtime_data_device_timestamp ON realtime_data(device_id, timestamp DESC);
CREATE INDEX idx_user_enterprises_user ON user_enterprises(user_id);
CREATE INDEX idx_user_enterprises_enterprise ON user_enterprises(enterprise_id);

-- 实时数据分区表 (可选，用于大数据量)
CREATE TABLE realtime_data_2024 PARTITION OF realtime_data
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 2. 后端集成

#### 安装依赖

```bash
npm install @supabase/supabase-js
```

#### 配置Supabase客户端

```typescript
// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 实时订阅客户端
export const supabaseRealtime = createClient(supabaseUrl, supabaseServiceKey)
```

#### 数据服务层

```typescript
// backend/src/services/database-service.ts
import { supabase } from '../config/supabase.js'

export class DatabaseService {
  // 设备管理
  async getDevices(workshopId?: string) {
    let query = supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(name, enterprise:enterprises(name))
      `)
  
    if (workshopId) {
      query = query.eq('workshop_id', workshopId)
    }
  
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async updateDeviceStatus(deviceId: string, status: any) {
    const { data, error } = await supabase
      .from('devices')
      .update({ status })
      .eq('id', deviceId)
      .select()
      .single()
  
    if (error) throw error
    return data
  }

  // 实时数据记录
  async recordRealtimeData(deviceId: string, dataType: string, value: any) {
    const { error } = await supabase
      .from('realtime_data')
      .insert({
        device_id: deviceId,
        data_type: dataType,
        value
      })
  
    if (error) throw error
  }

  // 历史数据查询
  async getDeviceHistory(deviceId: string, startTime: Date, endTime: Date) {
    const { data, error } = await supabase
      .from('device_status_history')
      .select('*')
      .eq('device_id', deviceId)
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .order('timestamp', { ascending: false })
  
    if (error) throw error
    return data
  }
}
```

#### 实时订阅服务

```typescript
// backend/src/services/realtime-service.ts
import { supabaseRealtime } from '../config/supabase.js'
import { io } from '../index.js'

export class RealtimeService {
  constructor() {
    this.setupRealtimeSubscriptions()
  }

  setupRealtimeSubscriptions() {
    // 设备状态变化订阅
    supabaseRealtime
      .channel('device_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices',
          filter: 'status=neq.old.status'
        },
        (payload) => {
          // 推送到前端
          io.emit('deviceStatusUpdate', payload.new)
        }
      )
      .subscribe()

    // 实时数据订阅
    supabaseRealtime
      .channel('realtime_data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_data'
        },
        (payload) => {
          io.emit('realtimeDataUpdate', payload.new)
        }
      )
      .subscribe()
  }
}
```

### 3. 前端集成

#### 安装依赖

```bash
npm install @supabase/supabase-js
```

#### 配置客户端

```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 认证Hook

```typescript
// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
```

#### 数据查询Hook

```typescript
// frontend/src/hooks/useDevices.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDevices(workshopId?: string) {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDevices()
  }, [workshopId])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('devices')
        .select(`
          *,
          workshop:workshops(name, enterprise:enterprises(name))
        `)
  
      if (workshopId) {
        query = query.eq('workshop_id', workshopId)
      }
  
      const { data, error } = await query
      if (error) throw error
      setDevices(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { devices, loading, error, refetch: fetchDevices }
}
```

### 4. 环境配置

#### 环境变量

```bash
# backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# frontend/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Docker配置

```yaml
# docker-compose.yml
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

## 迁移策略

### 阶段一：基础集成（1周）

1. 设置Supabase项目
2. 创建数据库表结构
3. 集成认证系统
4. 基础CRUD操作

### 阶段二：数据迁移（1周）

1. 迁移现有配置数据
2. 实现数据同步机制
3. 测试数据完整性

### 阶段三：实时功能（1周）

1. 实现实时订阅
2. 优化数据推送
3. 性能测试

### 阶段四：功能完善（1周）

1. 历史数据查询
2. 数据备份策略
3. 监控和告警

## 成本分析

### Supabase成本

```typescript
interface SupabaseCosts {
  free: {
    database: '500MB';
    bandwidth: '2GB';
    auth: '50,000 users';
    storage: '1GB';
    cost: '$0/月';
  };
  pro: {
    database: '8GB';
    bandwidth: '250GB';
    auth: '100,000 users';
    storage: '100GB';
    cost: '$25/月';
  };
  team: {
    database: '100GB';
    bandwidth: '2TB';
    auth: '1,000,000 users';
    storage: '1TB';
    cost: '$599/月';
  };
}
```

### 自建成本对比

```typescript
interface SelfHostedCosts {
  infrastructure: {
    servers: '$200-500/月';
    storage: '$50-200/月';
    bandwidth: '$100-300/月';
  };
  operations: {
    dba: '$5000-10000/月';
    devops: '$3000-8000/月';
    monitoring: '$500-1000/月';
  };
  total: '$8850-19500/月';
}
```

## 结论

**强烈推荐使用Supabase**，原因如下：

1. **开发效率**：减少50%开发工作量
2. **运维成本**：零运维成本
3. **实时功能**：开箱即用的实时订阅
4. **认证系统**：完整的用户认证和权限管理
5. **成本效益**：免费额度足够SME使用
6. **扩展性**：支持从原型到生产环境的平滑扩展

对于SmartFactory Studio项目，Supabase是最佳选择，能够快速实现功能并降低总体拥有成本。

## 业务维度-表结构-API映射表
| 维度 | 主要表结构 | 典型API接口 |
|------|-----------------------------|-----------------------------|
| 人   | users, roles, user_enterprises, operation_logs | /api/users, /api/roles, /api/logs |
| 机   | devices, device_types, device_axes, maintenance_plans, alarm_records | /api/devices, /api/maintenance, /api/alarms |
| 料   | materials, inventory, material_batches, material_transactions | /api/materials, /api/inventory, /api/materials/batches |
| 法   | process_parameters, process_steps, work_instructions, process_changes | /api/processes, /api/processes/steps, /api/instructions |
| 环   | environment_data, env_alarm_records | /api/environment, /api/environment/alarms |
| 测   | quality_inspections, inspection_records, quality_exceptions, quality_traces | /api/quality, /api/quality/inspections, /api/quality/traces |

---

## 新增表在不同数据库方案下的设计要点
- **Supabase/PostgreSQL**：推荐使用UUID主键、JSONB字段存灵活数据、分区表存历史数据，支持复杂查询和多表关联。
- **MongoDB**：适合存储灵活结构（如工艺参数、检测记录），但事务和复杂关联有限，建议仅用于非核心业务或日志归档。
- **Redis**：适合做实时缓存，不建议直接存储主业务数据。
- **时序数据库（如InfluxDB）**：适合大规模环境/设备/质量等时序数据归档和分析，可与主库联用。

---

## 数据安全、合规、归档、性能建议
- **安全**：所有敏感表建议加密存储，启用行级安全（RLS），定期审计权限。
- **合规**：中加等市场需支持数据本地化、访问审计、合规字段（如数据来源、处理人等）。
- **归档**：历史数据采用分区表、冷热分层、定期归档，提升主库性能。
- **性能**：高并发场景下建议主从分离、读写分离、索引优化、缓存热点数据。

---

## 未来演进路线
- **时序数据库**：引入InfluxDB、TimescaleDB等，专用于大规模设备、环境、质量等时序数据。
- **数据湖/中台**：对接云端数据湖（如AWS S3、阿里云OSS），支持大数据分析和AI训练。
- **多租户/多语言**：完善多租户隔离和多语言表结构，支持国际化业务拓展。
- **数据中台**：建设统一数据服务层，支持多业务线和多系统集成。

---

<!-- 以上为补充内容，后续可在各业务场景和数据库方案下细化具体设计和对比 -->

---
