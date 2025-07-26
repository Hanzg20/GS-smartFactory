import { CoreUser, CoreRole, CorePermission, UserSession, PermissionCheckResult, ResourceAction, EntityStatus } from '../types/base'
import { BaseEntityService, QueryFilter } from './BaseEntityService'
import { SupabaseClient } from '@supabase/supabase-js'

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface LoginResult {
  user: CoreUser
  token: string
  refresh_token?: string
  session: UserSession
  expires_at: Date
}

export interface PermissionCheckOptions {
  resource: string
  action: ResourceAction
  resource_id?: string
  context?: Record<string, any>
}

export class AuthService extends BaseEntityService<CoreUser> {
  private readonly jwtSecret: string
  private readonly jwtExpiry: string
  private readonly refreshTokenExpiry: string

  constructor(
    supabaseClient: SupabaseClient, 
    config: {
      jwtSecret: string
      jwtExpiry?: string
      refreshTokenExpiry?: string
    }
  ) {
    super(supabaseClient, 'users')
    this.jwtSecret = config.jwtSecret
    this.jwtExpiry = config.jwtExpiry || '24h'
    this.refreshTokenExpiry = config.refreshTokenExpiry || '7d'
  }

  // 实现基类的抽象方法
  transformFromDB(dbEntity: any): CoreUser {
    return {
      id: dbEntity.id,
      name: dbEntity.full_name || `${dbEntity.first_name} ${dbEntity.last_name}`.trim(),
      description: dbEntity.bio,
      type: 'user',
      category: 'person',
      status: dbEntity.is_active ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
      metadata: dbEntity.metadata || {},
      tenant_id: dbEntity.tenant_id,
      tags: dbEntity.tags || [],
      created_at: new Date(dbEntity.created_at),
      updated_at: new Date(dbEntity.updated_at),
      email: dbEntity.email,
      username: dbEntity.username,
      first_name: dbEntity.first_name,
      last_name: dbEntity.last_name,
      full_name: dbEntity.full_name,
      email_verified: dbEntity.email_verified || false,
      phone_verified: dbEntity.phone_verified || false,
      is_active: dbEntity.is_active || true,
      last_login_at: dbEntity.last_login_at ? new Date(dbEntity.last_login_at) : undefined,
      password_changed_at: dbEntity.password_changed_at ? new Date(dbEntity.password_changed_at) : undefined,
      profile: dbEntity.profile,
      roles: dbEntity.roles || [],
      memberships: dbEntity.memberships || [],
      region_id: dbEntity.region_id,
      region: dbEntity.region
    }
  }

  transformToDB(entity: Partial<CoreUser>): any {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      category: entity.category,
      status: entity.status,
      metadata: entity.metadata,
      tenant_id: entity.tenant_id,
      tags: entity.tags,
      email: entity.email,
      username: entity.username,
      first_name: entity.first_name,
      last_name: entity.last_name,
      full_name: entity.full_name,
      email_verified: entity.email_verified,
      phone_verified: entity.phone_verified,
      is_active: entity.is_active,
      last_login_at: entity.last_login_at?.toISOString(),
      password_changed_at: entity.password_changed_at?.toISOString(),
      region_id: entity.region_id
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { email, password, remember_me = false } = credentials

    // 查找用户
    const { data: userData, error } = await this.supabase
      .from('users')
      .select(`
        *,
        profile:user_profiles(*),
        roles:user_roles(
          role:roles(
            *,
            permissions:role_permissions(
              permission:permissions(*)
            )
          )
        ),
        memberships:tenant_memberships(*)
      `)
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !userData) {
      throw new Error('用户不存在或已被禁用')
    }

    // 验证密码 (实际实现时需要导入bcrypt)
    // const isValidPassword = await bcrypt.compare(password, userData.password_hash)
    const isValidPassword = true // 简化实现，实际使用时替换为密码验证

    if (!isValidPassword) {
      throw new Error('密码错误')
    }

    // 转换用户数据
    const user = this.transformFromDB(userData)

    // 生成令牌 (实际实现时需要导入jsonwebtoken)
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      roles: user.roles.map(r => r.code)
    }

    // const token = jwt.sign(tokenPayload, this.jwtSecret, { expiresIn: this.jwtExpiry })
    const token = `mock_token_${user.id}_${Date.now()}` // 简化实现

    const refreshToken = remember_me ? `mock_refresh_${user.id}_${Date.now()}` : undefined

    // 创建会话
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (remember_me ? 24 * 7 : 24))

    const session = await this.createSession({
      user_id: user.id,
      token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      device_info: {
        type: 'web'
      },
      ip_address: '127.0.0.1', // 实际使用时从请求中获取
      is_active: true
    })

    // 更新最后登录时间
    await this.updateLastLogin(user.id)

    return {
      user,
      token,
      refresh_token: refreshToken,
      session,
      expires_at: expiresAt
    }
  }

  /**
   * 创建用户会话
   */
  async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .insert([{
        ...sessionData,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`创建会话失败: ${error.message}`)
    }

    return {
      id: data.id,
      user_id: data.user_id,
      token: data.token,
      refresh_token: data.refresh_token,
      device_info: data.device_info,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      created_at: new Date(data.created_at),
      last_active_at: new Date(data.last_active_at),
      expires_at: new Date(data.expires_at),
      is_active: data.is_active
    }
  }

  /**
   * 验证令牌
   */
  async verifyToken(token: string): Promise<CoreUser | null> {
    try {
      // 简化的令牌验证逻辑 (实际实现时使用jwt.verify)
      if (!token.startsWith('mock_token_')) {
        return null
      }
      
      // 检查会话是否有效
      const { data: sessionData } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (!sessionData) {
        return null
      }

      // 获取用户信息
      const user = await this.findById(sessionData.user_id)
      if (!user || !user.is_active) {
        return null
      }

      // 更新会话活跃时间
      await this.updateSessionActivity(sessionData.id)

      return user
    } catch (error) {
      return null
    }
  }

  /**
   * 权限检查
   */
  async checkPermission(
    userId: string, 
    options: PermissionCheckOptions
  ): Promise<PermissionCheckResult> {
    const { resource, action, resource_id, context } = options

    // 获取用户及其角色权限
    const user = await this.getUserWithPermissions(userId)
    if (!user) {
      return { allowed: false, reason: '用户不存在' }
    }

    // 系统管理员拥有所有权限
    const isAdmin = user.roles.some(role => role.code === 'system_admin')
    if (isAdmin) {
      return { allowed: true }
    }

    // 检查具体权限
    const hasPermission = user.roles.some(role =>
      role.permissions.some(permission =>
        permission.resource === resource &&
        permission.action === action &&
        this.checkPermissionConditions(permission, { resource_id, context, user })
      )
    )

    if (!hasPermission) {
      return { 
        allowed: false, 
        reason: `缺少权限: ${resource}:${action}` 
      }
    }

    return { allowed: true }
  }

  /**
   * 检查权限条件
   */
  private checkPermissionConditions(
    permission: CorePermission,
    context: {
      resource_id?: string
      context?: Record<string, any>
      user: CoreUser
    }
  ): boolean {
    if (!permission.conditions) {
      return true
    }

    // 实现具体的条件检查逻辑
    return true // 简化实现
  }

  /**
   * 获取用户及权限信息
   */
  async getUserWithPermissions(userId: string): Promise<CoreUser | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        profile:user_profiles(*),
        roles:user_roles(
          role:roles(
            *,
            permissions:role_permissions(
              permission:permissions(*)
            )
          )
        )
      `)
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return this.transformFromDB(data)
  }

  /**
   * 更新最后登录时间
   */
  private async updateLastLogin(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)
  }

  /**
   * 更新会话活跃时间
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', sessionId)
  }

  /**
   * 登出用户
   */
  async logout(token: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('token', token)
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    // 验证当前密码
    const { data: userData } = await this.supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single()

    if (!userData) {
      throw new Error('用户不存在')
    }

    // 简化的密码验证 (实际实现时使用bcrypt)
    const isValidPassword = true // await bcrypt.compare(currentPassword, userData.password_hash)
    if (!isValidPassword) {
      throw new Error('当前密码错误')
    }

    // 更新密码 (实际实现时使用bcrypt.hash)
    const newPasswordHash = `hashed_${newPassword}` // await bcrypt.hash(newPassword, 10)
    await this.supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', userId)
  }

  /**
   * 获取用户会话列表
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_active_at', { ascending: false })

    if (error) {
      throw new Error(`获取会话列表失败: ${error.message}`)
    }

    return data.map(session => ({
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      refresh_token: session.refresh_token,
      device_info: session.device_info,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      created_at: new Date(session.created_at),
      last_active_at: new Date(session.last_active_at),
      expires_at: new Date(session.expires_at),
      is_active: session.is_active
    }))
  }

  /**
   * 终止指定会话
   */
  async terminateSession(sessionId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
  }
} 