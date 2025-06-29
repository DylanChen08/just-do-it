// 操作
// 这里需要书写一个操作的类，类里面提供各种方法，相当于于一种操作的描述

class TextOperation {
  constructor() {
    // 用于存储一个一个的操作描述对象
    // 例如 {type: 'retain', count: 5}
    this.ops = [];
  }

  // 接下来就需要书写各种方法
  // 每一个方法实际上就是往 ops 队列推入一个操作描述对象

  /**
   *
   * @param {*} n 表示要跳过文本中的 n 个字符
   */
  retain(n) {
    if (n > 0) {
      this.ops.push({ type: "retain", count: n }); // 推入一个操作描述对象
    }
    return this; // 返回当前的对象，方便进行链式调用
  }

  /**
   *
   * @param {*} str 接收一个参数，该参数表示要插入的文本
   */
  insert(str) {
    if (str && str.length > 0) {
      this.ops.push({ type: "insert", value: str }); // 推入一个操作描述对象
    }
    return this; // 返回当前的对象，方便进行链式调用
  }

  /**
   *
   * @param {*} n 表示要删除的字符的数量
   */
  delete(n) {
    if (n > 0) {
      this.ops.push({ type: "delete", count: n }); // 推入一个操作描述对象
    }
    return this; // 返回当前的对象，方便进行链式调用
  }

  /**
   * 该方法用于应用当前队列里面所有的操作对象
   * @param {*} text 该参数表示要进行操作的文本
   */
  apply(text) {
    let result = ""; // 最终应用了操作之后的文本结果
    let index = 0; // 用于记录当前操作的文本的索引位置

    // 遍历 ops 队列，因为 ops 队列里面存储的都是操作描述对象
    for (const op of this.ops) {
      // 接下来需要根据不同的操作类型进行不同的处理
      if (op.type === "retain") {
        // 进入此分支，表示要保留文本中的 n 个字符
        const retained = text.slice(index, index + op.count); // 截取文本中的 n 个字符
        result += retained; // 将截取的文本添加到结果中
        index += op.count; // 更新索引位置
      } else if (op.type === "insert") {
        // 进入此分支，表示要插入文本
        result += op.value; // 将插入的文本添加到结果中
        // index 不需要更新，因为插入文本不会影响索引位置
      } else if (op.type === "delete") {
        // 进入此分支，表示要删除文本中的 n 个字符
        index += op.count; // 更新索引位置
        // 注意：这里没有将删除的文本添加到结果中，因为我们只需要保留未删除的文本
      }
    }

    result += text.slice(index); // 将剩余的文本添加到结果中

    return result; // 将应用结果返回
  }

  /**
   * 撤销操作，其实就是将操作的顺序进行反转
   * @param {*} baseText 原始的文本是什么
   */
  invert(baseText) {
    const inverse = new TextOperation(); // 创建一个新的操作对象
    let index = 0; // 一开始还是需要记录索引位置

    // 然后遍历当前的操作描述对象序列，每一项操作做一个相反的操作
    // 下面要做的事情，就是生成对应的反向的操作描述对象，推入到 inverse 实例对象的 ops 队列中
    for (const op of this.ops) {
      if (op.type === "retain") {
        // 保留操作的反向操作仍然是保留操作
        inverse.retain(op.count); // 这里就会生成一个描述对象推入到 inverse 实例对象的 ops 队列中
        index += op.count; // 更新索引位置
      } else if (op.type === "insert") {
        // 反向操作就应该是删除操作
        inverse.delete(op.value.length); // 这里就会生成一个描述对象推入到 inverse 实例对象的 ops 队列中
      } else if (op.type === "delete") {
        // 这里的反向操作就应该是新增
        const deletedText = baseText.slice(index, index + op.count); // 截取文本中的 n 个字符，拿到删除的字符
        inverse.insert(deletedText); // 这里就会生成一个描述对象推入到 inverse 实例对象的 ops 队列中
        index += op.count; // 更新索引位置
      }
    }

    return inverse; // 返回新的 TextOperation 实例对象
  }

  /**
   * 返回整个操作描述对象的序列
   */
  toJSON() {
    return this.ops; // 返回 ops 队列
  }
}

module.exports = {
  TextOperation,
};
