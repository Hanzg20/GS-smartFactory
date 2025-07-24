import { io } from '../index.js';
import supabase from '../config/database.js';

// 获取报警列表
export const getAlarms = async (req, res) => {
  try {
    const {
      deviceId,
      workshopId,
      enterpriseId,
      type,
      status,
      from,
      to
    } = req.query;

    let query = supabase
      .from('alarms')
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `);

    // 应用过滤器
    if (deviceId) query = query.eq('device_id', deviceId);
    if (workshopId) query = query.eq('workshop_id', workshopId);
    if (enterpriseId) query = query.eq('enterprise_id', enterpriseId);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('❌ 获取报警列表失败:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '获取报警列表失败'
    });
  }
};

// 获取报警详情
export const getAlarmById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('alarms')
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({
        error: 'Not found',
        message: '报警不存在'
      });
    }

    res.json(data);
  } catch (error) {
    console.error(`❌ 获取报警(${req.params.id})详情失败:`, error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '获取报警详情失败'
    });
  }
};

// 创建新报警
export const createAlarm = async (req, res) => {
  try {
    const {
      device_id,
      type,
      message,
      severity = 'warning',
      metadata = {}
    } = req.body;

    // 获取设备信息
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select(`
        id, name, type,
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `)
      .eq('id', device_id)
      .single();

    if (deviceError) throw deviceError;
    if (!device) {
      return res.status(404).json({
        error: 'Not found',
        message: '设备不存在'
      });
    }

    // 创建报警记录
    const { data: alarm, error } = await supabase
      .from('alarms')
      .insert({
        device_id,
        workshop_id: device.workshop?.id,
        enterprise_id: device.enterprise?.id,
        type,
        message,
        severity,
        status: 'active',
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // 广播新报警
    const alarmWithDetails = {
      ...alarm,
      device_name: device.name,
      workshop_name: device.workshop?.name,
      enterprise_name: device.enterprise?.name
    };

    // 发送到不同的房间
    io.to(`device_${device_id}`).emit('new_alarm', alarmWithDetails);
    if (device.workshop?.id) {
      io.to(`workshop_${device.workshop.id}`).emit('new_alarm', alarmWithDetails);
    }
    if (device.enterprise?.id) {
      io.to(`enterprise_${device.enterprise.id}`).emit('new_alarm', alarmWithDetails);
    }
    io.to('all_alarms').emit('new_alarm', alarmWithDetails);

    res.status(201).json(alarm);
  } catch (error) {
    console.error('❌ 创建报警失败:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '创建报警失败'
    });
  }
};

// 确认报警
export const acknowledgeAlarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const { data: alarm, error } = await supabase
      .from('alarms')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user_id
      })
      .eq('id', id)
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `)
      .single();

    if (error) throw error;
    if (!alarm) {
      return res.status(404).json({
        error: 'Not found',
        message: '报警不存在'
      });
    }

    // 广播报警更新
    const alarmWithDetails = {
      ...alarm,
      device_name: alarm.device?.name,
      workshop_name: alarm.workshop?.name,
      enterprise_name: alarm.enterprise?.name
    };

    io.to(`device_${alarm.device_id}`).emit('alarm_update', alarmWithDetails);
    if (alarm.workshop?.id) {
      io.to(`workshop_${alarm.workshop.id}`).emit('alarm_update', alarmWithDetails);
    }
    if (alarm.enterprise?.id) {
      io.to(`enterprise_${alarm.enterprise.id}`).emit('alarm_update', alarmWithDetails);
    }
    io.to('all_alarms').emit('alarm_update', alarmWithDetails);

    res.json(alarm);
  } catch (error) {
    console.error(`❌ 确认报警(${req.params.id})失败:`, error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '确认报警失败'
    });
  }
};

// 解决报警
export const resolveAlarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, resolution_notes } = req.body;

    const { data: alarm, error } = await supabase
      .from('alarms')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: user_id,
        resolution_notes
      })
      .eq('id', id)
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `)
      .single();

    if (error) throw error;
    if (!alarm) {
      return res.status(404).json({
        error: 'Not found',
        message: '报警不存在'
      });
    }

    // 广播报警更新
    const alarmWithDetails = {
      ...alarm,
      device_name: alarm.device?.name,
      workshop_name: alarm.workshop?.name,
      enterprise_name: alarm.enterprise?.name
    };

    io.to(`device_${alarm.device_id}`).emit('alarm_update', alarmWithDetails);
    if (alarm.workshop?.id) {
      io.to(`workshop_${alarm.workshop.id}`).emit('alarm_update', alarmWithDetails);
    }
    if (alarm.enterprise?.id) {
      io.to(`enterprise_${alarm.enterprise.id}`).emit('alarm_update', alarmWithDetails);
    }
    io.to('all_alarms').emit('alarm_update', alarmWithDetails);

    res.json(alarm);
  } catch (error) {
    console.error(`❌ 解决报警(${req.params.id})失败:`, error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '解决报警失败'
    });
  }
};

// 获取报警统计信息
export const getAlarmStats = async (req, res) => {
  try {
    const { deviceId, workshopId, enterpriseId, from, to } = req.query;

    let query = supabase
      .from('alarms')
      .select('*', { count: 'exact' });

    // 应用过滤器
    if (deviceId) query = query.eq('device_id', deviceId);
    if (workshopId) query = query.eq('workshop_id', workshopId);
    if (enterpriseId) query = query.eq('enterprise_id', enterpriseId);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    // 获取总数
    const { count: total } = await query;

    // 获取各状态数量
    const { data: statusCounts } = await query
      .select('status')
      .then(({ data }) => {
        const counts = {
          active: 0,
          acknowledged: 0,
          resolved: 0
        };
        data.forEach(alarm => {
          counts[alarm.status] = (counts[alarm.status] || 0) + 1;
        });
        return { data: counts };
      });

    // 获取各类型数量
    const { data: typeCounts } = await query
      .select('type')
      .then(({ data }) => {
        const counts = {
          error: 0,
          warning: 0,
          info: 0
        };
        data.forEach(alarm => {
          counts[alarm.type] = (counts[alarm.type] || 0) + 1;
        });
        return { data: counts };
      });

    res.json({
      total,
      by_status: statusCounts,
      by_type: typeCounts
    });
  } catch (error) {
    console.error('❌ 获取报警统计失败:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '获取报警统计失败'
    });
  }
};

// 批量更新报警
export const bulkUpdateAlarms = async (req, res) => {
  try {
    const { ids, status, user_id } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: '无效的报警ID列表'
      });
    }

    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
      updates.acknowledged_by = user_id;
    } else if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user_id;
    }

    const { data: alarms, error } = await supabase
      .from('alarms')
      .update(updates)
      .in('id', ids)
      .select(`
        *,
        device:devices(id, name, type),
        workshop:workshops(id, name),
        enterprise:enterprises(id, name)
      `);

    if (error) throw error;

    // 广播更新
    alarms.forEach(alarm => {
      const alarmWithDetails = {
        ...alarm,
        device_name: alarm.device?.name,
        workshop_name: alarm.workshop?.name,
        enterprise_name: alarm.enterprise?.name
      };

      io.to(`device_${alarm.device_id}`).emit('alarm_update', alarmWithDetails);
      if (alarm.workshop?.id) {
        io.to(`workshop_${alarm.workshop.id}`).emit('alarm_update', alarmWithDetails);
      }
      if (alarm.enterprise?.id) {
        io.to(`enterprise_${alarm.enterprise.id}`).emit('alarm_update', alarmWithDetails);
      }
      io.to('all_alarms').emit('alarm_update', alarmWithDetails);
    });

    res.json(alarms);
  } catch (error) {
    console.error('❌ 批量更新报警失败:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: '批量更新报警失败'
    });
  }
};

export default {
  getAlarms,
  getAlarmById,
  createAlarm,
  acknowledgeAlarm,
  resolveAlarm,
  getAlarmStats,
  bulkUpdateAlarms
}; 