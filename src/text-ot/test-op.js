const { TextOperation } = require("./TextOperation");


// 测试用例 1：插入到中间位置
(() => {
    const text = "Hello world!";
    const op = new TextOperation().retain(6).insert("beautiful ");
    const result = op.apply(text);
    console.log(`测试用例1结果: ${result}`);
    // 期望: "Hello beautiful world!"
  })();
  
  // 测试用例 2：只保留前半部分，不插入任何东西
  (() => {
    const text = "abcdefg";
    const op = new TextOperation().retain(3);
    const result = op.apply(text);
    console.log(`测试用例2结果: ${result}`);
    // 期望: "abcdefg"
  })();
  
  // 测试用例 3：删除部分字符后拼接剩余文本
  (() => {
    const text = "abcdefg";
    const op = new TextOperation().retain(2).delete(3);
    const result = op.apply(text);
    console.log(`测试用例3结果: ${result}`);
    // 期望: "abfg"
  })();
  
  // 测试用例 4：只插入，不保留任何原文本
  (() => {
    const text = "abcdef";
    const op = new TextOperation().insert("XYZ");
    const result = op.apply(text);
    console.log(`测试用例4结果: ${result}`);
    // 期望: "XYZabcdef"
  })();
  
  // 测试用例 5：操作覆盖整个文本
  (() => {
    const text = "abcdef";
    const op = new TextOperation().retain(6);
    const result = op.apply(text);
    console.log(`测试用例5结果: ${result}`);
    // 期望: "abcdef"
  })()