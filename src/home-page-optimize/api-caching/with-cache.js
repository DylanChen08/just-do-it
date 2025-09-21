/**
 * withCache 函数实现
 * 为现有函数添加缓存功能的装饰器
 */

/**
 * 参数比较器
 * 用于比较函数参数是否相同
 */
class ArgumentComparator {
  /**
   * 比较两个参数数组是否相同
   * @param {Array} args1 - 参数数组1
   * @param {Array} args2 - 参数数组2
   * @returns {boolean} 是否相同
   */
  static isSameArgs(args1, args2) {
    if (args1.length !== args2.length) {
      return false;
    }
    
    for (let i = 0; i < args1.length; i++) {
      if (!this.deepEqual(args1[i], args2[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 深度比较两个值是否相等
   * @param {any} a - 值1
   * @param {any} b - 值2
   * @returns {boolean} 是否相等
   */
  static deepEqual(a, b) {
    if (a === b) {
      return true;
    }
    
    if (a == null || b == null) {
      return false;
    }
    
    if (typeof a !== typeof b) {
      return false;
    }
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
      }
      
      if (Array.isArray(a)) {
        return this.arraysEqual(a, b);
      }
      
      return this.objectsEqual(a, b);
    }
    
    return false;
  }
  
  /**
   * 比较两个数组是否相等
   * @param {Array} a - 数组1
   * @param {Array} b - 数组2
   * @returns {boolean} 是否相等
   */
  static arraysEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    for (let i = 0; i < a.length; i++) {
      if (!this.deepEqual(a[i], b[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 比较两个对象是否相等
   * @param {Object} a - 对象1
   * @param {Object} b - 对象2
   * @returns {boolean} 是否相等
   */
  static objectsEqual(a, b) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    for (const key of keysA) {
      if (!keysB.includes(key)) {
        return false;
      }
      
      if (!this.deepEqual(a[key], b[key])) {
        return false;
      }
    }
    
    return true;
  }
}

/**
 * 缓存条目
 */
class CacheItem {
  constructor(args, value, timestamp) {
    this.args = args;
    this.value = value;
    this.timestamp = timestamp;
    this.accessCount = 0;
  }
  
  /**
   * 访问缓存条目
   * @returns {any} 缓存值
   */
  access() {
    this.accessCount++;
    return this.value;
  }
  
  /**
   * 检查是否过期
   * @param {number} maxAge - 最大年龄（毫秒）
   * @returns {boolean} 是否过期
   */
  isExpired(maxAge) {
    return Date.now() - this.timestamp > maxAge;
  }
}

/**
 * 函数缓存管理器
 */
class FunctionCacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultMaxAge = options.defaultMaxAge || 5000;
    this.cleanupInterval = options.cleanupInterval || 10000;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalCalls: 0
    };
    
    this.startCleanupTimer();
  }
  
  /**
   * 获取缓存
   * @param {Function} fn - 函数
   * @param {Array} args - 参数
   * @param {number} maxAge - 最大年龄
   * @returns {any} 缓存值或null
   */
  get(fn, args, maxAge = this.defaultMaxAge) {
    this.stats.totalCalls++;
    
    const fnKey = this.getFunctionKey(fn);
    const caches = this.cache.get(fnKey);
    
    if (!caches) {
      this.stats.misses++;
      return null;
    }
    
    const cache = caches.find(c => ArgumentComparator.isSameArgs(args, c.args));
    if (!cache) {
      this.stats.misses++;
      return null;
    }
    
    if (cache.isExpired(maxAge)) {
      this.removeCache(fnKey, cache);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return cache.access();
  }
  
  /**
   * 设置缓存
   * @param {Function} fn - 函数
   * @param {Array} args - 参数
   * @param {any} value - 值
   * @returns {void}
   */
  set(fn, args, value) {
    const fnKey = this.getFunctionKey(fn);
    
    if (!this.cache.has(fnKey)) {
      this.cache.set(fnKey, []);
    }
    
    const caches = this.cache.get(fnKey);
    
    // 检查是否已存在相同的参数
    const existingCache = caches.find(c => ArgumentComparator.isSameArgs(args, c.args));
    if (existingCache) {
      existingCache.value = value;
      existingCache.timestamp = Date.now();
      return;
    }
    
    // 检查缓存大小限制
    if (this.getTotalCacheSize() >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    const cacheItem = new CacheItem(args, value, Date.now());
    caches.push(cacheItem);
  }
  
  /**
   * 删除缓存
   * @param {string} fnKey - 函数键
   * @param {CacheItem} cache - 缓存条目
   * @returns {void}
   */
  removeCache(fnKey, cache) {
    const caches = this.cache.get(fnKey);
    if (caches) {
      const index = caches.indexOf(cache);
      if (index > -1) {
        caches.splice(index, 1);
      }
      
      if (caches.length === 0) {
        this.cache.delete(fnKey);
      }
    }
  }
  
  /**
   * 获取函数键
   * @param {Function} fn - 函数
   * @returns {string} 函数键
   */
  getFunctionKey(fn) {
    return fn.name || fn.toString().slice(0, 50);
  }
  
  /**
   * 获取总缓存大小
   * @returns {number} 总大小
   */
  getTotalCacheSize() {
    let total = 0;
    for (const caches of this.cache.values()) {
      total += caches.length;
    }
    return total;
  }
  
  /**
   * 驱逐最少使用的缓存
   * @returns {void}
   */
  evictLeastUsed() {
    let leastUsedFn = null;
    let leastUsedCache = null;
    let leastUsedCount = Infinity;
    
    for (const [fnKey, caches] of this.cache) {
      for (const cache of caches) {
        if (cache.accessCount < leastUsedCount) {
          leastUsedFn = fnKey;
          leastUsedCache = cache;
          leastUsedCount = cache.accessCount;
        }
      }
    }
    
    if (leastUsedFn && leastUsedCache) {
      this.removeCache(leastUsedFn, leastUsedCache);
      this.stats.evictions++;
    }
  }
  
  /**
   * 清理过期缓存
   * @returns {void}
   */
  cleanup() {
    const expiredItems = [];
    
    for (const [fnKey, caches] of this.cache) {
      for (const cache of caches) {
        if (cache.isExpired(this.defaultMaxAge)) {
          expiredItems.push({ fnKey, cache });
        }
      }
    }
    
    for (const { fnKey, cache } of expiredItems) {
      this.removeCache(fnKey, cache);
    }
    
    if (expiredItems.length > 0) {
      console.log(`Cleaned up ${expiredItems.length} expired cache items`);
    }
  }
  
  /**
   * 启动清理定时器
   * @returns {void}
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }
  
  /**
   * 清空所有缓存
   * @returns {void}
   */
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalCalls: 0
    };
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const hitRate = this.stats.totalCalls > 0 ? 
      (this.stats.hits / this.stats.totalCalls * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.getTotalCacheSize(),
      maxSize: this.maxSize
    };
  }
}

/**
 * 全局缓存管理器实例
 */
const globalCacheManager = new FunctionCacheManager();

/**
 * withCache 装饰器函数
 * 为函数添加缓存功能
 * @param {Function} fn - 要缓存的函数
 * @param {Object} options - 缓存选项
 * @returns {Function} 带缓存的函数
 */
function withCache(fn, options = {}) {
  const {
    maxAge = 5000,
    cacheManager = globalCacheManager,
    keyGenerator = null,
    shouldCache = null
  } = options;
  
  return async function(...args) {
    // 检查是否应该缓存
    if (shouldCache && !shouldCache(...args)) {
      return await fn.apply(this, args);
    }
    
    // 生成缓存键
    const cacheKey = keyGenerator ? keyGenerator(...args) : args;
    
    // 尝试从缓存获取
    const cachedResult = cacheManager.get(fn, cacheKey, maxAge);
    if (cachedResult !== null) {
      console.log(`Cache hit for ${fn.name || 'anonymous function'}`);
      return cachedResult;
    }
    
    console.log(`Cache miss for ${fn.name || 'anonymous function'}, executing...`);
    
    try {
      // 执行原函数
      const result = await fn.apply(this, args);
      
      // 缓存结果
      cacheManager.set(fn, cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Function execution failed:`, error);
      throw error;
    }
  };
}

/**
 * 创建带缓存的函数
 * @param {Function} fn - 原函数
 * @param {Object} options - 缓存选项
 * @returns {Function} 带缓存的函数
 */
function createCachedFunction(fn, options = {}) {
  return withCache(fn, options);
}

/**
 * 批量创建带缓存的函数
 * @param {Object} functions - 函数对象
 * @param {Object} options - 缓存选项
 * @returns {Object} 带缓存的函数对象
 */
function createCachedFunctions(functions, options = {}) {
  const cachedFunctions = {};
  
  for (const [name, fn] of Object.entries(functions)) {
    if (typeof fn === 'function') {
      cachedFunctions[name] = withCache(fn, options);
    } else {
      cachedFunctions[name] = fn;
    }
  }
  
  return cachedFunctions;
}

/**
 * 缓存配置预设
 */
const CachePresets = {
  // 短时缓存（5秒）
  short: { maxAge: 5000 },
  
  // 中等缓存（30秒）
  medium: { maxAge: 30000 },
  
  // 长时缓存（5分钟）
  long: { maxAge: 300000 },
  
  // 只缓存成功的响应
  successOnly: {
    shouldCache: (result) => {
      if (result && typeof result === 'object') {
        return result.success !== false && result.error === undefined;
      }
      return true;
    }
  },
  
  // 基于参数的缓存策略
  parameterBased: {
    keyGenerator: (...args) => {
      // 只使用前两个参数作为缓存键
      return args.slice(0, 2);
    }
  }
};

/**
 * 使用示例
 */
async function example() {
  // 模拟API调用函数
  async function getSelectSource(source) {
    console.log(`Fetching data for source: ${source}`);
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      source,
      data: `Data for ${source}`,
      timestamp: Date.now()
    };
  }
  
  async function getUserProfile(userId) {
    console.log(`Fetching user profile for: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    };
  }
  
  // 创建带缓存的函数
  const cachedGetSelectSource = withCache(getSelectSource, CachePresets.short);
  const cachedGetUserProfile = withCache(getUserProfile, CachePresets.medium);
  
  try {
    // 第一次调用（缓存未命中）
    console.log('=== First calls (cache miss) ===');
    const result1 = await cachedGetSelectSource('department');
    console.log('Result 1:', result1);
    
    const result2 = await cachedGetUserProfile('123');
    console.log('Result 2:', result2);
    
    // 第二次调用（缓存命中）
    console.log('\n=== Second calls (cache hit) ===');
    const result3 = await cachedGetSelectSource('department');
    console.log('Result 3:', result3);
    
    const result4 = await cachedGetUserProfile('123');
    console.log('Result 4:', result4);
    
    // 获取缓存统计
    const stats = globalCacheManager.getStats();
    console.log('\n=== Cache Stats ===');
    console.log('Stats:', stats);
    
  } catch (error) {
    console.error('Example failed:', error);
  }
  
  return {
    cachedGetSelectSource,
    cachedGetUserProfile,
    cacheManager: globalCacheManager
  };
}

// 导出模块
export {
  withCache,
  createCachedFunction,
  createCachedFunctions,
  FunctionCacheManager,
  ArgumentComparator,
  CachePresets,
  globalCacheManager,
  example
};
