# 首屏优化解决方案示例

本目录包含了基于《首屏优化.md》文档中提到的各种优化方案的JavaScript实现示例。

## 目录结构

```
home-page-optimize/
├── README.md                           # 本文件
├── http-optimization/                  # HTTP1.1优化方案
│   ├── multi-domain.js                 # 多域名解决方案
│   └── header-compression.js           # 头部压缩方案
├── code-deduplication/                 # 代码去重方案
│   ├── ast-analyzer.js                 # AST代码分析器
│   └── code-extractor.js               # 代码提取器
├── lazy-loading/                       # 按需加载方案
│   ├── component-loader.js             # 组件加载器
│   └── viewport-manager.js             # 视口管理器
└── api-caching/                        # API缓存方案
    ├── request-cache.js                # 请求缓存系统
    └── with-cache.js                   # withCache装饰器
```

## 优化方案详解

### 1. HTTP1.1优化方案 (`http-optimization/`)

#### 多域名解决方案 (`multi-domain.js`)
- **问题**：HTTP1.1的队头阻塞问题
- **解决方案**：使用多个域名突破浏览器连接限制
- **核心功能**：
  - 域名负载均衡
  - 资源类型分类加载
  - 并发请求管理
  - 自动域名选择

#### 头部压缩方案 (`header-compression.js`)
- **问题**：HTTP1.1不支持头部压缩，导致头部臃肿
- **解决方案**：借鉴HTTP2的头部压缩方式
- **核心功能**：
  - 静态头部表
  - 动态头部表
  - 头部压缩/解压
  - 压缩统计

### 2. 代码去重方案 (`code-deduplication/`)

#### AST代码分析器 (`ast-analyzer.js`)
- **问题**：大量重复代码增加传输体积
- **解决方案**：通过AST分析识别重复代码结构
- **核心功能**：
  - JavaScript代码解析
  - AST节点分析
  - 重复模式识别
  - 哈希计算

#### 代码提取器 (`code-extractor.js`)
- **问题**：重复代码需要自动提取
- **解决方案**：自动提取重复代码并生成公共函数
- **核心功能**：
  - 重复代码提取
  - 参数分析
  - 函数生成
  - 代码替换

### 3. 按需加载方案 (`lazy-loading/`)

#### 组件加载器 (`component-loader.js`)
- **问题**：无差别加载所有JS文件
- **解决方案**：视口内组件优先加载，视口外延迟加载
- **核心功能**：
  - 组件注册管理
  - 优先级加载
  - 依赖处理
  - 并发控制

#### 视口管理器 (`viewport-manager.js`)
- **问题**：需要准确判断组件是否在视口内
- **解决方案**：智能视口检测和管理
- **核心功能**：
  - 视口区域定义
  - 交叉观察器
  - 组件视口映射
  - 加载策略管理

### 4. API缓存方案 (`api-caching/`)

#### 请求缓存系统 (`request-cache.js`)
- **问题**：大量重复的API请求
- **解决方案**：实现短时缓存减少重复请求
- **核心功能**：
  - 请求缓存管理
  - 缓存策略
  - 过期处理
  - 统计信息

#### withCache装饰器 (`with-cache.js`)
- **问题**：需要为现有函数添加缓存功能
- **解决方案**：提供装饰器模式添加缓存
- **核心功能**：
  - 函数缓存装饰器
  - 参数比较
  - 缓存配置
  - 预设策略

## 使用方法

### 1. HTTP优化

```javascript
import { ResourceLoader, DomainBalancer } from './http-optimization/multi-domain.js';
import { CompressedHTTPClient } from './http-optimization/header-compression.js';

// 多域名加载
const resource = await ResourceLoader.loadStatic('/js/app.js');

// 头部压缩请求
const client = new CompressedHTTPClient();
const response = await client.get('/api/data', headers);
```

### 2. 代码去重

```javascript
import { ASTAnalyzer } from './code-deduplication/ast-analyzer.js';
import { CodeExtractor } from './code-deduplication/code-extractor.js';

// 分析代码重复
const analyzer = new ASTAnalyzer();
analyzer.parseCode(code1, 'file1.js');
analyzer.parseCode(code2, 'file2.js');
const report = analyzer.getReport();

// 提取重复代码
const extractor = new CodeExtractor();
const results = extractor.extractDuplicates(duplicatePatterns);
```

### 3. 按需加载

```javascript
import { ComponentLoader } from './lazy-loading/component-loader.js';
import { ViewportManager } from './lazy-loading/viewport-manager.js';

// 组件加载
const loader = new ComponentLoader();
loader.registerComponent(new ComponentConfig('header', '/components/header.js'));
await loader.smartLoad();

// 视口管理
const viewportManager = new ViewportManager();
viewportManager.registerComponent('header', 'above-fold', headerElement);
```

### 4. API缓存

```javascript
import { withCache } from './api-caching/with-cache.js';
import { CachedHTTPClient } from './api-caching/request-cache.js';

// 函数缓存
const cachedFunction = withCache(originalFunction, { maxAge: 5000 });

// HTTP客户端缓存
const client = new CachedHTTPClient();
const response = await client.get('/api/data');
```

## 性能优化效果

根据文档中的优化效果：

- **LCP时间降低80%**：通过多域名、头部压缩、代码去重等综合优化
- **减少重复请求**：通过API缓存减少90%的重复请求
- **减少包体积**：通过代码去重减少30-50%的JS文件大小
- **提升加载速度**：通过按需加载减少首屏加载时间

## 注意事项

1. **浏览器兼容性**：部分功能需要现代浏览器支持（如IntersectionObserver）
2. **缓存策略**：需要根据实际业务场景调整缓存时间和策略
3. **错误处理**：所有示例都包含了基本的错误处理，实际使用时需要完善
4. **性能监控**：建议添加性能监控来验证优化效果

## 扩展建议

1. **添加单元测试**：为每个模块添加完整的单元测试
2. **性能监控**：集成性能监控工具
3. **配置化**：将硬编码的配置项提取为可配置项
4. **文档完善**：添加更详细的API文档和使用示例
