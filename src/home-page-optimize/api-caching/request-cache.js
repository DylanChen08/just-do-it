/**
 * API请求缓存系统
 * 实现短时缓存，减少重复的API请求
 */

/**
 * 缓存条目
 */
class CacheEntry {
  constructor(key, value, ttl = 5000) {
    this.key = key;
    this.value = value;
    this.createdAt = Date.now();
    this.ttl = ttl; // 生存时间（毫秒）
    this.accessCount = 0;
    this.lastAccessed = Date.now();
  }

  /**
   * 检查缓存是否过期
   * @returns {boolean} 是否过期
   */
  isExpired() {
    return Date.now() - this.createdAt > this.ttl;
  }

  /**
   * 访问缓存条目
   * @returns {any} 缓存值
   */
  access() {
    this.accessCount++;
    this.lastAccessed = Date.now();
    return this.value;
  }

  /**
   * 获取缓存信息
   * @returns {Object} 缓存信息
   */
  getInfo() {
    return {
      key: this.key,
      createdAt: this.createdAt,
      ttl: this.ttl,
      accessCount: this.accessCount,
      lastAccessed: this.lastAccessed,
      isExpired: this.isExpired()
    };
  }
}

/**
 * 缓存策略
 */
class CacheStrategy {
  constructor() {
    this.strategies = {
      // 基于时间的策略
      timeBased: (entry) => !entry.isExpired(),
      
      // 基于访问频率的策略
      frequencyBased: (entry, maxAccess = 10) => entry.accessCount < maxAccess,
      
      // 基于最近访问的策略
      lru: (entry, maxAge = 30000) => Date.now() - entry.lastAccessed < maxAge,
      
      // 组合策略
      combined: (entry) => {
        return !entry.isExpired() && 
               entry.accessCount < 10 && 
               (Date.now() - entry.lastAccessed) < 30000;
      }
    };
  }

  /**
   * 检查缓存是否有效
   * @param {CacheEntry} entry - 缓存条目
   * @param {string} strategy - 策略名称
   * @param {Object} options - 策略选项
   * @returns {boolean} 是否有效
   */
  isValid(entry, strategy = 'timeBased', options = {}) {
    const strategyFn = this.strategies[strategy];
    if (!strategyFn) {
      throw new Error(`Unknown cache strategy: ${strategy}`);
    }
    
    return strategyFn(entry, options);
  }
}

/**
 * 请求缓存管理器
 */
class RequestCacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.defaultTtl || 5000;
    this.strategy = new CacheStrategy();
    this.cacheStrategy = options.strategy || 'timeBased';
    this.cleanupInterval = options.cleanupInterval || 10000;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    this.startCleanupTimer();
  }

  /**
   * 生成缓存键
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {string} 缓存键
   */
  generateCacheKey(url, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    
    // 只缓存GET请求，或者包含特定头部的请求
    if (method !== 'GET' && !this.shouldCacheRequest(options)) {
      return null;
    }
    
    const keyData = {
      url,
      method,
      body: body ? JSON.stringify(body) : null,
      headers: this.filterCacheableHeaders(headers)
    };
    
    return this.hashObject(keyData);
  }

  /**
   * 判断是否应该缓存请求
   * @param {Object} options - 请求选项
   * @returns {boolean} 是否应该缓存
   */
  shouldCacheRequest(options) {
    const { method, headers = {} } = options;
    
    // 只缓存GET请求
    if (method === 'GET') {
      return true;
    }
    
    // 检查是否有缓存标识头
    if (headers['x-cacheable'] === 'true') {
      return true;
    }
    
    return false;
  }

  /**
   * 过滤可缓存的头部
   * @param {Object} headers - 原始头部
   * @returns {Object} 过滤后的头部
   */
  filterCacheableHeaders(headers) {
    const cacheableHeaders = {};
    const cacheableHeaderNames = [
      'authorization',
      'x-custom-app',
      'x-custom-version',
      'x-custom-token',
      'x-custom-userid',
      'x-custom-tenant'
    ];
    
    for (const [name, value] of Object.entries(headers)) {
      if (cacheableHeaderNames.includes(name.toLowerCase())) {
        cacheableHeaders[name] = value;
      }
    }
    
    return cacheableHeaders;
  }

  /**
   * 哈希对象
   * @param {Object} obj - 要哈希的对象
   * @returns {string} 哈希值
   */
  hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return this.simpleHash(str);
  }

  /**
   * 简单哈希函数
   * @param {string} str - 要哈希的字符串
   * @returns {string} 哈希值
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36);
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any} 缓存值
   */
  get(key) {
    this.stats.totalRequests++;
    
    if (!key) {
      this.stats.misses++;
      return null;
    }
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (!this.strategy.isValid(entry, this.cacheStrategy)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.access();
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 生存时间
   * @returns {boolean} 是否设置成功
   */
  set(key, value, ttl = this.defaultTtl) {
    if (!key) {
      return false;
    }
    
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    const entry = new CacheEntry(key, value, ttl);
    this.cache.set(key, entry);
    
    return true;
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {boolean} 是否删除成功
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }

  /**
   * 驱逐最少使用的缓存条目
   */
  evictLeastUsed() {
    let leastUsedKey = null;
    let leastUsedCount = Infinity;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.accessCount < leastUsedCount || 
          (entry.accessCount === leastUsedCount && entry.lastAccessed < oldestTime)) {
        leastUsedKey = key;
        leastUsedCount = entry.accessCount;
        oldestTime = entry.lastAccessed;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.stats.evictions++;
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const expiredKeys = [];
    
    for (const [key, entry] of this.cache) {
      if (!this.strategy.isValid(entry, this.cacheStrategy)) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      maxSize: this.maxSize,
      strategy: this.cacheStrategy
    };
  }

  /**
   * 获取缓存详情
   * @returns {Array} 缓存详情列表
   */
  getCacheDetails() {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      ...entry.getInfo()
    }));
  }
}

/**
 * 带缓存的HTTP客户端
 */
class CachedHTTPClient {
  constructor(options = {}) {
    this.cacheManager = new RequestCacheManager(options);
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 执行请求拦截器
   * @param {Object} config - 请求配置
   * @returns {Object} 处理后的配置
   */
  async executeRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    
    return processedConfig;
  }

  /**
   * 执行响应拦截器
   * @param {Response} response - 响应对象
   * @returns {Response} 处理后的响应
   */
  async executeResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  /**
   * 发送请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  async request(url, options = {}) {
    // 执行请求拦截器
    const config = await this.executeRequestInterceptors({
      url,
      ...options
    });
    
    // 生成缓存键
    const cacheKey = this.cacheManager.generateCacheKey(config.url, config);
    
    // 尝试从缓存获取
    if (cacheKey) {
      const cachedResponse = this.cacheManager.get(cacheKey);
      if (cachedResponse) {
        console.log(`Cache hit for ${config.url}`);
        return cachedResponse;
      }
    }
    
    console.log(`Cache miss for ${config.url}, making request...`);
    
    try {
      // 发送实际请求
      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 解析响应
      const data = await response.json();
      
      // 执行响应拦截器
      const processedResponse = await this.executeResponseInterceptors({
        ...response,
        data
      });
      
      // 缓存响应
      if (cacheKey && this.shouldCacheResponse(processedResponse)) {
        this.cacheManager.set(cacheKey, processedResponse, config.ttl);
      }
      
      return processedResponse;
      
    } catch (error) {
      console.error(`Request failed for ${config.url}:`, error);
      throw error;
    }
  }

  /**
   * 判断是否应该缓存响应
   * @param {Object} response - 响应对象
   * @returns {boolean} 是否应该缓存
   */
  shouldCacheResponse(response) {
    // 只缓存成功的响应
    if (response.status < 200 || response.status >= 300) {
      return false;
    }
    
    // 检查响应头中的缓存控制
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl && cacheControl.includes('no-cache')) {
      return false;
    }
    
    return true;
  }

  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} headers - 请求头部
   * @param {number} ttl - 缓存时间
   * @returns {Promise} 请求结果
   */
  async get(url, headers = {}, ttl = 5000) {
    return this.request(url, {
      method: 'GET',
      headers,
      ttl
    });
  }

  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} headers - 请求头部
   * @returns {Promise} 请求结果
   */
  async post(url, data, headers = {}) {
    return this.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    });
  }

  /**
   * 获取缓存统计
   * @returns {Object} 统计信息
   */
  getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cacheManager.clear();
  }
}

/**
 * 使用示例
 */
async function example() {
  const client = new CachedHTTPClient({
    maxSize: 50,
    defaultTtl: 5000,
    strategy: 'timeBased'
  });
  
  // 添加请求拦截器
  client.addRequestInterceptor((config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  });
  
  // 添加响应拦截器
  client.addResponseInterceptor((response) => {
    console.log(`Received response with status: ${response.status}`);
    return response;
  });
  
  try {
    // 第一次请求（缓存未命中）
    const response1 = await client.get('/api/user/profile', {
      'Authorization': 'Bearer token123'
    });
    console.log('First request:', response1);
    
    // 第二次请求（缓存命中）
    const response2 = await client.get('/api/user/profile', {
      'Authorization': 'Bearer token123'
    });
    console.log('Second request (cached):', response2);
    
    // 获取缓存统计
    const stats = client.getCacheStats();
    console.log('Cache stats:', stats);
    
  } catch (error) {
    console.error('Request failed:', error);
  }
  
  return client;
}

// 导出模块
export {
  RequestCacheManager,
  CachedHTTPClient,
  CacheEntry,
  CacheStrategy,
  example
};
