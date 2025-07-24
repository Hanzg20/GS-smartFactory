import { performance } from 'perf_hooks'

// 性能监控数据
const performanceData = {
  requests: {
    total: 0,
    byMethod: {},
    byRoute: {},
    byStatus: {}
  },
  responseTimes: {
    min: Infinity,
    max: 0,
    avg: 0,
    total: 0
  },
  errors: {
    total: 0,
    byType: {},
    byRoute: {}
  },
  memory: {
    usage: process.memoryUsage(),
    lastUpdate: Date.now()
  }
}

// 性能监控中间件
export const performanceMonitor = (req, res, next) => {
  const start = performance.now()
  
  // 记录请求开始
  performanceData.requests.total++
  
  // 按方法统计
  const method = req.method
  performanceData.requests.byMethod[method] = (performanceData.requests.byMethod[method] || 0) + 1
  
  // 按路由统计
  const route = req.route?.path || req.path
  performanceData.requests.byRoute[route] = (performanceData.requests.byRoute[route] || 0) + 1

  // 重写res.end方法以记录响应时间
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const duration = performance.now() - start
    
    // 更新响应时间统计
    performanceData.responseTimes.total++
    performanceData.responseTimes.min = Math.min(performanceData.responseTimes.min, duration)
    performanceData.responseTimes.max = Math.max(performanceData.responseTimes.max, duration)
    performanceData.responseTimes.avg = (performanceData.responseTimes.avg * (performanceData.responseTimes.total - 1) + duration) / performanceData.responseTimes.total
    
    // 按状态码统计
    const status = res.statusCode
    performanceData.requests.byStatus[status] = (performanceData.requests.byStatus[status] || 0) + 1
    
    // 记录错误
    if (status >= 400) {
      performanceData.errors.total++
      const errorType = status >= 500 ? 'server' : 'client'
      performanceData.errors.byType[errorType] = (performanceData.errors.byType[errorType] || 0) + 1
      performanceData.errors.byRoute[route] = (performanceData.errors.byRoute[route] || 0) + 1
    }
    
    return originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

// 内存监控中间件
export const memoryMonitor = (req, res, next) => {
  // 每分钟更新一次内存使用情况
  const now = Date.now()
  if (now - performanceData.memory.lastUpdate > 60000) {
    performanceData.memory.usage = process.memoryUsage()
    performanceData.memory.lastUpdate = now
  }
  
  next()
}

// 获取性能统计
export const getPerformanceStats = () => {
  return {
    ...performanceData,
    uptime: process.uptime(),
    cpuUsage: process.cpuUsage(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }
}

// 重置性能统计
export const resetPerformanceStats = () => {
  performanceData.requests = {
    total: 0,
    byMethod: {},
    byRoute: {},
    byStatus: {}
  }
  performanceData.responseTimes = {
    min: Infinity,
    max: 0,
    avg: 0,
    total: 0
  }
  performanceData.errors = {
    total: 0,
    byType: {},
    byRoute: {}
  }
}

// 健康检查中间件
export const healthCheck = (req, res) => {
  const memoryUsage = process.memoryUsage()
  const uptime = process.uptime()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024) // MB
    },
    performance: {
      requestsPerMinute: performanceData.requests.total / (uptime / 60),
      avgResponseTime: Math.round(performanceData.responseTimes.avg),
      errorRate: performanceData.requests.total > 0 ? 
        (performanceData.errors.total / performanceData.requests.total) * 100 : 0
    }
  }
  
  // 检查健康状态
  if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    health.status = 'warning'
    health.warnings = ['High memory usage']
  }
  
  if (performanceData.responseTimes.avg > 1000) { // 1秒
    health.status = 'warning'
    health.warnings = [...(health.warnings || []), 'High response time']
  }
  
  if (health.performance.errorRate > 5) { // 5%
    health.status = 'critical'
    health.warnings = [...(health.warnings || []), 'High error rate']
  }
  
  res.json(health)
}

// 定期清理统计数据
setInterval(() => {
  // 清理过期的路由统计（保留最近1000个请求的数据）
  const maxRoutes = 1000
  const routes = Object.keys(performanceData.requests.byRoute)
  if (routes.length > maxRoutes) {
    const sortedRoutes = routes.sort((a, b) => 
      performanceData.requests.byRoute[b] - performanceData.requests.byRoute[a]
    )
    sortedRoutes.slice(maxRoutes).forEach(route => {
      delete performanceData.requests.byRoute[route]
    })
  }
}, 300000) // 每5分钟清理一次

export default {
  performanceMonitor,
  memoryMonitor,
  getPerformanceStats,
  resetPerformanceStats,
  healthCheck
} 