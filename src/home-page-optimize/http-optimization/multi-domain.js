/**
 * HTTP1.1 多域名优化方案
 * 解决队头阻塞问题
 */

// 配置多个域名来突破浏览器对同一域名的连接限制
const DOMAIN_CONFIG = {
  // 静态资源域名
  static: [
    'https://static1.example.com',
    'https://static2.example.com',
    'https://static3.example.com'
  ],
  // API请求域名
  api: [
    'https://api1.example.com',
    'https://api2.example.com',
    'https://api3.example.com'
  ],
  // 图片资源域名
  image: [
    'https://img1.example.com',
    'https://img2.example.com',
    'https://img3.example.com'
  ]
};

/**
 * 域名负载均衡器
 * 根据资源类型和负载情况选择最优域名
 */
class DomainBalancer {
  constructor() {
    this.counters = {
      static: 0,
      api: 0,
      image: 0
    };
  }

  /**
   * 获取下一个可用域名
   * @param {string} type - 资源类型 (static/api/image)
   * @returns {string} 域名
   */
  getNextDomain(type) {
    const domains = DOMAIN_CONFIG[type];
    if (!domains) {
      throw new Error(`Unknown domain type: ${type}`);
    }

    const index = this.counters[type] % domains.length;
    this.counters[type]++;
    
    return domains[index];
  }

  /**
   * 重置计数器
   */
  reset() {
    Object.keys(this.counters).forEach(key => {
      this.counters[key] = 0;
    });
  }
}

// 创建全局域名负载均衡器实例
const domainBalancer = new DomainBalancer();

/**
 * 资源加载器
 * 自动选择最优域名进行资源加载
 */
class ResourceLoader {
  /**
   * 加载静态资源
   * @param {string} path - 资源路径
   * @returns {Promise} 加载结果
   */
  static async loadStatic(path) {
    const domain = domainBalancer.getNextDomain('static');
    const url = `${domain}${path}`;
    
    console.log(`Loading static resource from: ${url}`);
    return this.loadResource(url);
  }

  /**
   * 发送API请求
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  static async requestAPI(endpoint, options = {}) {
    const domain = domainBalancer.getNextDomain('api');
    const url = `${domain}${endpoint}`;
    
    console.log(`Sending API request to: ${url}`);
    return this.makeRequest(url, options);
  }

  /**
   * 加载图片资源
   * @param {string} path - 图片路径
   * @returns {Promise} 加载结果
   */
  static async loadImage(path) {
    const domain = domainBalancer.getNextDomain('image');
    const url = `${domain}${path}`;
    
    console.log(`Loading image from: ${url}`);
    return this.loadResource(url);
  }

  /**
   * 通用资源加载方法
   * @param {string} url - 完整URL
   * @returns {Promise} 加载结果
   */
  static async loadResource(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Failed to load resource: ${url}`, error);
      throw error;
    }
  }

  /**
   * 通用请求方法
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  static async makeRequest(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, finalOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to make request: ${url}`, error);
      throw error;
    }
  }
}

/**
 * 并发请求管理器
 * 控制并发请求数量，避免过多连接
 */
class ConcurrentRequestManager {
  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent;
    this.activeRequests = 0;
    this.queue = [];
  }

  /**
   * 执行请求
   * @param {Function} requestFn - 请求函数
   * @returns {Promise} 请求结果
   */
  async execute(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  /**
   * 处理请求队列
   */
  async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { requestFn, resolve, reject } = this.queue.shift();
    this.activeRequests++;

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }
}

// 创建全局并发请求管理器
const requestManager = new ConcurrentRequestManager();

/**
 * 使用示例
 */
async function example() {
  try {
    // 并发加载多个静态资源
    const staticPromises = [
      ResourceLoader.loadStatic('/js/app.js'),
      ResourceLoader.loadStatic('/css/main.css'),
      ResourceLoader.loadStatic('/js/vendor.js'),
      ResourceLoader.loadStatic('/css/components.css')
    ];

    // 并发发送API请求
    const apiPromises = [
      ResourceLoader.requestAPI('/api/user/profile'),
      ResourceLoader.requestAPI('/api/dashboard/data'),
      ResourceLoader.requestAPI('/api/notifications')
    ];

    // 并发加载图片
    const imagePromises = [
      ResourceLoader.loadImage('/images/logo.png'),
      ResourceLoader.loadImage('/images/banner.jpg'),
      ResourceLoader.loadImage('/images/avatar.jpg')
    ];

    // 等待所有资源加载完成
    const [staticResults, apiResults, imageResults] = await Promise.all([
      Promise.all(staticPromises),
      Promise.all(apiPromises),
      Promise.all(imagePromises)
    ]);

    console.log('All resources loaded successfully');
    console.log('Static resources:', staticResults.length);
    console.log('API results:', apiResults.length);
    console.log('Images:', imageResults.length);

  } catch (error) {
    console.error('Failed to load resources:', error);
  }
}

// 导出模块
export {
  DomainBalancer,
  ResourceLoader,
  ConcurrentRequestManager,
  requestManager,
  example
};
