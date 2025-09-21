/**
 * HTTP头部压缩方案
 * 借鉴HTTP2的头部压缩方式，对自定义头部进行压缩处理
 */

/**
 * 静态头部表
 * 存储常用的头部字段和值
 */
const STATIC_HEADER_TABLE = new Map([
  // 常用头部字段
  ['authorization', 'auth'],
  ['content-type', 'ct'],
  ['user-agent', 'ua'],
  ['accept', 'acc'],
  ['accept-encoding', 'ae'],
  ['accept-language', 'al'],
  ['cache-control', 'cc'],
  ['content-length', 'cl'],
  ['content-encoding', 'ce'],
  ['content-language', 'clang'],
  ['content-disposition', 'cd'],
  ['content-range', 'cr'],
  ['content-security-policy', 'csp'],
  ['x-requested-with', 'xrw'],
  ['x-forwarded-for', 'xff'],
  ['x-real-ip', 'xri'],
  ['x-custom-app', 'xca'],
  ['x-custom-version', 'xcv'],
  ['x-custom-token', 'xct'],
  ['x-custom-userid', 'xcu'],
  ['x-custom-tenant', 'xctenant'],
  ['x-custom-role', 'xcr'],
  ['x-custom-permission', 'xcp'],
  ['x-custom-feature', 'xcf'],
  ['x-custom-config', 'xcconfig'],
  ['x-custom-debug', 'xcd'],
  ['x-custom-trace', 'xctrace'],
  ['x-custom-session', 'xcs'],
  ['x-custom-locale', 'xcl'],
  ['x-custom-timezone', 'xctz'],
  ['x-custom-theme', 'xctheme']
]);

/**
 * 动态头部表
 * 存储运行时动态添加的头部字段和值
 */
class DynamicHeaderTable {
  constructor(maxSize = 4096) {
    this.table = new Map();
    this.maxSize = maxSize;
    this.currentSize = 0;
  }

  /**
   * 添加头部到动态表
   * @param {string} name - 头部名称
   * @param {string} value - 头部值
   * @returns {number} 索引
   */
  add(name, value) {
    const entry = `${name}: ${value}`;
    const size = this.calculateSize(entry);
    
    // 如果表已满，删除最旧的条目
    while (this.currentSize + size > this.maxSize && this.table.size > 0) {
      const firstKey = this.table.keys().next().value;
      const removedEntry = this.table.get(firstKey);
      this.currentSize -= this.calculateSize(removedEntry);
      this.table.delete(firstKey);
    }

    const index = this.table.size + STATIC_HEADER_TABLE.size;
    this.table.set(index, entry);
    this.currentSize += size;
    
    return index;
  }

  /**
   * 获取头部值
   * @param {number} index - 索引
   * @returns {string} 头部值
   */
  get(index) {
    return this.table.get(index);
  }

  /**
   * 计算条目大小
   * @param {string} entry - 头部条目
   * @returns {number} 大小
   */
  calculateSize(entry) {
    return entry.length + 32; // 32字节的额外开销
  }

  /**
   * 清空动态表
   */
  clear() {
    this.table.clear();
    this.currentSize = 0;
  }
}

/**
 * 头部压缩器
 */
class HeaderCompressor {
  constructor() {
    this.dynamicTable = new DynamicHeaderTable();
    this.compressionStats = {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0
    };
  }

  /**
   * 压缩头部
   * @param {Object} headers - 原始头部对象
   * @returns {Object} 压缩后的头部对象
   */
  compress(headers) {
    const compressedHeaders = {};
    let originalSize = 0;
    let compressedSize = 0;

    for (const [name, value] of Object.entries(headers)) {
      const originalHeader = `${name}: ${value}`;
      originalSize += originalHeader.length;

      // 检查静态表
      const staticIndex = this.findInStaticTable(name, value);
      if (staticIndex !== -1) {
        compressedHeaders[`h${staticIndex}`] = '';
        compressedSize += `h${staticIndex}`.length;
        continue;
      }

      // 检查动态表
      const dynamicIndex = this.findInDynamicTable(name, value);
      if (dynamicIndex !== -1) {
        compressedHeaders[`h${dynamicIndex}`] = '';
        compressedSize += `h${dynamicIndex}`.length;
        continue;
      }

      // 尝试部分匹配
      const partialMatch = this.findPartialMatch(name, value);
      if (partialMatch) {
        const { index, remainingValue } = partialMatch;
        compressedHeaders[`h${index}`] = remainingValue;
        compressedSize += `h${index}`.length + remainingValue.length;
        continue;
      }

      // 添加到动态表
      const newIndex = this.dynamicTable.add(name, value);
      compressedHeaders[`h${newIndex}`] = '';
      compressedSize += `h${newIndex}`.length;
    }

    // 更新压缩统计
    this.compressionStats = {
      originalSize,
      compressedSize,
      compressionRatio: originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0
    };

    return compressedHeaders;
  }

  /**
   * 解压头部
   * @param {Object} compressedHeaders - 压缩后的头部对象
   * @returns {Object} 原始头部对象
   */
  decompress(compressedHeaders) {
    const originalHeaders = {};

    for (const [key, value] of Object.entries(compressedHeaders)) {
      if (!key.startsWith('h')) {
        originalHeaders[key] = value;
        continue;
      }

      const index = parseInt(key.substring(1));
      let headerEntry = '';

      // 从静态表查找
      if (index < STATIC_HEADER_TABLE.size) {
        headerEntry = STATIC_HEADER_TABLE.get(index);
      } else {
        // 从动态表查找
        const dynamicIndex = index - STATIC_HEADER_TABLE.size;
        headerEntry = this.dynamicTable.get(dynamicIndex);
      }

      if (headerEntry) {
        const [name, originalValue] = headerEntry.split(': ');
        originalHeaders[name] = value || originalValue;
      }
    }

    return originalHeaders;
  }

  /**
   * 在静态表中查找
   * @param {string} name - 头部名称
   * @param {string} value - 头部值
   * @returns {number} 索引，-1表示未找到
   */
  findInStaticTable(name, value) {
    for (const [originalName, compressedName] of STATIC_HEADER_TABLE.entries()) {
      if (originalName === name) {
        return Array.from(STATIC_HEADER_TABLE.keys()).indexOf(originalName);
      }
    }
    return -1;
  }

  /**
   * 在动态表中查找
   * @param {string} name - 头部名称
   * @param {string} value - 头部值
   * @returns {number} 索引，-1表示未找到
   */
  findInDynamicTable(name, value) {
    const targetEntry = `${name}: ${value}`;
    for (const [index, entry] of this.dynamicTable.table.entries()) {
      if (entry === targetEntry) {
        return index;
      }
    }
    return -1;
  }

  /**
   * 查找部分匹配
   * @param {string} name - 头部名称
   * @param {string} value - 头部值
   * @returns {Object|null} 匹配结果
   */
  findPartialMatch(name, value) {
    // 查找名称匹配但值不同的条目
    for (const [index, entry] of this.dynamicTable.table.entries()) {
      const [entryName, entryValue] = entry.split(': ');
      if (entryName === name && entryValue !== value) {
        return {
          index,
          remainingValue: value
        };
      }
    }
    return null;
  }

  /**
   * 获取压缩统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return { ...this.compressionStats };
  }

  /**
   * 重置压缩器
   */
  reset() {
    this.dynamicTable.clear();
    this.compressionStats = {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0
    };
  }
}

/**
 * HTTP请求包装器
 * 自动处理头部压缩和解压
 */
class CompressedHTTPClient {
  constructor() {
    this.compressor = new HeaderCompressor();
  }

  /**
   * 发送压缩请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  async request(url, options = {}) {
    const { headers = {}, ...otherOptions } = options;
    
    // 压缩头部
    const compressedHeaders = this.compressor.compress(headers);
    
    // 添加压缩标识
    compressedHeaders['x-header-compression'] = 'enabled';
    
    console.log('Original headers size:', JSON.stringify(headers).length);
    console.log('Compressed headers size:', JSON.stringify(compressedHeaders).length);
    console.log('Compression ratio:', this.compressor.getStats().compressionRatio.toFixed(2) + '%');

    // 发送请求
    const response = await fetch(url, {
      ...otherOptions,
      headers: compressedHeaders
    });

    // 解压响应头部
    const originalResponseHeaders = this.compressor.decompress(
      Object.fromEntries(response.headers.entries())
    );

    return {
      ...response,
      headers: new Headers(originalResponseHeaders)
    };
  }

  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} headers - 请求头部
   * @returns {Promise} 请求结果
   */
  async get(url, headers = {}) {
    return this.request(url, { method: 'GET', headers });
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
        'content-type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    });
  }
}

/**
 * 使用示例
 */
async function example() {
  const client = new CompressedHTTPClient();

  // 示例请求头部
  const headers = {
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'x-custom-app': 'my-application',
    'x-custom-version': '1.2.3',
    'x-custom-token': 'abc123def456',
    'x-custom-userid': 'user123',
    'x-custom-tenant': 'tenant456',
    'x-custom-role': 'admin',
    'x-custom-permission': 'read,write',
    'x-custom-feature': 'feature1,feature2',
    'x-custom-config': 'config123',
    'x-custom-debug': 'true',
    'x-custom-trace': 'trace789',
    'x-custom-session': 'session456',
    'x-custom-locale': 'zh-CN',
    'x-custom-timezone': 'Asia/Shanghai',
    'x-custom-theme': 'dark'
  };

  try {
    // 发送GET请求
    const response = await client.get('/api/data', headers);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // 发送POST请求
    const postResponse = await client.post('/api/submit', 
      { message: 'Hello World' }, 
      headers
    );
    console.log('POST Response status:', postResponse.status);

  } catch (error) {
    console.error('Request failed:', error);
  }
}

// 导出模块
export {
  HeaderCompressor,
  CompressedHTTPClient,
  DynamicHeaderTable,
  STATIC_HEADER_TABLE,
  example
};
