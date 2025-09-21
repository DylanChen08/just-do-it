/**
 * 视口管理器
 * 管理页面组件的视口状态和加载策略
 */

/**
 * 视口区域定义
 */
class ViewportZone {
  constructor(name, top, bottom, priority = 'normal') {
    this.name = name;
    this.top = top; // 距离顶部的百分比
    this.bottom = bottom; // 距离底部的百分比
    this.priority = priority; // high, normal, low
    this.components = new Set();
  }

  /**
   * 检查元素是否在此视口区域内
   * @param {HTMLElement} element - 要检查的元素
   * @returns {boolean} 是否在区域内
   */
  isElementInZone(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    
    const zoneTop = (this.top / 100) * viewportHeight;
    const zoneBottom = viewportHeight - ((this.bottom / 100) * viewportHeight);
    
    return elementTop >= zoneTop && elementBottom <= zoneBottom;
  }
}

/**
 * 组件视口映射
 */
class ComponentViewportMap {
  constructor() {
    this.componentZones = new Map(); // componentName -> zoneName
    this.zoneComponents = new Map(); // zoneName -> Set<componentName>
    this.elementComponents = new Map(); // element -> componentName
  }

  /**
   * 注册组件到视口区域
   * @param {string} componentName - 组件名称
   * @param {string} zoneName - 视口区域名称
   * @param {HTMLElement} element - 组件元素
   */
  registerComponent(componentName, zoneName, element) {
    this.componentZones.set(componentName, zoneName);
    
    if (!this.zoneComponents.has(zoneName)) {
      this.zoneComponents.set(zoneName, new Set());
    }
    this.zoneComponents.get(zoneName).add(componentName);
    
    if (element) {
      this.elementComponents.set(element, componentName);
    }
  }

  /**
   * 获取组件所在的视口区域
   * @param {string} componentName - 组件名称
   * @returns {string} 视口区域名称
   */
  getComponentZone(componentName) {
    return this.componentZones.get(componentName);
  }

  /**
   * 获取视口区域内的所有组件
   * @param {string} zoneName - 视口区域名称
   * @returns {Set} 组件名称集合
   */
  getZoneComponents(zoneName) {
    return this.zoneComponents.get(zoneName) || new Set();
  }

  /**
   * 根据元素获取组件名称
   * @param {HTMLElement} element - 元素
   * @returns {string} 组件名称
   */
  getComponentByElement(element) {
    return this.elementComponents.get(element);
  }
}

/**
 * 视口管理器
 */
class ViewportManager {
  constructor() {
    this.zones = new Map();
    this.componentMap = new ComponentViewportMap();
    this.intersectionObserver = null;
    this.scrollHandler = null;
    this.resizeHandler = null;
    this.currentViewport = 'above-fold';
    this.viewportHistory = [];
    this.loadingStrategies = new Map();
    
    this.init();
  }

  /**
   * 初始化视口管理器
   */
  init() {
    this.createDefaultZones();
    this.initIntersectionObserver();
    this.bindEvents();
  }

  /**
   * 创建默认视口区域
   */
  createDefaultZones() {
    // 首屏区域（0-100%）
    this.addZone('above-fold', 0, 0, 'high');
    
    // 首屏下方区域（100-200%）
    this.addZone('below-fold', 100, 0, 'normal');
    
    // 页面底部区域（最后20%）
    this.addZone('footer', 80, 0, 'low');
  }

  /**
   * 添加视口区域
   * @param {string} name - 区域名称
   * @param {number} top - 顶部百分比
   * @param {number} bottom - 底部百分比
   * @param {string} priority - 优先级
   */
  addZone(name, top, bottom, priority = 'normal') {
    const zone = new ViewportZone(name, top, bottom, priority);
    this.zones.set(name, zone);
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
          rootMargin: '100px 0px', // 提前100px触发
          threshold: [0, 0.1, 0.5, 1.0]
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
      const componentName = this.componentMap.getComponentByElement(element);
      
      if (componentName) {
        this.updateComponentViewportStatus(componentName, entry);
      }
    }
  }

  /**
   * 更新组件视口状态
   * @param {string} componentName - 组件名称
   * @param {IntersectionObserverEntry} entry - 交叉观察条目
   */
  updateComponentViewportStatus(componentName, entry) {
    const zoneName = this.componentMap.getComponentZone(componentName);
    const zone = this.zones.get(zoneName);
    
    if (zone) {
      const isInViewport = entry.isIntersecting;
      const visibilityRatio = entry.intersectionRatio;
      
      this.notifyViewportChange(componentName, {
        isInViewport,
        visibilityRatio,
        zone: zoneName,
        priority: zone.priority
      });
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 滚动事件
    this.scrollHandler = this.throttle(() => {
      this.updateCurrentViewport();
    }, 100);
    
    window.addEventListener('scroll', this.scrollHandler);
    
    // 窗口大小变化事件
    this.resizeHandler = this.throttle(() => {
      this.handleResize();
    }, 200);
    
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * 更新当前视口
   */
  updateCurrentViewport() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    let newViewport = 'above-fold';
    
    if (scrollPercentage > 100) {
      newViewport = 'below-fold';
    } else if (scrollPercentage > 80) {
      newViewport = 'footer';
    }
    
    if (newViewport !== this.currentViewport) {
      this.currentViewport = newViewport;
      this.viewportHistory.push({
        viewport: newViewport,
        timestamp: Date.now(),
        scrollPercentage
      });
      
      this.notifyViewportChange('global', {
        viewport: newViewport,
        scrollPercentage
      });
    }
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 重新计算所有组件的视口状态
    for (const [componentName, zoneName] of this.componentMap.componentZones) {
      const zone = this.zones.get(zoneName);
      if (zone) {
        // 触发重新检查
        this.checkComponentInViewport(componentName);
      }
    }
  }

  /**
   * 检查组件是否在视口内
   * @param {string} componentName - 组件名称
   * @returns {boolean} 是否在视口内
   */
  checkComponentInViewport(componentName) {
    const zoneName = this.componentMap.getComponentZone(componentName);
    const zone = this.zones.get(zoneName);
    
    if (!zone) return false;
    
    // 查找组件对应的元素
    for (const [element, name] of this.componentMap.elementComponents) {
      if (name === componentName) {
        return zone.isElementInZone(element);
      }
    }
    
    return false;
  }

  /**
   * 注册组件到视口
   * @param {string} componentName - 组件名称
   * @param {string} zoneName - 视口区域名称
   * @param {HTMLElement} element - 组件元素
   */
  registerComponent(componentName, zoneName, element) {
    this.componentMap.registerComponent(componentName, zoneName, element);
    
    if (this.intersectionObserver && element) {
      this.intersectionObserver.observe(element);
    }
  }

  /**
   * 设置组件加载策略
   * @param {string} componentName - 组件名称
   * @param {Object} strategy - 加载策略
   */
  setLoadingStrategy(componentName, strategy) {
    this.loadingStrategies.set(componentName, strategy);
  }

  /**
   * 获取组件加载策略
   * @param {string} componentName - 组件名称
   * @returns {Object} 加载策略
   */
  getLoadingStrategy(componentName) {
    return this.loadingStrategies.get(componentName) || {
      preload: false,
      lazy: true,
      priority: 'normal'
    };
  }

  /**
   * 获取视口内的组件列表
   * @returns {Array} 组件名称列表
   */
  getViewportComponents() {
    const viewportComponents = [];
    
    for (const [componentName, zoneName] of this.componentMap.componentZones) {
      if (this.checkComponentInViewport(componentName)) {
        const zone = this.zones.get(zoneName);
        viewportComponents.push({
          name: componentName,
          zone: zoneName,
          priority: zone.priority
        });
      }
    }
    
    return viewportComponents.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 获取非视口内的组件列表
   * @returns {Array} 组件名称列表
   */
  getNonViewportComponents() {
    const nonViewportComponents = [];
    
    for (const [componentName, zoneName] of this.componentMap.componentZones) {
      if (!this.checkComponentInViewport(componentName)) {
        const zone = this.zones.get(zoneName);
        nonViewportComponents.push({
          name: componentName,
          zone: zoneName,
          priority: zone.priority
        });
      }
    }
    
    return nonViewportComponents;
  }

  /**
   * 通知视口变化
   * @param {string} componentName - 组件名称
   * @param {Object} data - 变化数据
   */
  notifyViewportChange(componentName, data) {
    // 触发自定义事件
    const event = new CustomEvent('viewportchange', {
      detail: {
        component: componentName,
        ...data
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} delay - 延迟时间
   * @returns {Function} 节流后的函数
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * 获取视口统计信息
   * @returns {Object} 统计信息
   */
  getViewportStats() {
    const viewportComponents = this.getViewportComponents();
    const nonViewportComponents = this.getNonViewportComponents();
    
    return {
      currentViewport: this.currentViewport,
      viewportComponents: viewportComponents.length,
      nonViewportComponents: nonViewportComponents.length,
      totalComponents: viewportComponents.length + nonViewportComponents.length,
      viewportHistory: this.viewportHistory.slice(-10), // 最近10次变化
      zones: Array.from(this.zones.keys())
    };
  }

  /**
   * 销毁视口管理器
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    this.zones.clear();
    this.componentMap = new ComponentViewportMap();
    this.loadingStrategies.clear();
  }
}

/**
 * 使用示例
 */
function example() {
  const viewportManager = new ViewportManager();
  
  // 注册组件到视口区域
  const headerElement = document.querySelector('#header');
  const sidebarElement = document.querySelector('#sidebar');
  const mainElement = document.querySelector('#main');
  const footerElement = document.querySelector('#footer');
  
  if (headerElement) {
    viewportManager.registerComponent('header', 'above-fold', headerElement);
  }
  
  if (sidebarElement) {
    viewportManager.registerComponent('sidebar', 'above-fold', sidebarElement);
  }
  
  if (mainElement) {
    viewportManager.registerComponent('main-content', 'below-fold', mainElement);
  }
  
  if (footerElement) {
    viewportManager.registerComponent('footer', 'footer', footerElement);
  }
  
  // 设置加载策略
  viewportManager.setLoadingStrategy('header', {
    preload: true,
    lazy: false,
    priority: 'high'
  });
  
  viewportManager.setLoadingStrategy('footer', {
    preload: false,
    lazy: true,
    priority: 'low'
  });
  
  // 监听视口变化
  window.addEventListener('viewportchange', (event) => {
    const { component, isInViewport, zone, priority } = event.detail;
    console.log(`Component ${component} is now ${isInViewport ? 'in' : 'out of'} viewport (zone: ${zone}, priority: ${priority})`);
  });
  
  // 获取视口统计
  const stats = viewportManager.getViewportStats();
  console.log('Viewport stats:', stats);
  
  return viewportManager;
}

// 导出模块
export {
  ViewportManager,
  ViewportZone,
  ComponentViewportMap,
  example
};
