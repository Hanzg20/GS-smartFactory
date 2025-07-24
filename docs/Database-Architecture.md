# SmartFactory Studio 数据库架构设计

## 维度分类说明（人/机/料/法/环/测）
本数据库架构遵循智能制造业界最佳实践，所有表结构和功能均按“人（人员）、机（设备）、料（物料）、法（工艺）、环（环境）、测（质量）”六大生产要素进行归类，便于业务映射、权限分配和后续扩展。

- **人**：用户、角色、组织、权限、操作日志等
- **机**：设备、设备类型、设备轴、设备状态、维护、报警等
- **料**：物料、库存、批次、出入库、物料追溯等
- **法**：工艺参数、工序、作业指导书、工艺变更等
- **环**：环境监测、能耗、安环报警等
- **测**：质量检测、检验、异常、返工、质量追溯等

---

## 物料管理（料）相关表

### 物料台账表（materials）
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50), -- 原材料/半成品/成品
  spec VARCHAR(100),
  unit VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 库存表（inventory）
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  quantity DECIMAL(18,4) NOT NULL,
  location VARCHAR(100),
  batch_no VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 物料批次表（material_batches）
```sql
CREATE TABLE material_batches (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  batch_no VARCHAR(50) NOT NULL,
  production_date DATE,
  expiry_date DATE,
  supplier VARCHAR(100),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 出入库记录表（material_transactions）
```sql
CREATE TABLE material_transactions (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  batch_id UUID REFERENCES material_batches(id),
  type VARCHAR(20), -- 入库/出库/退库
  quantity DECIMAL(18,4),
  operator_id UUID,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 工艺管理（法）相关表

### 工艺参数表（process_parameters）
```sql
CREATE TABLE process_parameters (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(100),
  unit VARCHAR(20),
  device_id UUID REFERENCES devices(id),
  process_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 工序表（process_steps）
```sql
CREATE TABLE process_steps (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sequence INT,
  process_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 作业指导书表（work_instructions）
```sql
CREATE TABLE work_instructions (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  process_id UUID,
  version VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 工艺变更记录表（process_changes）
```sql
CREATE TABLE process_changes (
  id UUID PRIMARY KEY,
  process_id UUID,
  change_desc TEXT,
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 质量管理（测）相关表

### 质量检测表（quality_inspections）
```sql
CREATE TABLE quality_inspections (
  id UUID PRIMARY KEY,
  object_type VARCHAR(20), -- 设备/物料/工序/批次
  object_id UUID,
  inspection_type VARCHAR(50),
  result VARCHAR(20),
  inspector_id UUID,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 检验记录表（inspection_records）
```sql
CREATE TABLE inspection_records (
  id UUID PRIMARY KEY,
  inspection_id UUID REFERENCES quality_inspections(id),
  item VARCHAR(100),
  value VARCHAR(100),
  result VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 异常与返工表（quality_exceptions）
```sql
CREATE TABLE quality_exceptions (
  id UUID PRIMARY KEY,
  related_object_type VARCHAR(20),
  related_object_id UUID,
  description TEXT,
  action_taken TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 质量追溯表（quality_traces）
```sql
CREATE TABLE quality_traces (
  id UUID PRIMARY KEY,
  batch_id UUID,
  device_id UUID,
  process_id UUID,
  inspection_id UUID,
  result VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 环境监测（环）相关表

### 环境监测数据表（environment_data）
```sql
CREATE TABLE environment_data (
  id UUID PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id),
  type VARCHAR(50), -- 温度/湿度/能耗/气体等
  value DECIMAL(18,4),
  unit VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 安环报警表（env_alarm_records）
```sql
CREATE TABLE env_alarm_records (
  id UUID PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id),
  type VARCHAR(50),
  level VARCHAR(20),
  description TEXT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
```

---

## 多语言支持设计
- 关键表（如设备、工艺、物料、报表等）可增加多语言字段（如 name_en, name_zh, description_en, description_zh），或设计多语言表（如 translations），支持国际化。

---

## 数据追溯链路设计
- 生产批次、工单、物料、设备、人员等多维追溯链路建议通过 quality_traces、material_batches、production_orders、user_enterprises 等表关联实现。

---

## 数据归档与清理策略
- 对于历史数据（如 device_status_history, environment_data, quality_inspections 等），建议采用分区表、定期归档、冷热分层存储等策略，提升性能与可维护性。

---

## 典型业务视图与API接口建议
- 工厂总览视图：聚合企业、工厂、车间、设备、状态、报警、环境等多维数据。
- 生产追溯视图：按批次/工单/物料/设备/人员多维追溯。
- 质量分析视图：聚合质量检测、异常、返工、追溯等数据。
- 物料流转视图：物料批次、库存、出入库、追溯全链路。
- 环境监控视图：车间环境、能耗、安环报警等实时与历史数据。

API接口建议：
- /api/materials, /api/inventory, /api/processes, /api/quality, /api/environment 等RESTful接口，支持多维度查询与聚合。

---

<!-- 以上为补充内容，后续可在各表结构和业务场景下细化具体字段和约束 -->

---

## 概述

SmartFactory Studio采用完整的PostgreSQL数据库架构，通过Supabase提供云托管服务。数据库设计涵盖了智能制造系统的所有核心功能模块，支持多租户、实时数据、3D可视化等高级特性。

## 架构特点

### 🏗️ 模块化设计
- **企业级多租户架构**：支持多企业、多工厂、多车间管理
- **完整的权限体系**：基于角色的访问控制(RBAC)
- **实时数据处理**：支持毫秒级数据采集和推送
- **3D可视化支持**：完整的3D模型和场景管理

### 🔒 安全特性
- **行级安全策略(RLS)**：数据级别的访问控制
- **用户认证集成**：与Supabase Auth无缝集成
- **操作审计**：完整的操作日志记录
- **数据加密**：敏感数据自动加密存储

### 📈 性能优化
- **智能索引设计**：针对查询模式优化的复合索引
- **数据分区**：支持时序数据分区存储
- **连接池管理**：高效的数据库连接管理
- **查询优化**：优化的SQL查询和存储过程

## 核心模块

### 1. 用户认证和权限管理

#### 企业表 (enterprises)
```sql
- 企业基本信息管理
- 支持多行业类型
- 企业状态管理
- 联系信息和网站
```

#### 部门表 (departments)
```sql
- 企业组织架构管理
- 支持多级部门结构
- 部门经理关联
- 部门设置配置
```

#### 角色表 (roles)
```sql
- 基于角色的权限控制
- 支持系统角色和自定义角色
- JSON格式权限配置
- 企业级角色隔离
```

#### 用户企业关联表 (user_enterprises)
```sql
- 用户与企业关联
- 支持多企业用户
- 员工信息管理
- 用户状态控制
```

#### 用户权限表 (user_permissions)
```sql
- 细粒度权限控制
- 资源级别权限管理
- 权限过期机制
- 权限授予记录
```

### 2. 工厂和车间管理

#### 工厂表 (factories)
```sql
- 工厂基本信息
- 地理位置坐标
- 建筑信息管理
- 工厂状态控制
```

#### 车间表 (workshops)
```sql
- 车间详细信息
- 物理尺寸和容量
- 环境参数管理
- 车间状态监控
```

### 3. 设备管理

#### 设备类型表 (device_types)
```sql
- 设备类型标准化
- 默认参数配置
- 设备模板管理
- 图标和模型关联
```

#### 设备表 (devices)
```sql
- 设备详细信息
- 3D位置和旋转
- 技术规格管理
- 维护信息记录
```

#### 设备轴表 (device_axes)
```sql
- 设备轴控制
- 运动参数管理
- 实时状态监控
- 错误处理机制
```

### 4. 3D建模和可视化

#### 3D模型表 (models_3d)
```sql
- 3D模型文件管理
- 模型元数据
- 版本控制
- 缩略图管理
```

#### 3D场景表 (scenes_3d)
```sql
- 3D场景配置
- 相机和光照设置
- 场景数据管理
- 车间场景关联
```

#### 3D对象实例表 (objects_3d)
```sql
- 3D对象实例化
- 位置和变换管理
- 设备关联
- 属性配置
```

### 5. 实时数据和历史记录

#### 实时数据表 (realtime_data)
```sql
- 毫秒级数据采集
- 数据质量评估
- 多类型数据支持
- 时序数据优化
```

#### 设备状态历史表 (device_status_history)
```sql
- 状态变更记录
- 变更原因追踪
- 操作人员记录
- 历史查询支持
```

#### 设备轴历史表 (device_axis_history)
```sql
- 轴运动历史
- 位置和速度记录
- 状态变更追踪
- 性能分析支持
```

### 6. 生产管理

#### 生产订单表 (production_orders)
```sql
- 生产订单管理
- 客户信息关联
- 进度跟踪
- 优先级管理
```

#### 生产任务表 (production_tasks)
```sql
- 任务分解管理
- 设备分配
- 时间估算
- 完成状态跟踪
```

### 7. 维护管理

#### 维护计划表 (maintenance_plans)
```sql
- 预防性维护计划
- 维护周期配置
- 检查清单管理
- 人员分配
```

#### 维护记录表 (maintenance_records)
```sql
- 维护执行记录
- 维护结果记录
- 成本统计
- 维护历史
```

### 8. 报警和通知

#### 报警规则表 (alarm_rules)
```sql
- 报警条件配置
- 多类型报警支持
- 通知渠道配置
- 报警级别管理
```

#### 报警记录表 (alarm_records)
```sql
- 报警事件记录
- 确认和解决流程
- 报警历史查询
- 统计分析支持
```

### 9. 日志和审计

#### 系统日志表 (system_logs)
```sql
- 系统操作日志
- 用户行为追踪
- IP地址记录
- 审计支持
```

#### 操作日志表 (operation_logs)
```sql
- 设备操作记录
- 操作结果追踪
- 错误信息记录
- 操作历史查询
```

### 10. 报表和分析

#### 报表模板表 (report_templates)
```sql
- 报表模板管理
- 模板配置数据
- 系统模板支持
- 自定义模板
```

#### 报表记录表 (report_records)
```sql
- 报表生成记录
- 报表数据存储
- 文件管理
- 生成历史
```

## 数据关系图

```
enterprises (企业)
├── factories (工厂)
│   └── workshops (车间)
│       └── devices (设备)
│           └── device_axes (设备轴)
├── departments (部门)
├── roles (角色)
└── user_enterprises (用户企业关联)

devices (设备)
├── device_types (设备类型)
├── models_3d (3D模型)
├── scenes_3d (3D场景)
│   └── objects_3d (3D对象)
├── realtime_data (实时数据)
├── device_status_history (状态历史)
├── device_axis_history (轴历史)
├── production_tasks (生产任务)
├── maintenance_plans (维护计划)
└── maintenance_records (维护记录)

production_orders (生产订单)
└── production_tasks (生产任务)

alarm_rules (报警规则)
└── alarm_records (报警记录)

report_templates (报表模板)
└── report_records (报表记录)

system_logs (系统日志)
operation_logs (操作日志)
```

## 索引策略

### 性能优化索引
```sql
-- 企业相关索引
CREATE INDEX idx_departments_enterprise ON departments(enterprise_id);
CREATE INDEX idx_roles_enterprise ON roles(enterprise_id);
CREATE INDEX idx_user_enterprises_user ON user_enterprises(user_id);
CREATE INDEX idx_user_enterprises_enterprise ON user_enterprises(enterprise_id);

-- 工厂和车间索引
CREATE INDEX idx_factories_enterprise ON factories(enterprise_id);
CREATE INDEX idx_workshops_factory ON workshops(factory_id);

-- 设备相关索引
CREATE INDEX idx_devices_workshop ON devices(workshop_id);
CREATE INDEX idx_devices_type ON devices(device_type_id);
CREATE INDEX idx_device_axes_device ON device_axes(device_id);

-- 实时数据索引
CREATE INDEX idx_realtime_data_device_timestamp ON realtime_data(device_id, timestamp DESC);
CREATE INDEX idx_device_status_history_device_timestamp ON device_status_history(device_id, timestamp DESC);
CREATE INDEX idx_device_axis_history_axis_timestamp ON device_axis_history(axis_id, timestamp DESC);

-- 生产相关索引
CREATE INDEX idx_production_orders_enterprise ON production_orders(enterprise_id);
CREATE INDEX idx_production_tasks_order ON production_tasks(order_id);
CREATE INDEX idx_production_tasks_device ON production_tasks(device_id);

-- 维护相关索引
CREATE INDEX idx_maintenance_plans_device ON maintenance_plans(device_id);
CREATE INDEX idx_maintenance_records_device ON maintenance_records(device_id);

-- 报警相关索引
CREATE INDEX idx_alarm_rules_enterprise ON alarm_rules(enterprise_id);
CREATE INDEX idx_alarm_rules_device ON alarm_rules(device_id);
CREATE INDEX idx_alarm_records_timestamp ON alarm_records(triggered_at DESC);

-- 日志相关索引
CREATE INDEX idx_system_logs_enterprise ON system_logs(enterprise_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_operation_logs_device ON operation_logs(device_id);
CREATE INDEX idx_operation_logs_timestamp ON operation_logs(timestamp DESC);
```

## 安全策略

### 行级安全策略(RLS)
```sql
-- 启用所有表的RLS
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
-- ... 其他表

-- 基础安全策略（开发环境）
CREATE POLICY "Allow all operations" ON enterprises FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON devices FOR ALL USING (true);
-- ... 其他表
```

### 生产环境安全策略示例
```sql
-- 企业数据访问策略
CREATE POLICY "Enterprise data access" ON enterprises
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM user_enterprises 
    WHERE enterprise_id = enterprises.id
  )
);

-- 设备数据访问策略
CREATE POLICY "Device data access" ON devices
FOR ALL USING (
  workshop_id IN (
    SELECT w.id FROM workshops w
    JOIN factories f ON w.factory_id = f.id
    JOIN user_enterprises ue ON f.enterprise_id = ue.enterprise_id
    WHERE ue.user_id = auth.uid()
  )
);
```

## 数据迁移和备份

### 数据迁移策略
```sql
-- 创建数据迁移函数
CREATE OR REPLACE FUNCTION migrate_legacy_data()
RETURNS void AS $$
BEGIN
  -- 迁移企业数据
  INSERT INTO enterprises (name, description)
  SELECT name, description FROM legacy_enterprises;
  
  -- 迁移设备数据
  INSERT INTO devices (workshop_id, name, model, type)
  SELECT w.id, d.name, d.model, d.type
  FROM legacy_devices d
  JOIN workshops w ON d.workshop_id = w.legacy_id;
  
  -- 其他迁移逻辑...
END;
$$ LANGUAGE plpgsql;
```

### 备份策略
```sql
-- 创建备份函数
CREATE OR REPLACE FUNCTION create_backup()
RETURNS void AS $$
BEGIN
  -- 创建数据快照
  CREATE TABLE backup_enterprises AS SELECT * FROM enterprises;
  CREATE TABLE backup_devices AS SELECT * FROM devices;
  -- 其他表备份...
  
  -- 记录备份信息
  INSERT INTO backup_logs (backup_time, tables_count, status)
  VALUES (NOW(), 15, 'completed');
END;
$$ LANGUAGE plpgsql;
```

## 性能监控

### 查询性能监控
```sql
-- 慢查询监控
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000  -- 超过1秒的查询
ORDER BY mean_time DESC;
```

### 表性能统计
```sql
-- 表访问统计
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
```

## 扩展性设计

### 水平扩展
- **数据分区**：支持按时间分区存储历史数据
- **读写分离**：支持主从数据库架构
- **分片策略**：支持按企业分片存储

### 垂直扩展
- **索引优化**：动态索引策略
- **查询优化**：存储过程和函数优化
- **缓存策略**：Redis缓存集成

## 最佳实践

### 1. 数据建模
- 使用UUID作为主键，支持分布式部署
- 合理使用JSONB字段存储灵活数据
- 建立完整的外键约束关系

### 2. 性能优化
- 为常用查询创建复合索引
- 使用分区表存储大量历史数据
- 定期更新表统计信息

### 3. 安全防护
- 启用所有表的行级安全策略
- 定期审查用户权限
- 记录所有敏感操作日志

### 4. 监控维护
- 定期备份数据库
- 监控查询性能
- 及时清理过期数据

## 总结

SmartFactory Studio的数据库架构设计充分考虑了智能制造系统的复杂性，提供了：

1. **完整的功能覆盖**：涵盖企业、设备、生产、维护等所有核心功能
2. **高性能设计**：优化的索引策略和查询设计
3. **安全可靠**：多层次的安全防护机制
4. **易于扩展**：模块化设计支持功能扩展
5. **运维友好**：完善的监控和维护工具

这个架构为SmartFactory Studio提供了坚实的数据基础，支持从原型到生产环境的平滑扩展。