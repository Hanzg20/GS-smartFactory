import NodeCache from 'node-cache'

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: 300, // 默认5分钟缓存
  checkperiod: 60, // 每分钟检查过期缓存
  useClones: false // 不使用克隆以提高性能
})

// 缓存中间件
export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next()
    }

    // 生成缓存键
    const key = `cache:${req.originalUrl || req.url}`
    
    // 尝试从缓存获取数据
    const cachedResponse = cache.get(key)
    if (cachedResponse) {
      return res.json(cachedResponse)
    }

    // 重写res.json方法以缓存响应
    const originalJson = res.json
    res.json = function(data) {
      // 只缓存成功的响应
      if (res.statusCode === 200) {
        cache.set(key, data, duration)
      }
      return originalJson.call(this, data)
    }

    next()
  }
}

// 清除缓存中间件
export const clearCache = (pattern = '*') => {
  return (req, res, next) => {
    if (pattern === '*') {
      cache.flushAll()
    } else {
      const keys = cache.keys()
      const matchingKeys = keys.filter(key => key.includes(pattern))
      cache.del(matchingKeys)
    }
    next()
  }
}

// 获取缓存统计
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) * 100
  }
}

// 预热缓存
export const warmupCache = async (routes) => {
  for (const route of routes) {
    try {
      // 这里可以实现缓存预热逻辑
      console.log(`预热缓存: ${route}`)
    } catch (error) {
      console.error(`缓存预热失败: ${route}`, error)
    }
  }
}

export default cache 