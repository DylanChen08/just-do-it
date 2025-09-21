/**
 * AST代码分析器
 * 用于分析JavaScript代码的抽象语法树，识别重复代码结构
 */

/**
 * AST节点类型枚举
 */
const NODE_TYPES = {
  VARIABLE_DECLARATION: 'VariableDeclaration',
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  CALL_EXPRESSION: 'CallExpression',
  MEMBER_EXPRESSION: 'MemberExpression',
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  FUNCTION_EXPRESSION: 'FunctionExpression',
  ARROW_FUNCTION_EXPRESSION: 'ArrowFunctionExpression',
  BLOCK_STATEMENT: 'BlockStatement',
  RETURN_STATEMENT: 'ReturnStatement',
  IF_STATEMENT: 'IfStatement',
  FOR_STATEMENT: 'ForStatement',
  WHILE_STATEMENT: 'WhileStatement'
};

/**
 * AST节点基类
 */
class ASTNode {
  constructor(type, children = []) {
    this.type = type;
    this.children = children;
    this.hash = null;
    this.metadata = {};
  }

  /**
   * 计算节点结构哈希值
   * @returns {string} 哈希值
   */
  calculateHash() {
    if (this.hash) {
      return this.hash;
    }

    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    
    // 添加节点类型
    hash.update(this.type);
    
    // 添加子节点哈希
    for (const child of this.children) {
      if (child instanceof ASTNode) {
        hash.update(child.calculateHash());
      } else {
        hash.update(String(child));
      }
    }
    
    // 添加节点特定信息
    this.addNodeSpecificHash(hash);
    
    this.hash = hash.digest('hex');
    return this.hash;
  }

  /**
   * 添加节点特定的哈希信息
   * @param {crypto.Hash} hash - 哈希对象
   */
  addNodeSpecificHash(hash) {
    // 子类重写此方法
  }

  /**
   * 获取节点结构信息
   * @returns {Object} 结构信息
   */
  getStructure() {
    return {
      type: this.type,
      hash: this.calculateHash(),
      children: this.children.map(child => 
        child instanceof ASTNode ? child.getStructure() : child
      ),
      metadata: this.metadata
    };
  }
}

/**
 * 变量声明节点
 */
class VariableDeclarationNode extends ASTNode {
  constructor(kind, name, init) {
    super(NODE_TYPES.VARIABLE_DECLARATION, [init]);
    this.kind = kind; // const, let, var
    this.name = name;
    this.init = init;
  }

  addNodeSpecificHash(hash) {
    hash.update(this.kind);
    hash.update(this.name);
    if (this.init) {
      hash.update(this.init.type || 'undefined');
    }
  }
}

/**
 * 函数调用节点
 */
class CallExpressionNode extends ASTNode {
  constructor(callee, arguments) {
    super(NODE_TYPES.CALL_EXPRESSION, [callee, ...arguments]);
    this.callee = callee;
    this.arguments = arguments;
  }

  addNodeSpecificHash(hash) {
    if (this.callee) {
      hash.update(this.callee.type || 'undefined');
      if (this.callee.name) {
        hash.update(this.callee.name);
      }
    }
    hash.update(String(this.arguments.length));
  }
}

/**
 * 成员表达式节点
 */
class MemberExpressionNode extends ASTNode {
  constructor(object, property, computed = false) {
    super(NODE_TYPES.MEMBER_EXPRESSION, [object, property]);
    this.object = object;
    this.property = property;
    this.computed = computed;
  }

  addNodeSpecificHash(hash) {
    hash.update(String(this.computed));
    if (this.object) {
      hash.update(this.object.type || 'undefined');
    }
    if (this.property) {
      hash.update(this.property.type || 'undefined');
    }
  }
}

/**
 * 标识符节点
 */
class IdentifierNode extends ASTNode {
  constructor(name) {
    super(NODE_TYPES.IDENTIFIER);
    this.name = name;
  }

  addNodeSpecificHash(hash) {
    hash.update(this.name);
  }
}

/**
 * 字面量节点
 */
class LiteralNode extends ASTNode {
  constructor(value, raw) {
    super(NODE_TYPES.LITERAL);
    this.value = value;
    this.raw = raw;
  }

  addNodeSpecificHash(hash) {
    hash.update(typeof this.value);
    if (typeof this.value === 'string') {
      hash.update('string');
    } else {
      hash.update(String(this.value));
    }
  }
}

/**
 * AST分析器
 */
class ASTAnalyzer {
  constructor() {
    this.parsedFiles = new Map();
    this.duplicatePatterns = new Map();
  }

  /**
   * 解析JavaScript代码为AST
   * @param {string} code - JavaScript代码
   * @param {string} filename - 文件名
   * @returns {Object} AST结构
   */
  parseCode(code, filename) {
    try {
      // 这里使用简化的解析逻辑，实际项目中应使用@babel/parser
      const ast = this.simpleParse(code);
      this.parsedFiles.set(filename, ast);
      return ast;
    } catch (error) {
      console.error(`Failed to parse ${filename}:`, error);
      return null;
    }
  }

  /**
   * 简化的代码解析器
   * @param {string} code - JavaScript代码
   * @returns {Object} AST结构
   */
  simpleParse(code) {
    const lines = code.split('\n');
    const statements = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      // 解析变量声明
      if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) {
        const match = trimmed.match(/^(const|let|var)\s+(\w+)\s*=\s*(.+)$/);
        if (match) {
          const [, kind, name, init] = match;
          const initNode = this.parseExpression(init);
          statements.push(new VariableDeclarationNode(kind, name, initNode));
        }
      }
      // 解析函数调用
      else if (trimmed.includes('(') && trimmed.includes(')')) {
        const callMatch = trimmed.match(/^(\w+(?:\.\w+)*)\s*\(([^)]*)\)/);
        if (callMatch) {
          const [, callee, args] = callMatch;
          const calleeNode = this.parseMemberExpression(callee);
          const argNodes = args ? args.split(',').map(arg => this.parseExpression(arg.trim())) : [];
          statements.push(new CallExpressionNode(calleeNode, argNodes));
        }
      }
    }

    return {
      type: 'Program',
      body: statements,
      filename: 'parsed'
    };
  }

  /**
   * 解析表达式
   * @param {string} expr - 表达式字符串
   * @returns {ASTNode} AST节点
   */
  parseExpression(expr) {
    expr = expr.trim();
    
    // 字符串字面量
    if (expr.startsWith('"') || expr.startsWith("'")) {
      return new LiteralNode(expr.slice(1, -1), expr);
    }
    
    // 数字字面量
    if (/^\d+$/.test(expr)) {
      return new LiteralNode(parseInt(expr), expr);
    }
    
    // 布尔字面量
    if (expr === 'true' || expr === 'false') {
      return new LiteralNode(expr === 'true', expr);
    }
    
    // 成员表达式
    if (expr.includes('.')) {
      return this.parseMemberExpression(expr);
    }
    
    // 标识符
    if (/^\w+$/.test(expr)) {
      return new IdentifierNode(expr);
    }
    
    // 默认返回字面量
    return new LiteralNode(expr, expr);
  }

  /**
   * 解析成员表达式
   * @param {string} expr - 成员表达式字符串
   * @returns {MemberExpressionNode} 成员表达式节点
   */
  parseMemberExpression(expr) {
    const parts = expr.split('.');
    if (parts.length === 1) {
      return new IdentifierNode(parts[0]);
    }
    
    let object = new IdentifierNode(parts[0]);
    for (let i = 1; i < parts.length; i++) {
      object = new MemberExpressionNode(object, new IdentifierNode(parts[i]));
    }
    
    return object;
  }

  /**
   * 分析重复代码模式
   * @returns {Array} 重复模式列表
   */
  analyzeDuplicates() {
    const hashGroups = new Map();
    
    // 收集所有节点的哈希值
    for (const [filename, ast] of this.parsedFiles) {
      this.collectHashes(ast, filename, hashGroups);
    }
    
    // 找出重复的模式
    const duplicates = [];
    for (const [hash, files] of hashGroups) {
      if (files.length > 1) {
        duplicates.push({
          hash,
          files: files.map(f => f.filename),
          pattern: files[0].pattern,
          count: files.length
        });
      }
    }
    
    return duplicates.sort((a, b) => b.count - a.count);
  }

  /**
   * 收集哈希值
   * @param {Object} ast - AST节点
   * @param {string} filename - 文件名
   * @param {Map} hashGroups - 哈希分组
   */
  collectHashes(ast, filename, hashGroups) {
    if (!ast || !ast.body) return;
    
    for (const statement of ast.body) {
      if (statement instanceof ASTNode) {
        const hash = statement.calculateHash();
        if (!hashGroups.has(hash)) {
          hashGroups.set(hash, []);
        }
        
        hashGroups.get(hash).push({
          filename,
          pattern: statement.getStructure()
        });
      }
    }
  }

  /**
   * 生成重复代码提取建议
   * @param {Array} duplicates - 重复模式列表
   * @returns {Array} 提取建议
   */
  generateExtractionSuggestions(duplicates) {
    const suggestions = [];
    
    for (const duplicate of duplicates) {
      if (duplicate.count >= 2) {
        const suggestion = {
          functionName: `rp_${duplicate.hash.substring(0, 6)}`,
          pattern: duplicate.pattern,
          files: duplicate.files,
          parameters: this.extractParameters(duplicate.pattern),
          originalCode: this.generateOriginalCode(duplicate.pattern),
          extractedCode: this.generateExtractedCode(duplicate.pattern, duplicate.hash)
        };
        
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }

  /**
   * 提取参数
   * @param {Object} pattern - 代码模式
   * @returns {Array} 参数列表
   */
  extractParameters(pattern) {
    const parameters = [];
    
    // 简化的参数提取逻辑
    if (pattern.type === NODE_TYPES.VARIABLE_DECLARATION) {
      // 提取字面量值作为参数
      if (pattern.children && pattern.children[0]) {
        const init = pattern.children[0];
        if (init.type === NODE_TYPES.LITERAL) {
          parameters.push({
            name: 'value',
            type: typeof init.value,
            originalValue: init.value
          });
        }
      }
    }
    
    return parameters;
  }

  /**
   * 生成原始代码
   * @param {Object} pattern - 代码模式
   * @returns {string} 原始代码
   */
  generateOriginalCode(pattern) {
    // 简化的代码生成逻辑
    if (pattern.type === NODE_TYPES.VARIABLE_DECLARATION) {
      return `const ${pattern.metadata.name || 'variable'} = ${pattern.children[0]?.value || 'value'};`;
    }
    
    return '// Generated code';
  }

  /**
   * 生成提取后的代码
   * @param {Object} pattern - 代码模式
   * @param {string} hash - 哈希值
   * @returns {string} 提取后的代码
   */
  generateExtractedCode(pattern, hash) {
    const functionName = `rp_${hash.substring(0, 6)}`;
    return `function ${functionName}(value) {\n  const variable = value;\n  // ... other logic\n}`;
  }

  /**
   * 获取分析报告
   * @returns {Object} 分析报告
   */
  getReport() {
    const duplicates = this.analyzeDuplicates();
    const suggestions = this.generateExtractionSuggestions(duplicates);
    
    return {
      totalFiles: this.parsedFiles.size,
      totalDuplicates: duplicates.length,
      duplicates,
      suggestions,
      summary: {
        potentialSavings: suggestions.length * 100, // 估算的字节节省
        extractionCount: suggestions.length
      }
    };
  }
}

/**
 * 使用示例
 */
function example() {
  const analyzer = new ASTAnalyzer();
  
  // 示例代码1
  const code1 = `
    const selectSource = "department";
    const source = getData(selectSource);
    bindSelectSource({
      source,
      label: (s) => \`\${s.name}\`,
      value: (s) => \`\${s.id}\`
    });
  `;
  
  // 示例代码2
  const code2 = `
    const selectSource = "task";
    const source = getData(selectSource);
    bindSelectSource({
      source,
      label: (s) => \`\${s.title}\`,
      value: (s) => \`\${s.id}\`
    });
  `;
  
  // 解析代码
  analyzer.parseCode(code1, 'file1.js');
  analyzer.parseCode(code2, 'file2.js');
  
  // 获取分析报告
  const report = analyzer.getReport();
  
  console.log('分析报告:', JSON.stringify(report, null, 2));
  
  return report;
}

// 导出模块
export {
  ASTAnalyzer,
  ASTNode,
  VariableDeclarationNode,
  CallExpressionNode,
  MemberExpressionNode,
  IdentifierNode,
  LiteralNode,
  NODE_TYPES,
  example
};
