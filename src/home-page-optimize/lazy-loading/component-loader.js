/**
 * 组件按需加载器
 * 实现视口内组件优先加载，视口外组件延迟加载
 */

/**
 * 组件配置接口
 */
class ComponentConfig {
  constructor(name, path, dependencies = [], viewport = true, priority = 'normal') {
    this.name = name;
    this.path = path;
    this.dependencies = dependencies;
    this.viewport = viewport; // 是否在视口内
    this.priority = priority; // high, normal, low
    this.loaded = false;
    this.loading = false;
    this.error = null;
  }
}

/**
 * 视口检测器
 */
class ViewportDetector {
  constructor() {
    this.observers = new Map();
    this.intersectionObserver = null;
    this.initIntersectionObserver();
  }

  /**
   * 初始化交叉观察器
   */
  initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          root: null,
          rootMargin: '50px', // 提前50px开始加载
          threshold: 0.1
        }
      );
    }
  }

  /**
   * 处理交叉观察
   * @param {Array} entries - 交叉观察条目
   */
  handleIntersection(entries) {
    for (const entry of entries) {
      const element = entry.target;
      const componentName = element.dataset.component;
      
      if (entry.isIntersecting && componentName) {
        this.notifyComponentVisible(componentName);
      }
    }
  }

  /**
   * 观察元素
   * @param {HTMLElement} element - 要观察的元素
   * @param {string} componentName - 组件名称
   */
  observe(element, componentName) {
    if (this.intersectionObserver) {
      element.dataset.component = componentName;
      this.intersectionObserver.observe(element);
    }
  }

  /**
   * 停止观察元素
   * @param {HTMLElement} element - 要停止观察的元素
   */
  unobserve(element) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  /**
   * 通知组件可见
   * @param {string} componentName - 组件名称
   */
  notifyComponentVisible(componentName) {
    const callbacks = this.observers.get(componentName);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * 注册组件可见回调
   * @param {string} componentName - 组件名称
   * @param {Function} callback - 回调函数
   */
  onComponentVisible(componentName, callback) {
    if (!this.observers.has(componentName)) {
      this.observers.set(componentName, []);
    }
    this.observers.get(componentName).push(callback);
  }

  /**
   * 检查元素是否在视口内
   * @param {HTMLElement} element - 要检查的元素
   * @returns {boolean} 是否在视口内
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

/**
 * 组件加载器
 */
class ComponentLoader {
  constructor() {
    this.components = new Map();
    this.loadingQueue = [];
    this.loadedComponents = new Set();
    this.viewportDetector = new ViewportDetector();
    this.maxConcurrentLoads = 3;
    this.currentLoads = 0;
    this.loadingStats = {
      total: 0,
      loaded: 0,
      failed: 0,
      skipped: 0
    };
  }

  /**
   * 注册组件
   * @param {ComponentConfig} config - 组件配置
   */
  registerComponent(config) {
    this.components.set(config.name, config);
    this.loadingStats.total++;
  }

  /**
   * 批量注册组件
   * @param {Array} configs - 组件配置数组
   */
  registerComponents(configs) {
    configs.forEach(config => this.registerComponent(config));
  }

  /**
   * 获取组件配置
   * @param {string} name - 组件名称
   * @returns {ComponentConfig} 组件配置
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * 加载组件
   * @param {string} name - 组件名称
   * @returns {Promise} 加载结果
   */
  async loadComponent(name) {
    const config = this.getComponent(name);
    if (!config) {
      throw new Error(`Component ${name} not found`);
    }

    if (config.loaded) {
      return config;
    }

    if (config.loading) {
      return this.waitForComponent(name);
    }

    return this.loadComponentInternal(config);
  }

  /**
   * 内部加载组件方法
   * @param {ComponentConfig} config - 组件配置
   * @returns {Promise} 加载结果
   */
  async loadComponentInternal(config) {
    config.loading = true;
    this.currentLoads++;

    try {
      // 加载依赖
      await this.loadDependencies(config.dependencies);

      // 加载组件代码
      const componentCode = await this.loadComponentCode(config.path);
      
      // 执行组件代码
      const component = this.executeComponentCode(componentCode, config.name);
      
      config.loaded = true;
      config.loading = false;
      this.loadedComponents.add(config.name);
      this.loadingStats.loaded++;

      console.log(`Component ${config.name} loaded successfully`);
      return component;

    } catch (error) {
      config.loading = false;
      config.error = error;
      this.loadingStats.failed++;
      console.error(`Failed to load component ${config.name}:`, error);
      throw error;
    } finally {
      this.currentLoads--;
      this.processLoadingQueue();
    }
  }

  /**
   * 加载依赖
   * @param {Array} dependencies - 依赖列表
   * @returns {Promise} 加载结果
   */
  async loadDependencies(dependencies) {
    const dependencyPromises = dependencies.map(dep => this.loadComponent(dep));
    await Promise.all(dependencyPromises);
  }

  /**
   * 加载组件代码
   * @param {string} path - 组件路径
   * @returns {Promise} 组件代码
   */
  async loadComponentCode(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to load component from ${path}: ${error.message}`);
    }
  }

  /**
   * 执行组件代码
   * @param {string} code - 组件代码
   * @param {string} name - 组件名称
   * @returns {Object} 组件对象
   */
  executeComponentCode(code, name) {
    try {
      // 创建安全的执行环境
      const moduleExports = {};
      const module = { exports: moduleExports };
      
      // 执行组件代码
      const func = new Function('module', 'exports', 'require', code);
      func(module, moduleExports, this.createRequireFunction());
      
      return module.exports;
    } catch (error) {
      throw new Error(`Failed to execute component ${name}: ${error.message}`);
    }
  }

  /**
   * 创建require函数
   * @returns {Function} require函数
   */
  createRequireFunction() {
    return (moduleName) => {
      const component = this.getComponent(moduleName);
      if (component && component.loaded) {
        return component;
      }
      throw new Error(`Module ${moduleName} not found or not loaded`);
    };
  }

  /**
   * 等待组件加载完成
   * @param {string} name - 组件名称
   * @returns {Promise} 组件
   */
  async waitForComponent(name) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const config = this.getComponent(name);
        if (config.loaded) {
          clearInterval(checkInterval);
          resolve(config);
        } else if (config.error) {
          clearInterval(checkInterval);
          reject(config.error);
        }
      }, 100);

      // 超时处理
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(`Timeout waiting for component ${name}`));
      }, 10000);
    });
  }

  /**
   * 处理加载队列
   */
  processLoadingQueue() {
    while (this.loadingQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      const { name, resolve, reject } = this.loadingQueue.shift();
      this.loadComponent(name).then(resolve).catch(reject);
    }
  }

  /**
   * 按优先级加载组件
   * @param {Array} componentNames - 组件名称列表
   * @returns {Promise} 加载结果
   */
  async loadComponentsByPriority(componentNames) {
    const components = componentNames
      .map(name => this.getComponent(name))
      .filter(config => config && !config.loaded)
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

    const loadPromises = components.map(config => this.loadComponent(config.name));
    return Promise.allSettled(loadPromises);
  }

  /**
   * 获取优先级数值
   * @param {string} priority - 优先级
   * @returns {number} 优先级数值
   */
  getPriorityValue(priority) {
    const priorityMap = {
      high: 3,
      normal: 2,
      low: 1
    };
    return priorityMap[priority] || 2;
  }

  /**
   * 智能加载策略
   * 根据视口位置和优先级智能加载组件
   */
  async smartLoad() {
    const viewportComponents = [];
    const nonViewportComponents = [];

    // 分类组件
    for (const [name, config] of this.components) {
      if (config.loaded) continue;

      if (config.viewport) {
        viewportComponents.push(config);
      } else {
        nonViewportComponents.push(config);
      }
    }

    // 优先加载视口内组件
    if (viewportComponents.length > 0) {
      console.log('Loading viewport components...');
      await this.loadComponentsByPriority(viewportComponents.map(c => c.name));
    }

    // 延迟加载视口外组件
    if (nonViewportComponents.length > 0) {
      console.log('Scheduling non-viewport components for lazy loading...');
      this.scheduleLazyLoad(nonViewportComponents);
    }
  }

  /**
   * 调度延迟加载
   * @param {Array} components - 组件列表
   */
  scheduleLazyLoad(components) {
    // 使用requestIdleCallback在浏览器空闲时加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadComponentsByPriority(components.map(c => c.name));
      });
    } else {
      // 降级方案：延迟加载
      setTimeout(() => {
        this.loadComponentsByPriority(components.map(c => c.name));
      }, 1000);
    }
  }

  /**
   * 预加载组件
   * @param {Array} componentNames - 组件名称列表
   * @returns {Promise} 预加载结果
   */
  async preloadComponents(componentNames) {
    const preloadPromises = componentNames.map(name => {
      const config = this.getComponent(name);
      if (config && !config.loaded) {
        return this.loadComponent(name);
      }
      return Promise.resolve();
    });

    return Promise.allSettled(preloadPromises);
  }

  /**
   * 获取加载统计
   * @returns {Object} 统计信息
   */
  getLoadingStats() {
    return {
      ...this.loadingStats,
      currentLoads: this.currentLoads,
      queueLength: this.loadingQueue.length,
      loadedComponents: Array.from(this.loadedComponents)
    };
  }

  /**
   * 重置加载器
   */
  reset() {
    this.components.clear();
    this.loadingQueue = [];
    this.loadedComponents.clear();
    this.currentLoads = 0;
    this.loadingStats = {
      total: 0,
      loaded: 0,
      failed: 0,
      skipped: 0
    };
  }
}

/**
 * 使用示例
 */
async function example() {
  const loader = new ComponentLoader();

  // 注册组件配置
  const componentConfigs = [
    new ComponentConfig('header', '/components/header.js', [], true, 'high'),
    new ComponentConfig('sidebar', '/components/sidebar.js', [], true, 'high'),
    new ComponentConfig('main-content', '/components/main-content.js', ['header'], true, 'high'),
    new ComponentConfig('footer', '/components/footer.js', [], false, 'low'),
    new ComponentConfig('modal', '/components/modal.js', [], false, 'low'),
    new ComponentConfig('chart', '/components/chart.js', ['main-content'], false, 'normal')
  ];

  loader.registerComponents(componentConfigs);

  try {
    // 智能加载
    await loader.smartLoad();

    // 获取加载统计
    const stats = loader.getLoadingStats();
    console.log('Loading stats:', stats);

    // 预加载特定组件
    await loader.preloadComponents(['modal', 'chart']);

    console.log('All components loaded successfully');

  } catch (error) {
    console.error('Failed to load components:', error);
  }

  return loader;
}

// 导出模块
export {
  ComponentLoader,
  ComponentConfig,
  ViewportDetector,
  example
};
