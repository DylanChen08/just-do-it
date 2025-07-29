// 转换
const { TextOperation } = require("./TextOperation");
/**
 *
 * @param {*} opA 用户A的 TextOperation 对象
 * @param {*} opB 用户B的 TextOperation 对象
 */
function transfrom(opA, opB) {
  // 首先获取到用户 A 和用户 B 的操作描述对象列表
  const a = opA.toJSON(); // 用户 A 的操作描述对象列表
  const b = opB.toJSON(); // 用户 B 的操作描述对象列表

  // 之所以要实例化新的 TextOperation 对象，是因为无论是用户 A，还是用户 B，
  // 需要对它们的操作描述对象进行一个转换
  const aPrime = new TextOperation(); // 存储用户 A 转换后的操作描述对象
  const bPrime = new TextOperation(); // 存储用户 B 转换后的操作描述对象

  let i = 0,
    j = 0; // 这是两个指针，或者理解为下标值，用于遍历操作描述对象列表

  // 遍历两个操作列表，逐步处理所有的操作
  // 这个循环实际上就是一个 case-by-case 的规则匹配过程，每一个操作要进行一个组合
  while (i < a.length || j < b.length) {
    const op1 = a[i] || null; // 取出当前用户 A 操作列表中的一个操作描述对象
    const op2 = b[j] || null; // 取出当前用户 B 操作列表中的一个操作描述对象

    // 接下来就是组合各种情况

    if (op1 && op1.type === "insert") {
      // 如果进入此分支，说明用户 A 要做一个插入操作，对于用户 B 来说
      // 就需要绕开这个插入，因此 B 需要保留插入的长度
      // 例如原始文本为 abc,A 插入 X，那么 B 的操作就需要在 X 之后来执行
      // A 的操作是 insert(X)，B 的操作是 retain(3)
      aPrime.insert(op1.value); // 将用户 A 的插入操作添加到转换后的操作描述对象队列里面
      bPrime.retain(op1.value.length); // 将用户 B 的保留操作添加到转换后的操作描述对象队列里面
      i++; // 更新用户A的操作列表，跳到下一个操作
      continue; // 继续下一个循环
    }

    if (op2 && op2.type === "insert") {
      // 这里就相当于用户 B 要做一个插入操作，对于用户 A 来说
      // 就需要绕开这个插入，因此 A 需要保留插入的长度
      bPrime.insert(op2.value); // 将用户 B 的插入操作添加到转换后的操作描述对象队列里面
      aPrime.retain(op2.value.length); // 将用户 A 的保留操作添加到转换后的操作描述对象队列里面
      j++; // 更新用户B的操作列表，跳到下一个操作
      continue; // 继续下一个循环
    }

    if (op1 && op1.type === "retain" && op2 && op2.type === "retain") {
      // 进入此分支，说明双方都希望保留一部分字符，那么就需要保留共同的部分。
      // 假设用户A op1 = {type: 'retain', count: 5}, 用户B op2 = {type: 'retain', count: 3}
      // 那么就需要保留 3 个字符，剩下的 2 个字符就需要进行转换
      const minCount = Math.min(op1.count, op2.count); // 取出最小的保留长度
      aPrime.retain(minCount); // 将用户 A 的保留操作添加到转换后的操作描述对象队列里面
      bPrime.retain(minCount); // 将用户 B 的保留操作添加到转换后的操作描述对象队列里面
      op1.count -= minCount;
      op2.count -= minCount;
      // 上面的操作完成后，A 还剩余 2 个字符，B 还剩余 0 个字符
      // 那么这个时候，B 的操作已经处理完毕，就需要移动指针，取出用户 B 的下一个操作
      // 但是用户 A 的操作还没有处理完毕，所以需要继续处理
      // 接下来就需要进行判断，判断字符是否已经处理完毕
      if (op1.count === 0) i++;
      if (op2.count === 0) j++;
      continue; // 继续下一个循环
    }

    // a要进行删除操作，b要进行保留操作
    // 那么这里 a 照样做删除，b 直接跳过就好
    // 例如原始文本为 abc,A 删除 2 个字符，B 保留 3 个字符
    // 那么 A 删除 ab 后，文本变成了 c，B 只需要跳过前面的 ab，变成保留 c 即可
    if (op1 && op1.type === "delete" && op2 && op2.type === "retain") {
      const minCount = Math.min(op1.count, op2.count); // 取出最小的保留长度
      aPrime.delete(minCount); // a 继续删除
      op1.count -= minCount; // 更新 a 的操作描述对象
      op2.count -= minCount; // 更新 b 的操作描述对象，更新 b 原本想要保留的字符的数量，从原来的 count 中减
      // 接下来仍然是判断字符是否已经处理完毕，如果已经处理完毕，就需要移动指针，跳到下一个操作
      if (op1.count === 0) i++; // 如果 a 的操作已经处理完毕，就需要跳到下一个操作
      if (op2.count === 0) j++; // 如果 b 的操作已经处理完毕，就需要跳到下一个操作
      continue; // 继续下一个循环
    }

    if (op1 && op1.type === "retain" && op2 && op2.type === "delete") {
      // 进入这个分支，说明用户 A 要保留一部分字符，用户 B 要删除一部分字符
      // B直接删除，A 跳过相应的部分
      const minCount = Math.min(op1.count, op2.count); // 取出最小的保留长度
      bPrime.delete(minCount); // b 继续删除
      op1.count -= minCount; // 更新 a 的操作描述对象
      op2.count -= minCount; // 更新 b 的操作描述对象，更新 b 原本想要删除的字符的数量，从原来的 count 中减
      // 接下来仍然是判断字符是否已经处理完毕，如果已经处理完毕，就需要移动指针，跳到下一个操作
      if (op1.count === 0) i++; // 如果 a 的操作已经处理完毕，就需要跳到下一个操作
      if (op2.count === 0) j++; // 如果 b 的操作已经处理完毕，就需要跳到下一个操作
      continue; // 继续下一个循环
    }

    if (op1 && op1.type === "delete" && op2 && op2.type === "delete") {
      // 举个例子：用户A {type:'delete', count: 5}, 用户B {type: 'delete', count: 3}
      // 那么这里就取公共最小值：3
      // 对于用户A而言，删除了3个字符后，我当前的这个操作描述对象的count还没有处理完毕
      // 因此用户A的操作描述对象就变成了 {type:'delete', count: 2}
      // 对于用户B而言，因为当前操作的count数已经为0，那么就跳转到下一个操作描述对象
      const minCount = Math.min(op1.count, op2.count); // 取出最小的删除长度
      op1.count -= minCount; // 更新 a 的操作描述对象
      op2.count -= minCount; // 更新 b 的操作描述对象
      if (op1.count === 0) i++; // 如果 a 的操作已经处理完毕，就需要跳到下一个操作
      if (op2.count === 0) j++; // 如果 b 的操作已经处理完毕，就需要跳到下一个操作
      continue; // 继续下一个循环
    }

    if (op1 && op1.type === "insert" && op2 && op2.type === "delete") {
      // 进入此分支，说明用户A要插入一部分字符，用户B要删除一部分字符
      aPrime.insert(op1.value);
      bPrime.retain(op1.value.length); // 让B的删除操作跳过A插入的字符
      i++; // 更新用户A的操作列表，跳到下一个操作
      continue; // 继续下一个循环
    }

    if (op1 && op1.type === "delete" && op2 && op2.type === "insert") {
      // 进入此分支，说明用户A要删除一部分字符，用户B要插入一部分字符
      bPrime.insert(op2.value);
      aPrime.retain(op2.value.length); // 让A的删除操作跳过B插入的字符
      j++; // 更新用户B的操作列表，跳到下一个操作
      continue; // 继续下一个循环
    }

    throw new Error("未知的操作组合"); // 如果没有匹配到上面的任何操作，就抛出一个错误
  }

  return [aPrime, bPrime]; // 返回转换后的操作描述对象
}

module.exports = {
  transfrom,
};
