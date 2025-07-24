-- SmartFactory Studio 完整数据库架构
-- 包含用户认证、权限管理、日志记录、3D建模等所有功能模块
-- 请在Supabase SQL编辑器中执行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. 用户认证和权限管理
-- ========================================

-- 企业表
CREATE TABLE enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  industry_type VARCHAR(50), -- manufacturing, automotive, electronics, etc.
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  settings JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 部门表
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID, -- 部门经理用户ID
  parent_department_id UUID REFERENCES departments(id), -- 上级部门
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]', -- 权限列表
  is_system_role BOOLEAN DEFAULT false, -- 是否为系统角色
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id, name)
);

-- 用户企业关联表
CREATE TABLE user_enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  role_id UUID REFERENCES roles(id),
  employee_id VARCHAR(50), -- 员工编号
  position VARCHAR(100), -- 职位
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, enterprise_id)
);

-- 用户权限表
CREATE TABLE user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL, -- workshop, device, report, etc.
  resource_id UUID, -- 具体资源ID
  permission VARCHAR(50) NOT NULL, -- read, write, delete, admin
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, enterprise_id, resource_type, resource_id, permission)
);

-- ========================================
-- 2. 工厂和车间管理
-- ========================================

-- 工厂表
CREATE TABLE factories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT,
  location_lat DECIMAL(10, 8), -- 纬度
  location_lng DECIMAL(11, 8), -- 经度
  floor_count INTEGER DEFAULT 1,
  total_area DECIMAL(10, 2), -- 总面积(平方米)
  settings JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 车间表
CREATE TABLE workshops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  floor_number INTEGER DEFAULT 1,
  floor_plan_url TEXT,
  width DECIMAL(10, 2), -- 车间宽度(米)
  height DECIMAL(10, 2), -- 车间高度(米)
  area DECIMAL(10, 2), -- 车间面积(平方米)
  capacity INTEGER, -- 设备容量
  temperature_range VARCHAR(50), -- 温度范围
  humidity_range VARCHAR(50), -- 湿度范围
  settings JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. 设备管理
-- ========================================

-- 设备类型表
CREATE TABLE device_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL, -- CNC, Robot, Conveyor, Inspection, etc.
  description TEXT,
  default_parameters JSONB DEFAULT '{}',
  default_status JSONB DEFAULT '{}',
  icon_url TEXT,
  model_template JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设备表
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  device_type_id UUID REFERENCES device_types(id),
  name VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  serial_number VARCHAR(100),
  manufacturer VARCHAR(100),
  installation_date DATE,
  warranty_expiry DATE,
  axes_count INTEGER DEFAULT 0,
  position_x DECIMAL(10, 2), -- X坐标(米)
  position_y DECIMAL(10, 2), -- Y坐标(米)
  position_z DECIMAL(10, 2), -- Z坐标(米)
  rotation_x DECIMAL(5, 2), -- X轴旋转角度
  rotation_y DECIMAL(5, 2), -- Y轴旋转角度
  rotation_z DECIMAL(5, 2), -- Z轴旋转角度
  image_url TEXT,
  model_3d_url TEXT, -- 3D模型文件URL
  status JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}', -- 技术规格
  maintenance_info JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设备轴表
CREATE TABLE device_axes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  axis_name VARCHAR(10) NOT NULL, -- X, Y, Z, A, B, C, etc.
  axis_type VARCHAR(20) NOT NULL, -- linear, rotary
  min_position DECIMAL(10, 3),
  max_position DECIMAL(10, 3),
  current_position DECIMAL(10, 3) DEFAULT 0,
  target_position DECIMAL(10, 3) DEFAULT 0,
  speed DECIMAL(10, 3) DEFAULT 0,
  max_speed DECIMAL(10, 3),
  acceleration DECIMAL(10, 3),
  deceleration DECIMAL(10, 3),
  status VARCHAR(20) DEFAULT 'idle', -- idle, moving, error, homing
  error_code VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, axis_name)
);

-- ========================================
-- 4. 3D建模和可视化
-- ========================================

-- 3D模型表
CREATE TABLE models_3d (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- device, building, furniture, etc.
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(20), -- gltf, obj, fbx, etc.
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  version VARCHAR(20) DEFAULT '1.0',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3D场景表
CREATE TABLE scenes_3d (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  scene_data JSONB DEFAULT '{}', -- 场景配置数据
  camera_settings JSONB DEFAULT '{}',
  lighting_settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3D对象实例表
CREATE TABLE objects_3d (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID REFERENCES scenes_3d(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models_3d(id),
  device_id UUID REFERENCES devices(id),
  name VARCHAR(100) NOT NULL,
  position_x DECIMAL(10, 3) DEFAULT 0,
  position_y DECIMAL(10, 3) DEFAULT 0,
  position_z DECIMAL(10, 3) DEFAULT 0,
  rotation_x DECIMAL(5, 2) DEFAULT 0,
  rotation_y DECIMAL(5, 2) DEFAULT 0,
  rotation_z DECIMAL(5, 2) DEFAULT 0,
  scale_x DECIMAL(5, 2) DEFAULT 1,
  scale_y DECIMAL(5, 2) DEFAULT 1,
  scale_z DECIMAL(5, 2) DEFAULT 1,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. 实时数据和历史记录
-- ========================================

-- 实时数据表
CREATE TABLE realtime_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL, -- temperature, vibration, position, etc.
  value JSONB NOT NULL,
  quality INTEGER DEFAULT 100, -- 数据质量(0-100)
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设备状态历史表
CREATE TABLE device_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  status JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设备轴历史表
CREATE TABLE device_axis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  axis_id UUID REFERENCES device_axes(id) ON DELETE CASCADE,
  position DECIMAL(10, 3),
  speed DECIMAL(10, 3),
  status VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. 生产管理
-- ========================================

-- 生产订单表
CREATE TABLE production_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100),
  product_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  completed_quantity INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  specifications JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id, order_number)
);

-- 生产任务表
CREATE TABLE production_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id),
  task_name VARCHAR(100) NOT NULL,
  task_type VARCHAR(50), -- machining, assembly, inspection, etc.
  quantity INTEGER NOT NULL,
  completed_quantity INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- 预计时长(分钟)
  actual_duration INTEGER, -- 实际时长(分钟)
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. 维护管理
-- ========================================

-- 维护计划表
CREATE TABLE maintenance_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  maintenance_type VARCHAR(50), -- preventive, corrective, emergency
  frequency_type VARCHAR(20), -- daily, weekly, monthly, yearly, hours
  frequency_value INTEGER,
  description TEXT,
  checklist JSONB DEFAULT '[]',
  estimated_duration INTEGER, -- 预计时长(分钟)
  assigned_to UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 维护记录表
CREATE TABLE maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES maintenance_plans(id),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50), -- preventive, corrective, emergency
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- 实际时长(分钟)
  performed_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  findings TEXT,
  actions_taken TEXT,
  parts_used JSONB DEFAULT '[]',
  cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. 报警和通知
-- ========================================

-- 报警规则表
CREATE TABLE alarm_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  device_id UUID REFERENCES devices(id),
  condition_type VARCHAR(50), -- threshold, trend, status_change
  condition_parameters JSONB DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  notification_channels JSONB DEFAULT '[]', -- email, sms, webhook, etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报警记录表
CREATE TABLE alarm_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES alarm_rules(id),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  alarm_type VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(100) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'active' -- active, acknowledged, resolved
);

-- ========================================
-- 9. 日志和审计
-- ========================================

-- 系统日志表
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- user, device, workshop, etc.
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 操作日志表
CREATE TABLE operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  operation_type VARCHAR(50), -- start, stop, reset, configure, etc.
  operation_data JSONB DEFAULT '{}',
  result VARCHAR(20), -- success, failed, partial
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 10. 报表和分析
-- ========================================

-- 报表模板表
CREATE TABLE report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  report_type VARCHAR(50), -- production, maintenance, quality, etc.
  template_data JSONB DEFAULT '{}',
  is_system_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报表记录表
CREATE TABLE report_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id),
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  report_name VARCHAR(100) NOT NULL,
  report_data JSONB DEFAULT '{}',
  file_url TEXT,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 创建索引
-- ========================================

-- 企业相关索引
CREATE INDEX idx_departments_enterprise ON departments(enterprise_id);
CREATE INDEX idx_roles_enterprise ON roles(enterprise_id);
CREATE INDEX idx_user_enterprises_user ON user_enterprises(user_id);
CREATE INDEX idx_user_enterprises_enterprise ON user_enterprises(enterprise_id);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_enterprise ON user_permissions(enterprise_id);

-- 工厂和车间索引
CREATE INDEX idx_factories_enterprise ON factories(enterprise_id);
CREATE INDEX idx_workshops_factory ON workshops(factory_id);

-- 设备相关索引
CREATE INDEX idx_devices_workshop ON devices(workshop_id);
CREATE INDEX idx_devices_type ON devices(device_type_id);
CREATE INDEX idx_device_axes_device ON device_axes(device_id);

-- 3D相关索引
CREATE INDEX idx_objects_3d_scene ON objects_3d(scene_id);
CREATE INDEX idx_objects_3d_device ON objects_3d(device_id);

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
CREATE INDEX idx_maintenance_records_plan ON maintenance_records(plan_id);

-- 报警相关索引
CREATE INDEX idx_alarm_rules_enterprise ON alarm_rules(enterprise_id);
CREATE INDEX idx_alarm_rules_device ON alarm_rules(device_id);
CREATE INDEX idx_alarm_records_device ON alarm_records(device_id);
CREATE INDEX idx_alarm_records_timestamp ON alarm_records(triggered_at DESC);

-- 日志相关索引
CREATE INDEX idx_system_logs_enterprise ON system_logs(enterprise_id);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_operation_logs_device ON operation_logs(device_id);
CREATE INDEX idx_operation_logs_timestamp ON operation_logs(timestamp DESC);

-- ========================================
-- 启用行级安全策略
-- ========================================

-- 启用所有表的RLS
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE objects_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_axis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarm_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_records ENABLE ROW LEVEL SECURITY;

-- 创建基础安全策略（允许所有操作，生产环境需要更严格的策略）
CREATE POLICY "Allow all operations on enterprises" ON enterprises FOR ALL USING (true);
CREATE POLICY "Allow all operations on departments" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all operations on roles" ON roles FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_enterprises" ON user_enterprises FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_permissions" ON user_permissions FOR ALL USING (true);
CREATE POLICY "Allow all operations on factories" ON factories FOR ALL USING (true);
CREATE POLICY "Allow all operations on workshops" ON workshops FOR ALL USING (true);
CREATE POLICY "Allow all operations on device_types" ON device_types FOR ALL USING (true);
CREATE POLICY "Allow all operations on devices" ON devices FOR ALL USING (true);
CREATE POLICY "Allow all operations on device_axes" ON device_axes FOR ALL USING (true);
CREATE POLICY "Allow all operations on models_3d" ON models_3d FOR ALL USING (true);
CREATE POLICY "Allow all operations on scenes_3d" ON scenes_3d FOR ALL USING (true);
CREATE POLICY "Allow all operations on objects_3d" ON objects_3d FOR ALL USING (true);
CREATE POLICY "Allow all operations on realtime_data" ON realtime_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on device_status_history" ON device_status_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on device_axis_history" ON device_axis_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on production_orders" ON production_orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on production_tasks" ON production_tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on maintenance_plans" ON maintenance_plans FOR ALL USING (true);
CREATE POLICY "Allow all operations on maintenance_records" ON maintenance_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on alarm_rules" ON alarm_rules FOR ALL USING (true);
CREATE POLICY "Allow all operations on alarm_records" ON alarm_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_logs" ON system_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on operation_logs" ON operation_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on report_templates" ON report_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations on report_records" ON report_records FOR ALL USING (true);

-- ========================================
-- 插入测试数据
-- ========================================

-- 插入测试企业
INSERT INTO enterprises (name, description, industry_type, contact_email, website) 
VALUES 
('GoldSky Technologies', '智能制造解决方案提供商', 'manufacturing', 'contact@goldsky.com', 'https://goldsky.com'),
('Advanced Manufacturing Corp', '先进制造企业', 'automotive', 'info@amc.com', 'https://amc.com');

-- 插入设备类型
INSERT INTO device_types (name, category, description, default_parameters, default_status, icon_url) 
VALUES 
('CNC加工中心', 'CNC', '多轴数控加工中心', '{"axes": ["X", "Y", "Z", "A", "C"], "max_speed": 1000}', '{"online": false, "running": false, "alarm": false}', '/icons/cnc.png'),
('工业机器人', 'Robot', '6轴工业机器人', '{"axes": ["J1", "J2", "J3", "J4", "J5", "J6"], "max_speed": 500}', '{"online": false, "running": false, "alarm": false}', '/icons/robot.png'),
('传送带系统', 'Conveyor', '自动化传送带', '{"axes": ["BELT1", "BELT2"], "max_speed": 2}', '{"online": false, "running": false, "alarm": false}', '/icons/conveyor.png'),
('检测设备', 'Inspection', '质量检测设备', '{"axes": ["X", "Y", "Z"], "max_speed": 100}', '{"online": false, "running": false, "alarm": false}', '/icons/inspection.png');

-- 插入角色
INSERT INTO roles (enterprise_id, name, description, permissions, is_system_role) 
SELECT 
  e.id,
  '系统管理员',
  '拥有所有权限的系统管理员',
  '["*"]',
  true
FROM enterprises e WHERE e.name = 'GoldSky Technologies';

INSERT INTO roles (enterprise_id, name, description, permissions, is_system_role) 
SELECT 
  e.id,
  '车间经理',
  '负责车间管理和设备监控',
  '["workshop:read", "workshop:write", "device:read", "device:write", "report:read"]',
  false
FROM enterprises e WHERE e.name = 'GoldSky Technologies';

INSERT INTO roles (enterprise_id, name, description, permissions, is_system_role) 
SELECT 
  e.id,
  '操作员',
  '设备操作和维护',
  '["device:read", "device:operate", "maintenance:read"]',
  false
FROM enterprises e WHERE e.name = 'GoldSky Technologies';

-- 插入工厂
INSERT INTO factories (enterprise_id, name, description, address, floor_count, total_area) 
SELECT 
  e.id,
  'GoldSky智能制造工厂',
  '主要生产精密机械零件',
  '上海市浦东新区张江高科技园区',
  3,
  50000
FROM enterprises e WHERE e.name = 'GoldSky Technologies';

-- 插入车间
INSERT INTO workshops (factory_id, name, description, floor_number, width, height, area, capacity, temperature_range, humidity_range) 
SELECT 
  f.id,
  'CNC加工车间',
  '精密零件加工车间',
  1,
  100,
  80,
  8000,
  20,
  '20-25°C',
  '40-60%'
FROM factories f 
JOIN enterprises e ON f.enterprise_id = e.id 
WHERE e.name = 'GoldSky Technologies';

INSERT INTO workshops (factory_id, name, description, floor_number, width, height, area, capacity, temperature_range, humidity_range) 
SELECT 
  f.id,
  '装配车间',
  '产品装配和测试车间',
  2,
  120,
  90,
  10800,
  15,
  '18-22°C',
  '45-65%'
FROM factories f 
JOIN enterprises e ON f.enterprise_id = e.id 
WHERE e.name = 'GoldSky Technologies';

-- 插入设备
INSERT INTO devices (workshop_id, device_type_id, name, model, serial_number, manufacturer, axes_count, position_x, position_y, position_z, rotation_z, status, parameters, specifications) 
SELECT 
  w.id,
  dt.id,
  '精密加工中心-01',
  'DMG MORI NHX5000',
  'CNC-001-2024',
  'DMG MORI',
  5,
  10,
  15,
  0,
  0,
  '{"online": true, "running": true, "alarm": false, "efficiency": 85, "temperature": 45, "vibration": 0.02}',
  '{"axes": [{"id": "X", "position": 0, "target": 0, "speed": 0}, {"id": "Y", "position": 0, "target": 0, "speed": 0}, {"id": "Z", "position": 0, "target": 0, "speed": 0}, {"id": "A", "position": 0, "target": 0, "speed": 0}, {"id": "C", "position": 0, "target": 0, "speed": 0}], "production": {"currentJob": "JOB-001", "progress": 75, "totalParts": 100, "completedParts": 75}, "maintenance": {"lastMaintenance": "2024-01-15", "nextMaintenance": "2024-02-15", "maintenanceHours": 120}}',
  '{"workArea": {"X": 500, "Y": 500, "Z": 400}, "spindleSpeed": {"min": 50, "max": 12000}, "power": "15kW"}'
FROM workshops w 
JOIN device_types dt ON dt.name = 'CNC加工中心'
WHERE w.name = 'CNC加工车间';

INSERT INTO devices (workshop_id, device_type_id, name, model, serial_number, manufacturer, axes_count, position_x, position_y, position_z, rotation_z, status, parameters, specifications) 
SELECT 
  w.id,
  dt.id,
  '工业机器人-01',
  'ABB IRB 2600',
  'ROBOT-001-2024',
  'ABB',
  6,
  30,
  20,
  0,
  45,
  '{"online": true, "running": false, "alarm": false, "efficiency": 92, "temperature": 38, "vibration": 0.01}',
  '{"axes": [{"id": "J1", "position": 0, "target": 0, "speed": 0}, {"id": "J2", "position": 0, "target": 0, "speed": 0}, {"id": "J3", "position": 0, "target": 0, "speed": 0}, {"id": "J4", "position": 0, "target": 0, "speed": 0}, {"id": "J5", "position": 0, "target": 0, "speed": 0}, {"id": "J6", "position": 0, "target": 0, "speed": 0}], "production": {"currentTask": "PICK_PLACE", "progress": 0, "totalCycles": 50, "completedCycles": 0}, "maintenance": {"lastMaintenance": "2024-01-10", "nextMaintenance": "2024-02-10", "maintenanceHours": 80}}',
  '{"reach": 1650, "payload": 20, "repeatability": 0.05}'
FROM workshops w 
JOIN device_types dt ON dt.name = '工业机器人'
WHERE w.name = 'CNC加工车间';

INSERT INTO devices (workshop_id, device_type_id, name, model, serial_number, manufacturer, axes_count, position_x, position_y, position_z, rotation_z, status, parameters, specifications) 
SELECT 
  w.id,
  dt.id,
  '传送带系统-01',
  'Siemens SIMATIC',
  'CONV-001-2024',
  'Siemens',
  2,
  50,
  30,
  0,
  0,
  '{"online": true, "running": true, "alarm": false, "efficiency": 78, "temperature": 42, "vibration": 0.03}',
  '{"axes": [{"id": "BELT1", "position": 0, "target": 0, "speed": 0.5}, {"id": "BELT2", "position": 0, "target": 0, "speed": 0.5}], "production": {"currentBatch": "BATCH-003", "progress": 30, "totalItems": 200, "processedItems": 60}, "maintenance": {"lastMaintenance": "2024-01-20", "nextMaintenance": "2024-02-20", "maintenanceHours": 150}}',
  '{"length": 20, "width": 0.8, "maxSpeed": 2.0}'
FROM workshops w 
JOIN device_types dt ON dt.name = '传送带系统'
WHERE w.name = 'CNC加工车间';

-- 插入设备轴数据
INSERT INTO device_axes (device_id, axis_name, axis_type, min_position, max_position, current_position, target_position, speed, max_speed, acceleration, deceleration, status)
SELECT 
  d.id,
  'X',
  'linear',
  -500,
  500,
  0,
  0,
  0,
  1000,
  1000,
  1000,
  'idle'
FROM devices d WHERE d.name = '精密加工中心-01';

INSERT INTO device_axes (device_id, axis_name, axis_type, min_position, max_position, current_position, target_position, speed, max_speed, acceleration, deceleration, status)
SELECT 
  d.id,
  'Y',
  'linear',
  -500,
  500,
  0,
  0,
  0,
  1000,
  1000,
  1000,
  'idle'
FROM devices d WHERE d.name = '精密加工中心-01';

INSERT INTO device_axes (device_id, axis_name, axis_type, min_position, max_position, current_position, target_position, speed, max_speed, acceleration, deceleration, status)
SELECT 
  d.id,
  'Z',
  'linear',
  -400,
  400,
  0,
  0,
  0,
  800,
  800,
  800,
  'idle'
FROM devices d WHERE d.name = '精密加工中心-01';

-- 插入3D模型
INSERT INTO models_3d (name, description, category, file_url, file_type, thumbnail_url, metadata)
VALUES 
('CNC加工中心模型', 'DMG MORI NHX5000 3D模型', 'device', '/models/cnc-nhx5000.gltf', 'gltf', '/thumbnails/cnc-nhx5000.jpg', '{"version": "1.0", "author": "GoldSky", "scale": 1.0}'),
('工业机器人模型', 'ABB IRB 2600 3D模型', 'device', '/models/robot-irb2600.gltf', 'gltf', '/thumbnails/robot-irb2600.jpg', '{"version": "1.0", "author": "GoldSky", "scale": 1.0}'),
('传送带模型', 'Siemens传送带3D模型', 'device', '/models/conveyor-siemens.gltf', 'gltf', '/thumbnails/conveyor-siemens.jpg', '{"version": "1.0", "author": "GoldSky", "scale": 1.0}');

-- 插入3D场景
INSERT INTO scenes_3d (name, description, workshop_id, scene_data, camera_settings, lighting_settings)
SELECT 
  'CNC车间3D场景',
  'CNC加工车间的3D可视化场景',
  w.id,
  '{"environment": "factory", "background": "#f0f0f0"}',
  '{"position": {"x": 50, "y": 50, "z": 30}, "target": {"x": 0, "y": 0, "z": 0}, "fov": 60}',
  '{"ambient": {"intensity": 0.4}, "directional": {"intensity": 0.8, "position": {"x": 10, "y": 10, "z": 10}}}'
FROM workshops w WHERE w.name = 'CNC加工车间';

-- 插入生产订单
INSERT INTO production_orders (enterprise_id, order_number, customer_name, product_name, quantity, completed_quantity, start_date, due_date, priority, status)
SELECT 
  e.id,
  'PO-2024-001',
  'ABC制造公司',
  '精密轴承',
  1000,
  750,
  '2024-01-15',
  '2024-02-15',
  'high',
  'in_progress'
FROM enterprises e WHERE e.name = 'GoldSky Technologies';

-- 插入维护计划
INSERT INTO maintenance_plans (device_id, plan_name, maintenance_type, frequency_type, frequency_value, description, checklist, estimated_duration, status)
SELECT 
  d.id,
  'CNC定期维护',
  'preventive',
  'weekly',
  1,
  'CNC加工中心每周预防性维护',
  '["检查润滑油", "清洁工作台", "检查刀具", "校准精度"]',
  120,
  'active'
FROM devices d WHERE d.name = '精密加工中心-01';

-- 插入报警规则
INSERT INTO alarm_rules (enterprise_id, name, description, device_id, condition_type, condition_parameters, severity, notification_channels, is_active)
SELECT 
  e.id,
  '温度过高报警',
  '设备温度超过阈值时触发报警',
  d.id,
  'threshold',
  '{"parameter": "temperature", "operator": ">", "value": 60}',
  'high',
  '["email", "webhook"]',
  true
FROM enterprises e 
JOIN devices d ON d.workshop_id IN (SELECT w.id FROM workshops w WHERE w.factory_id IN (SELECT f.id FROM factories f WHERE f.enterprise_id = e.id))
WHERE e.name = 'GoldSky Technologies' AND d.name = '精密加工中心-01';

-- 插入报表模板
INSERT INTO report_templates (enterprise_id, name, description, report_type, template_data, is_system_template)
SELECT 
  e.id,
  '设备运行状态日报',
  '每日设备运行状态汇总报表',
  'production',
  '{"sections": ["设备状态概览", "生产效率", "报警统计", "维护提醒"], "charts": ["设备运行时间", "生产效率趋势", "报警分布"]}',
  true
FROM enterprises e WHERE e.name = 'GoldSky Technologies';

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_enterprises_updated_at BEFORE UPDATE ON enterprises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_enterprises_updated_at BEFORE UPDATE ON user_enterprises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_axes_updated_at BEFORE UPDATE ON device_axes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_3d_updated_at BEFORE UPDATE ON models_3d FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenes_3d_updated_at BEFORE UPDATE ON scenes_3d FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_objects_3d_updated_at BEFORE UPDATE ON objects_3d FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_tasks_updated_at BEFORE UPDATE ON production_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_plans_updated_at BEFORE UPDATE ON maintenance_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alarm_rules_updated_at BEFORE UPDATE ON alarm_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成提示
SELECT 'SmartFactory Studio 数据库架构创建完成！' as message;

-- ========== 新增：人员管理相关表 ==========
CREATE TABLE employee_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  employee_no VARCHAR(50),
  name VARCHAR(100),
  gender VARCHAR(10),
  phone VARCHAR(50),
  email VARCHAR(100),
  position VARCHAR(100),
  skill_tags TEXT[],
  certifications TEXT[],
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employee_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  position_id UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 新增：工地/现场管理相关表 ==========
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50), -- 工厂/工地/项目/仓库等
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 新增：人物安排/排班/工单分派相关表 ==========
CREATE TABLE shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(50),
  start_time TIME,
  end_time TIME,
  description TEXT
);

CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employee_profiles(id),
  shift_id UUID REFERENCES shifts(id),
  site_id UUID REFERENCES sites(id),
  date DATE,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, absent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id),
  name VARCHAR(100),
  description TEXT,
  required_skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE task_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  employee_id UUID REFERENCES employee_profiles(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'assigned' -- assigned, in_progress, completed
);

-- ========== 新增：物料管理（料）相关表 ==========
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50), -- 原材料/半成品/成品
  spec VARCHAR(100),
  unit VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  quantity DECIMAL(18,4) NOT NULL,
  location VARCHAR(100),
  batch_no VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE material_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  batch_no VARCHAR(50) NOT NULL,
  production_date DATE,
  expiry_date DATE,
  supplier VARCHAR(100),
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE material_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  batch_id UUID REFERENCES material_batches(id),
  type VARCHAR(20), -- 入库/出库/退库
  quantity DECIMAL(18,4),
  operator_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 新增：工艺管理（法）相关表 ==========
CREATE TABLE process_parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(100),
  unit VARCHAR(20),
  device_id UUID REFERENCES devices(id),
  process_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE process_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sequence INT,
  process_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE work_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  process_id UUID,
  version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE process_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID,
  change_desc TEXT,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 新增：质量管理（测）相关表 ==========
CREATE TABLE quality_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  object_type VARCHAR(20), -- 设备/物料/工序/批次
  object_id UUID,
  inspection_type VARCHAR(50),
  result VARCHAR(20),
  inspector_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inspection_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID REFERENCES quality_inspections(id),
  item VARCHAR(100),
  value VARCHAR(100),
  result VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quality_exceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  related_object_type VARCHAR(20),
  related_object_id UUID,
  description TEXT,
  action_taken TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quality_traces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID,
  device_id UUID,
  process_id UUID,
  inspection_id UUID,
  result VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 新增：环境监测（环）相关表 ==========
CREATE TABLE environment_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id),
  type VARCHAR(50), -- 温度/湿度/能耗/气体等
  value DECIMAL(18,4),
  unit VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE env_alarm_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id),
  type VARCHAR(50),
  level VARCHAR(20),
  description TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ========== 新增核心表测试数据 ========== 

-- 物料管理相关测试数据
INSERT INTO materials (id, name, type, spec, unit, description) VALUES
  (gen_random_uuid(), '轴承钢', '原材料', 'GCr15', 'kg', '高碳铬轴承钢'),
  (gen_random_uuid(), '精密轴承', '成品', '6205', 'pcs', '高精度球轴承');

INSERT INTO material_batches (id, material_id, batch_no, production_date, expiry_date, supplier, status) VALUES
  (gen_random_uuid(), (SELECT id FROM materials WHERE name='轴承钢' LIMIT 1), 'BATCH-202401', '2024-01-01', '2025-01-01', '宝钢', 'in_stock'),
  (gen_random_uuid(), (SELECT id FROM materials WHERE name='精密轴承' LIMIT 1), 'BATCH-202402', '2024-02-01', '2025-02-01', 'SKF', 'in_stock');

INSERT INTO inventory (id, material_id, quantity, location, batch_no) VALUES
  (gen_random_uuid(), (SELECT id FROM materials WHERE name='轴承钢' LIMIT 1), 1000, '原料库A', 'BATCH-202401'),
  (gen_random_uuid(), (SELECT id FROM materials WHERE name='精密轴承' LIMIT 1), 500, '成品库B', 'BATCH-202402');

INSERT INTO material_transactions (id, material_id, batch_id, type, quantity, operator_id) VALUES
  (gen_random_uuid(), (SELECT id FROM materials WHERE name='轴承钢' LIMIT 1), (SELECT id FROM material_batches WHERE batch_no='BATCH-202401' LIMIT 1), '入库', 1000, NULL),
  (gen_random_uuid(), (SELECT id FROM materials WHERE name='精密轴承' LIMIT 1), (SELECT id FROM material_batches WHERE batch_no='BATCH-202402' LIMIT 1), '入库', 500, NULL);

-- 工艺管理相关测试数据
INSERT INTO process_parameters (id, name, value, unit, device_id) VALUES
  (gen_random_uuid(), '主轴转速', '12000', 'rpm', NULL),
  (gen_random_uuid(), '进给速度', '500', 'mm/min', NULL);

INSERT INTO process_steps (id, name, description, sequence, process_id) VALUES
  (gen_random_uuid(), '粗加工', '初步去除多余材料', 1, NULL),
  (gen_random_uuid(), '精加工', '精细加工达到尺寸要求', 2, NULL);

INSERT INTO work_instructions (id, title, content, process_id, version) VALUES
  (gen_random_uuid(), '轴承加工指导书', '1. 检查原材料 2. 设置设备参数 3. 加工 4. 检验', NULL, 'v1.0');

INSERT INTO process_changes (id, process_id, change_desc, changed_by) VALUES
  (gen_random_uuid(), NULL, '优化了精加工参数', NULL);

-- 质量管理相关测试数据
INSERT INTO quality_inspections (id, object_type, object_id, inspection_type, result, inspector_id) VALUES
  (gen_random_uuid(), '物料', (SELECT id FROM materials WHERE name='精密轴承' LIMIT 1), '外观检验', '合格', NULL),
  (gen_random_uuid(), '物料', (SELECT id FROM materials WHERE name='精密轴承' LIMIT 1), '尺寸检验', '合格', NULL);

INSERT INTO inspection_records (id, inspection_id, item, value, result) VALUES
  (gen_random_uuid(), (SELECT id FROM quality_inspections WHERE inspection_type='外观检验' LIMIT 1), '表面光洁度', 'Ra0.8', '合格'),
  (gen_random_uuid(), (SELECT id FROM quality_inspections WHERE inspection_type='尺寸检验' LIMIT 1), '外径', '25.00', '合格');

INSERT INTO quality_exceptions (id, related_object_type, related_object_id, description, action_taken, resolved) VALUES
  (gen_random_uuid(), '物料', (SELECT id FROM materials WHERE name='精密轴承' LIMIT 1), '发现轻微划痕', '返工抛光', TRUE);

INSERT INTO quality_traces (id, batch_id, device_id, process_id, inspection_id, result) VALUES
  (gen_random_uuid(), (SELECT id FROM material_batches WHERE batch_no='BATCH-202402' LIMIT 1), NULL, NULL, (SELECT id FROM quality_inspections WHERE inspection_type='外观检验' LIMIT 1), '合格');

-- 环境监测相关测试数据
INSERT INTO environment_data (id, workshop_id, type, value, unit) VALUES
  (gen_random_uuid(), NULL, '温度', 23.5, '°C'),
  (gen_random_uuid(), NULL, '湿度', 55.0, '%');

INSERT INTO env_alarm_records (id, workshop_id, type, level, description) VALUES
  (gen_random_uuid(), NULL, '温度', 'high', '温度超过阈值');

-- ========== 新增：人员相关表测试数据 ========== 

-- 员工档案测试数据
INSERT INTO employee_profiles (id, user_id, enterprise_id, employee_no, name, gender, phone, email, position, skill_tags, certifications, hire_date, status) VALUES
  (gen_random_uuid(), NULL, (SELECT id FROM enterprises LIMIT 1), 'EMP-001', '张三', '男', '13800000001', 'zhangsan@example.com', '操作员', ARRAY['数控'], ARRAY['安全证书'], '2023-01-01', 'active'),
  (gen_random_uuid(), NULL, (SELECT id FROM enterprises LIMIT 1), 'EMP-002', '李四', '女', '13800000002', 'lisi@example.com', '质检员', ARRAY['质检'], ARRAY['质量证书'], '2023-02-01', 'active');

-- 岗位测试数据
INSERT INTO positions (id, site_id, name, description, required_skills) VALUES
  (gen_random_uuid(), NULL, '数控操作岗', '负责CNC设备操作', ARRAY['数控']),
  (gen_random_uuid(), NULL, '质检岗', '负责产品质量检验', ARRAY['质检']);

-- 员工岗位分配测试数据
INSERT INTO employee_positions (id, employee_id, position_id, assigned_at) VALUES
  (gen_random_uuid(), (SELECT id FROM employee_profiles WHERE employee_no='EMP-001' LIMIT 1), (SELECT id FROM positions WHERE name='数控操作岗' LIMIT 1), NOW()),
  (gen_random_uuid(), (SELECT id FROM employee_profiles WHERE employee_no='EMP-002' LIMIT 1), (SELECT id FROM positions WHERE name='质检岗' LIMIT 1), NOW());

-- 班次测试数据
INSERT INTO shifts (id, enterprise_id, name, start_time, end_time, description) VALUES
  (gen_random_uuid(), (SELECT id FROM enterprises LIMIT 1), '早班', '08:00', '16:00', '白天班次'),
  (gen_random_uuid(), (SELECT id FROM enterprises LIMIT 1), '晚班', '16:00', '00:00', '夜间班次');

-- 排班测试数据
INSERT INTO schedules (id, employee_id, shift_id, site_id, date, status, created_at) VALUES
  (gen_random_uuid(), (SELECT id FROM employee_profiles WHERE employee_no='EMP-001' LIMIT 1), (SELECT id FROM shifts WHERE name='早班' LIMIT 1), NULL, '2024-03-01', 'scheduled', NOW()),
  (gen_random_uuid(), (SELECT id FROM employee_profiles WHERE employee_no='EMP-002' LIMIT 1), (SELECT id FROM shifts WHERE name='晚班' LIMIT 1), NULL, '2024-03-01', 'scheduled', NOW());

-- 工单分派测试数据
INSERT INTO task_assignments (id, task_id, employee_id, assigned_by, assigned_at, status) VALUES
  (gen_random_uuid(), NULL, (SELECT id FROM employee_profiles WHERE employee_no='EMP-001' LIMIT 1), NULL, NOW(), 'assigned'),
  (gen_random_uuid(), NULL, (SELECT id FROM employee_profiles WHERE employee_no='EMP-002' LIMIT 1), NULL, NOW(), 'assigned');