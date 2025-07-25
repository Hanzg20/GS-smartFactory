import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'demo-key';

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project') || SUPABASE_KEY.includes('your-')) {
  console.warn('⚠️  使用演示Supabase配置 - 部分功能可能无法正常工作');
  console.warn('请在.env文件中配置真实的SUPABASE_URL和SUPABASE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    if (error) throw error;
    
    console.log('✅ 数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error.message);
    return false;
  }
};

export const getDatabaseStats = async () => {
  try {
    const tables = ['devices', 'workshops', 'enterprises', 'alarms', 'maintenance_records'];
    const stats = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      stats[table] = count;
    }

    return stats;
  } catch (error) {
    console.error('❌ 获取数据库统计失败:', error.message);
    return null;
  }
};

// 设备相关
export const getDevices = async () => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ 获取设备列表失败:', error.message);
    return { data: null, error: error.message };
  }
};

export const getDeviceById = async (deviceId) => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select(`
        *,
        workshop:workshops(id, name),
        enterprise:enterprises(id, name),
        alarms:alarms(id, type, message, created_at),
        maintenance:maintenance_records(id, type, description, scheduled_date)
      `)
      .eq('id', deviceId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`❌ 获取设备(${deviceId})详情失败:`, error.message);
    return { data: null, error: error.message };
  }
};

// 车间相关
export const getWorkshops = async () => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        devices:devices(id, name, type, status),
        enterprise:enterprises(id, name)
      `);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ 获取车间列表失败:', error.message);
    return { data: null, error: error.message };
  }
};

export const getWorkshopById = async (workshopId) => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        devices:devices(
          id, name, type, status,
          alarms:alarms(id, type, message, created_at)
        ),
        enterprise:enterprises(id, name)
      `)
      .eq('id', workshopId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`❌ 获取车间(${workshopId})详情失败:`, error.message);
    return { data: null, error: error.message };
  }
};

// 企业相关
export const getEnterprises = async () => {
  try {
    const { data, error } = await supabase
      .from('enterprises')
      .select(`
        *,
        workshops:workshops(id, name),
        devices:devices(id, name, type, status)
      `);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ 获取企业列表失败:', error.message);
    return { data: null, error: error.message };
  }
};

export const getEnterpriseById = async (enterpriseId) => {
  try {
    const { data, error } = await supabase
      .from('enterprises')
      .select(`
        *,
        workshops:workshops(
          id, name,
          devices:devices(id, name, type, status)
        )
      `)
      .eq('id', enterpriseId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`❌ 获取企业(${enterpriseId})详情失败:`, error.message);
    return { data: null, error: error.message };
  }
};

// 报警相关
export const getAlarms = async (filters = {}) => {
  try {
    let query = supabase
      .from('alarms')
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `);

    // 应用过滤器
    if (filters.deviceId) query = query.eq('device_id', filters.deviceId);
    if (filters.workshopId) query = query.eq('workshop_id', filters.workshopId);
    if (filters.enterpriseId) query = query.eq('enterprise_id', filters.enterpriseId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.from) query = query.gte('created_at', filters.from);
    if (filters.to) query = query.lte('created_at', filters.to);

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ 获取报警列表失败:', error.message);
    return { data: null, error: error.message };
  }
};

// 维护记录相关
export const getMaintenanceRecords = async (filters = {}) => {
  try {
    let query = supabase
      .from('maintenance_records')
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `);

    // 应用过滤器
    if (filters.deviceId) query = query.eq('device_id', filters.deviceId);
    if (filters.workshopId) query = query.eq('workshop_id', filters.workshopId);
    if (filters.enterpriseId) query = query.eq('enterprise_id', filters.enterpriseId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.from) query = query.gte('scheduled_date', filters.from);
    if (filters.to) query = query.lte('scheduled_date', filters.to);

    const { data, error } = await query
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ 获取维护记录失败:', error.message);
    return { data: null, error: error.message };
  }
};

export default supabase; 