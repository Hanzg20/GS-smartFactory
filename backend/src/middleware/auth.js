import jwt from 'jsonwebtoken'
import { supabase } from '../config/database.js'

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'smartfactory_jwt_secret_2024_dev'

// 验证JWT Token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: '请提供访问令牌' 
      })
    }

    // 验证JWT Token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 从Supabase获取用户信息
    const { data: user, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: '无效的访问令牌' 
      })
    }

    req.user = user
    req.userId = user.id
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: '访问令牌已过期' 
      })
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      message: '无效的访问令牌' 
    })
  }
}

// 验证用户权限
export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: '需要身份验证' 
        })
      }

      // 获取用户在企业中的角色和权限
      const { data: userEnterprise, error } = await supabase
        .from('user_enterprises')
        .select(`
          *,
          role:roles(permissions)
        `)
        .eq('user_id', req.user.id)
        .single()

      if (error || !userEnterprise) {
        return res.status(403).json({ 
          error: 'No enterprise access',
          message: '无企业访问权限' 
        })
      }

      const permissions = userEnterprise.role?.permissions || []
      
      // 检查是否有所需权限
      if (permissions.includes('*') || permissions.includes(requiredPermission)) {
        req.userEnterprise = userEnterprise
        next()
      } else {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: '权限不足' 
        })
      }
    } catch (error) {
      return res.status(500).json({ 
        error: 'Permission check failed',
        message: '权限检查失败' 
      })
    }
  }
}

// 验证企业访问权限
export const checkEnterpriseAccess = async (req, res, next) => {
  try {
    const enterpriseId = req.params.enterpriseId || req.body.enterprise_id
    
    if (!enterpriseId) {
      return res.status(400).json({ 
        error: 'Enterprise ID required',
        message: '需要企业ID' 
      })
    }

    // 检查用户是否有访问该企业的权限
    const { data: access, error } = await supabase
      .from('user_enterprises')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('enterprise_id', enterpriseId)
      .single()

    if (error || !access) {
      return res.status(403).json({ 
        error: 'Enterprise access denied',
        message: '无企业访问权限' 
      })
    }

    req.enterpriseId = enterpriseId
    req.userEnterprise = access
    next()
  } catch (error) {
    return res.status(500).json({ 
      error: 'Enterprise access check failed',
      message: '企业访问检查失败' 
    })
  }
}

// 生成JWT Token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// 可选认证（不强制要求登录）
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET)
      const { data: user } = await supabase.auth.getUser(token)
      
      if (user) {
        req.user = user
        req.userId = user.id
      }
    }
    
    next()
  } catch (error) {
    // 忽略认证错误，继续执行
    next()
  }
}

export default {
  authenticateToken,
  checkPermission,
  checkEnterpriseAccess,
  generateToken,
  optionalAuth
} 