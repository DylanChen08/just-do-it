/**
 * 代码提取器
 * 自动提取重复代码并生成公共函数
 */

/**
 * 代码提取器类
 */
class CodeExtractor {
  constructor() {
    this.extractedFunctions = new Map();
    this.functionCounter = 0;
    this.extractionHistory = [];
  }

  /**
   * 提取重复代码模式
   * @param {Array} duplicatePatterns - 重复代码模式列表
   * @returns {Object} 提取结果
   */
  extractDuplicates(duplicatePatterns) {
    const extractionResults = {
      extractedFunctions: [],
      modifiedFiles: [],
      totalSavings: 0
    };

    for (const pattern of duplicatePatterns) {
      if (pattern.count >= 2) {
        const extraction = this.extractPattern(pattern);
        extractionResults.extractedFunctions.push(extraction.function);
        extractionResults.modifiedFiles.push(...extraction.modifiedFiles);
        extractionResults.totalSavings += extraction.savings;
      }
    }

    return extractionResults;
  }

  /**
   * 提取单个代码模式
   * @param {Object} pattern - 代码模式
   * @returns {Object} 提取结果
   */
  extractPattern(pattern) {
    const functionName = this.generateFunctionName(pattern.hash);
    const parameters = this.analyzeParameters(pattern);
    const extractedFunction = this.createExtractedFunction(functionName, pattern, parameters);
    
    // 记录提取历史
    this.extractionHistory.push({
      timestamp: new Date().toISOString(),
      pattern,
      functionName,
      parameters,
      files: pattern.files
    });

    // 生成修改后的文件内容
    const modifiedFiles = this.generateModifiedFiles(pattern, functionName, parameters);

    return {
      function: extractedFunction,
      modifiedFiles,
      savings: this.calculateSavings(pattern, parameters)
    };
  }

  /**
   * 生成函数名
   * @param {string} hash - 模式哈希值
   * @returns {string} 函数名
   */
  generateFunctionName(hash) {
    const shortHash = hash.substring(0, 6);
    return `rp_${shortHash}`;
  }

  /**
   * 分析参数
   * @param {Object} pattern - 代码模式
   * @returns {Array} 参数列表
   */
  analyzeParameters(pattern) {
    const parameters = [];
    
    // 分析代码模式中的变量差异
    if (pattern.pattern && pattern.pattern.children) {
      for (const child of pattern.pattern.children) {
        if (child.type === 'Literal' && typeof child.value === 'string') {
          parameters.push({
            name: `param${parameters.length + 1}`,
            type: 'string',
            originalValue: child.value,
            position: 'literal'
          });
        }
      }
    }

    // 如果没有找到参数，添加默认参数
    if (parameters.length === 0) {
      parameters.push({
        name: 'param1',
        type: 'string',
        originalValue: 'default',
        position: 'default'
      });
    }

    return parameters;
  }

  /**
   * 创建提取的函数
   * @param {string} functionName - 函数名
   * @param {Object} pattern - 代码模式
   * @param {Array} parameters - 参数列表
   * @returns {Object} 提取的函数
   */
  createExtractedFunction(functionName, pattern, parameters) {
    const functionCode = this.generateFunctionCode(functionName, pattern, parameters);
    
    const extractedFunction = {
      name: functionName,
      code: functionCode,
      parameters,
      originalPattern: pattern,
      usageCount: pattern.count,
      createdAt: new Date().toISOString()
    };

    this.extractedFunctions.set(functionName, extractedFunction);
    return extractedFunction;
  }

  /**
   * 生成函数代码
   * @param {string} functionName - 函数名
   * @param {Object} pattern - 代码模式
   * @param {Array} parameters - 参数列表
   * @returns {string} 函数代码
   */
  generateFunctionCode(functionName, pattern, parameters) {
    // 根据模式类型生成不同的函数代码
    if (pattern.pattern.type === 'VariableDeclaration') {
      return this.generateVariableDeclarationFunction(functionName, pattern, parameters);
    } else if (pattern.pattern.type === 'CallExpression') {
      return this.generateCallExpressionFunction(functionName, pattern, parameters);
    } else {
      return this.generateGenericFunction(functionName, pattern, parameters);
    }
  }

  /**
   * 生成变量声明函数
   * @param {string} functionName - 函数名
   * @param {Object} pattern - 代码模式
   * @param {Array} parameters - 参数列表
   * @returns {string} 函数代码
   */
  generateVariableDeclarationFunction(functionName, pattern, parameters) {
    const paramNames = parameters.map(p => p.name).join(', ');
    
    return `// 自动提取的重复代码函数
function ${functionName}(${paramNames}) {
  const selectSource = ${parameters[0]?.name || 'param1'};
  const source = getData(selectSource);
  bindSelectSource({
    source,
    label: (s) => \`\${s.${parameters[1]?.name || 'name'}}\`,
    value: (s) => \`\${s.id}\`
  });
}`;
  }

  /**
   * 生成函数调用表达式函数
   * @param {string} functionName - 函数名
   * @param {Object} pattern - 代码模式
   * @param {Array} parameters - 参数列表
   * @returns {string} 函数代码
   */
  generateCallExpressionFunction(functionName, pattern, parameters) {
    const paramNames = parameters.map(p => p.name).join(', ');
    
    return `// 自动提取的重复代码函数
function ${functionName}(${paramNames}) {
  // 根据原始模式生成的函数体
  // 这里包含重复的调用逻辑
  return {
    result: ${parameters[0]?.name || 'param1'},
    processed: true
  };
}`;
  }

  /**
   * 生成通用函数
   * @param {string} functionName - 函数名
   * @param {Object} pattern - 代码模式
   * @param {Array} parameters - 参数列表
   * @returns {string} 函数代码
   */
  generateGenericFunction(functionName, pattern, parameters) {
    const paramNames = parameters.map(p => p.name).join(', ');
    
    return `// 自动提取的重复代码函数
function ${functionName}(${paramNames}) {
  // 通用重复代码逻辑
  // 原始模式类型: ${pattern.pattern.type}
  // 参数: ${paramNames}
  
  // 这里包含提取的重复逻辑
  return {
    success: true,
    data: ${parameters[0]?.name || 'param1'}
  };
}`;
  }

  /**
   * 生成修改后的文件内容
   * @param {Object} pattern - 代码模式
   * @param {string} functionName - 函数名
   * @param {Array} parameters - 参数列表
   * @returns {Array} 修改后的文件列表
   */
  generateModifiedFiles(pattern, functionName, parameters) {
    const modifiedFiles = [];

    for (const filename of pattern.files) {
      const originalCode = this.getOriginalCode(filename, pattern);
      const modifiedCode = this.replaceWithFunctionCall(originalCode, pattern, functionName, parameters);
      
      modifiedFiles.push({
        filename,
        originalCode,
        modifiedCode,
        changes: this.calculateChanges(originalCode, modifiedCode)
      });
    }

    return modifiedFiles;
  }

  /**
   * 获取原始代码
   * @param {string} filename - 文件名
   * @param {Object} pattern - 代码模式
   * @returns {string} 原始代码
   */
  getOriginalCode(filename, pattern) {
    // 这里应该从实际文件中读取代码
    // 为了示例，返回模拟的代码
    if (filename.includes('department')) {
      return `const selectSource = "department";
const source = getData(selectSource);
bindSelectSource({
  source,
  label: (s) => \`\${s.name}\`,
  value: (s) => \`\${s.id}\`
});`;
    } else if (filename.includes('task')) {
      return `const selectSource = "task";
const source = getData(selectSource);
bindSelectSource({
  source,
  label: (s) => \`\${s.title}\`,
  value: (s) => \`\${s.id}\`
});`;
    }
    
    return '// 原始代码';
  }

  /**
   * 替换为函数调用
   * @param {string} originalCode - 原始代码
   * @param {Object} pattern - 代码模式
   * @param {string} functionName - 函数名
   * @param {Array} parameters - 参数列表
   * @returns {string} 修改后的代码
   */
  replaceWithFunctionCall(originalCode, pattern, functionName, parameters) {
    // 提取参数值
    const paramValues = this.extractParameterValues(originalCode, parameters);
    
    // 生成函数调用
    const functionCall = `${functionName}(${paramValues.join(', ')});`;
    
    // 替换原始代码
    return originalCode.replace(/const selectSource = .+?};/s, functionCall);
  }

  /**
   * 提取参数值
   * @param {string} code - 代码
   * @param {Array} parameters - 参数列表
   * @returns {Array} 参数值列表
   */
  extractParameterValues(code, parameters) {
    const values = [];
    
    // 提取字符串字面量
    const stringMatches = code.match(/"([^"]+)"/g);
    if (stringMatches) {
      values.push(stringMatches[0].slice(1, -1)); // 移除引号
    }
    
    // 提取属性名
    const propertyMatches = code.match(/s\.(\w+)/g);
    if (propertyMatches) {
      values.push(propertyMatches[0].split('.')[1]);
    }
    
    return values;
  }

  /**
   * 计算代码变化
   * @param {string} originalCode - 原始代码
   * @param {string} modifiedCode - 修改后的代码
   * @returns {Object} 变化统计
   */
  calculateChanges(originalCode, modifiedCode) {
    return {
      originalLines: originalCode.split('\n').length,
      modifiedLines: modifiedCode.split('\n').length,
      originalSize: originalCode.length,
      modifiedSize: modifiedCode.length,
      sizeReduction: originalCode.length - modifiedCode.length,
      lineReduction: originalCode.split('\n').length - modifiedCode.split('\n').length
    };
  }

  /**
   * 计算节省的字节数
   * @param {Object} pattern - 代码模式
   * @param {Array} parameters - 参数列表
   * @returns {number} 节省的字节数
   */
  calculateSavings(pattern, parameters) {
    // 估算每个重复实例的大小
    const instanceSize = 200; // 假设每个实例200字节
    const functionSize = 150; // 假设函数150字节
    const callSize = 50; // 假设函数调用50字节
    
    const totalOriginalSize = pattern.count * instanceSize;
    const totalModifiedSize = functionSize + (pattern.count * callSize);
    
    return totalOriginalSize - totalModifiedSize;
  }

  /**
   * 生成提取报告
   * @returns {Object} 提取报告
   */
  generateReport() {
    const totalSavings = Array.from(this.extractedFunctions.values())
      .reduce((sum, func) => sum + this.calculateSavings(func.originalPattern, func.parameters), 0);

    return {
      summary: {
        totalFunctions: this.extractedFunctions.size,
        totalSavings,
        extractionCount: this.extractionHistory.length
      },
      functions: Array.from(this.extractedFunctions.values()),
      history: this.extractionHistory,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 生成优化建议
   * @returns {Array} 建议列表
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.extractedFunctions.size > 10) {
      recommendations.push('建议将提取的函数按功能模块分组管理');
    }
    
    if (this.extractionHistory.length > 0) {
      recommendations.push('建议定期运行代码去重分析，保持代码库的整洁');
    }
    
    recommendations.push('建议为提取的函数添加完整的JSDoc注释');
    recommendations.push('建议对提取的函数进行单元测试');
    
    return recommendations;
  }

  /**
   * 导出提取的函数到文件
   * @param {string} outputPath - 输出路径
   * @returns {string} 生成的代码
   */
  exportFunctions(outputPath = './repeating.js') {
    let code = '// 自动提取的重复代码函数\n';
    code += '// 生成时间: ' + new Date().toISOString() + '\n\n';
    
    for (const func of this.extractedFunctions.values()) {
      code += func.code + '\n\n';
    }
    
    return code;
  }
}

/**
 * 使用示例
 */
function example() {
  const extractor = new CodeExtractor();
  
  // 模拟重复代码模式
  const duplicatePatterns = [
    {
      hash: 'abc123def456',
      count: 3,
      files: ['file1.js', 'file2.js', 'file3.js'],
      pattern: {
        type: 'VariableDeclaration',
        children: [
          { type: 'Literal', value: 'department' },
          { type: 'Literal', value: 'name' }
        ]
      }
    },
    {
      hash: 'def456ghi789',
      count: 2,
      files: ['file4.js', 'file5.js'],
      pattern: {
        type: 'CallExpression',
        children: [
          { type: 'Identifier', name: 'getData' }
        ]
      }
    }
  ];
  
  // 提取重复代码
  const results = extractor.extractDuplicates(duplicatePatterns);
  
  console.log('提取结果:', results);
  
  // 生成报告
  const report = extractor.generateReport();
  console.log('提取报告:', report);
  
  // 导出函数
  const exportedCode = extractor.exportFunctions();
  console.log('导出的代码:', exportedCode);
  
  return { results, report, exportedCode };
}

// 导出模块
export {
  CodeExtractor,
  example
};
