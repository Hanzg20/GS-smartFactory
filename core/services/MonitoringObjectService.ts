import { MonitoringObject, Alert, EntityStatus } from '../types/base'
import { BaseEntityService, QueryFilter } from './BaseEntityService'
import { SupabaseClient } from '@supabase/supabase-js'

// 监控对象服务类
export class MonitoringObjectService extends BaseEntityService<MonitoringObject> {
  constructor(supabaseClient: SupabaseClient, tableName: string = 'monitoring_objects') {
    super(supabaseClient, tableName)
  }

  // 数据库实体转换
  transformFromDB(dbEntity: any): MonitoringObject {
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      description: dbEntity.description,
      type: dbEntity.type,
      category: dbEntity.category,
      status: dbEntity.status,
      metadata: dbEntity.metadata || {},
      position: dbEntity.position_x !== undefined ? {
        x: dbEntity.position_x,
        y: dbEntity.position_y,
        z: dbEntity.position_z,
        rotation: dbEntity.rotation,
        rotation_x: dbEntity.rotation_x,
        rotation_y: dbEntity.rotation_y,
        rotation_z: dbEntity.rotation_z
      } : undefined,
      tags: dbEntity.tags || [],
      created_at: new Date(dbEntity.created_at),
      updated_at: new Date(dbEntity.updated_at),
      tenant_id: dbEntity.tenant_id,
      specifications: dbEntity.specifications || {},
      real_time_data: dbEntity.real_time_data || {},
      parameters: dbEntity.parameters || {},
      maintenance_info: dbEntity.maintenance_info || {},
      settings: dbEntity.settings,
      image_url: dbEntity.image_url,
      model_3d_url: dbEntity.model_3d_url,
      manufacturer: dbEntity.manufacturer,
      model: dbEntity.model,
      serial_number: dbEntity.serial_number,
      installation_date: dbEntity.installation_date ? new Date(dbEntity.installation_date) : undefined,
      warranty_expiry: dbEntity.warranty_expiry ? new Date(dbEntity.warranty_expiry) : undefined
    }
  }

  transformToDB(entity: Partial<MonitoringObject>): any {
    const dbEntity: any = {
      name: entity.name,
      description: entity.description,
      type: entity.type,
      category: entity.category,
      status: entity.status,
      metadata: entity.metadata,
      tags: entity.tags,
      tenant_id: entity.tenant_id,
      specifications: entity.specifications,
      real_time_data: entity.real_time_data,
      parameters: entity.parameters,
      maintenance_info: entity.maintenance_info,
      settings: entity.settings,
      image_url: entity.image_url,
      model_3d_url: entity.model_3d_url,
      manufacturer: entity.manufacturer,
      model: entity.model,
      serial_number: entity.serial_number,
      installation_date: entity.installation_date?.toISOString(),
      warranty_expiry: entity.warranty_expiry?.toISOString()
    }

    // 处理位置信息
    if (entity.position) {
      dbEntity.position_x = entity.position.x
      dbEntity.position_y = entity.position.y
      dbEntity.position_z = entity.position.z
      dbEntity.rotation = entity.position.rotation
      dbEntity.rotation_x = entity.position.rotation_x
      dbEntity.rotation_y = entity.position.rotation_y
      dbEntity.rotation_z = entity.position.rotation_z
    }

    return dbEntity
  }

  // 监控对象特有方法

  // 更新实时数据
  async updateRealTimeData(id: string, data: Record<string, any>): Promise<void> {
    const currentObject = await this.findById(id)
    if (!currentObject) {
      throw new Error(`Monitoring object ${id} not found`)
    }

    const updatedRealTimeData = {
      ...currentObject.real_time_data,
      ...data,
      last_updated: new Date().toISOString()
    }

    await this.update(id, {
      real_time_data: updatedRealTimeData
    })
  }

  // 更新状态
  async updateStatus(id: string, status: EntityStatus): Promise<void> {
    await this.update(id, { status })
  }

  // 创建报警
  async createAlert(objectId: string, alert: Omit<Alert, 'id' | 'monitoring_object_id' | 'created_at'>): Promise<Alert> {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      monitoring_object_id: objectId,
      created_at: new Date(),
      ...alert
    }

    // 这里应该调用AlertService，但为了演示简化处理
    const { data, error } = await this.supabase
      .from('alerts')
      .insert({
        id: newAlert.id,
        monitoring_object_id: newAlert.monitoring_object_id,
        space_id: newAlert.space_id,
        type: newAlert.type,
        message: newAlert.message,
        severity: newAlert.severity,
        status: newAlert.status,
        metadata: newAlert.metadata,
        created_at: newAlert.created_at.toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create alert: ${error.message}`)
    }

    return newAlert
  }

  // 根据空间查找监控对象
  async findBySpace(spaceId: string): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [{ field: 'space_id', operator: 'eq', value: spaceId }]
    })
  }

  // 查找在线的监控对象
  async findOnline(): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [
        { field: 'status', operator: 'eq', value: EntityStatus.ACTIVE },
        { field: 'real_time_data->online', operator: 'eq', value: true }
      ]
    })
  }

  // 查找离线的监控对象
  async findOffline(): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [
        { field: 'status', operator: 'eq', value: EntityStatus.OFFLINE }
      ]
    })
  }

  // 查找需要维护的监控对象
  async findMaintenanceRequired(): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [
        { field: 'status', operator: 'eq', value: EntityStatus.MAINTENANCE }
      ]
    })
  }

  // 查找有错误的监控对象
  async findWithErrors(): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [
        { field: 'status', operator: 'eq', value: EntityStatus.ERROR }
      ]
    })
  }

  // 根据制造商查找
  async findByManufacturer(manufacturer: string): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [{ field: 'manufacturer', operator: 'eq', value: manufacturer }]
    })
  }

  // 根据型号查找
  async findByModel(model: string): Promise<MonitoringObject[]> {
    return this.findAll({
      filters: [{ field: 'model', operator: 'eq', value: model }]
    })
  }

  // 查找即将过保的设备
  async findWarrantyExpiring(days: number = 30): Promise<MonitoringObject[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return this.findAll({
      filters: [
        { field: 'warranty_expiry', operator: 'lte', value: futureDate.toISOString() },
        { field: 'warranty_expiry', operator: 'gte', value: new Date().toISOString() }
      ]
    })
  }

  // 批量更新实时数据
  async batchUpdateRealTimeData(updates: Array<{ id: string; data: Record<string, any> }>): Promise<void> {
    const promises = updates.map(update => 
      this.updateRealTimeData(update.id, update.data)
    )
    
    await Promise.all(promises)
  }

  // 获取监控对象统计信息
  async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    maintenance: number
    error: number
    offline: number
  }> {
    const [total, active, inactive, maintenance, error, offline] = await Promise.all([
      this.count(),
      this.count([{ field: 'status', operator: 'eq', value: EntityStatus.ACTIVE }]),
      this.count([{ field: 'status', operator: 'eq', value: EntityStatus.INACTIVE }]),
      this.count([{ field: 'status', operator: 'eq', value: EntityStatus.MAINTENANCE }]),
      this.count([{ field: 'status', operator: 'eq', value: EntityStatus.ERROR }]),
      this.count([{ field: 'status', operator: 'eq', value: EntityStatus.OFFLINE }])
    ])

    return {
      total,
      active,
      inactive,
      maintenance,
      error,
      offline
    }
  }

  // 获取监控对象的历史数据
  async getHistoricalData(
    objectId: string, 
    startDate: Date, 
    endDate: Date,
    dataKeys?: string[]
  ): Promise<Array<{ timestamp: Date; data: Record<string, any> }>> {
    // 这里应该查询历史数据表
    // 为了演示，返回模拟数据
    const { data, error } = await this.supabase
      .from('historical_data')
      .select('*')
      .eq('monitoring_object_id', objectId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      throw new Error(`Failed to get historical data: ${error.message}`)
    }

    return data?.map(record => ({
      timestamp: new Date(record.timestamp),
      data: dataKeys ? 
        Object.fromEntries(
          Object.entries(record.data).filter(([key]) => dataKeys.includes(key))
        ) : 
        record.data
    })) || []
  }

  // 获取监控对象的报警历史
  async getAlertHistory(
    objectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Alert[]> {
    let query = this.supabase
      .from('alerts')
      .select('*')
      .eq('monitoring_object_id', objectId)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get alert history: ${error.message}`)
    }

    return data?.map(record => ({
      id: record.id,
      monitoring_object_id: record.monitoring_object_id,
      space_id: record.space_id,
      type: record.type,
      message: record.message,
      severity: record.severity,
      status: record.status,
      created_at: new Date(record.created_at),
      acknowledged_at: record.acknowledged_at ? new Date(record.acknowledged_at) : undefined,
      acknowledged_by: record.acknowledged_by,
      resolved_at: record.resolved_at ? new Date(record.resolved_at) : undefined,
      resolved_by: record.resolved_by,
      metadata: record.metadata
    })) || []
  }
} 