// LCR 126. 斐波那契数
// 简单
// 相关标签
// premium lock icon
// 相关企业
// 斐波那契数 （通常用 F(n) 表示）形成的序列称为 斐波那契数列 。该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。也就是：

// F(0) = 0，F(1) = 1
// F(n) = F(n - 1) + F(n - 2)，其中 n > 1
// 给定 n ，请计算 F(n) 。

// 答案需要取模 1e9+7(1000000007) ，如计算初始结果为：1000000008，请返回 1。

 

// 示例 1：

// 输入：n = 2
// 输出：1
// 解释：F(2) = F(1) + F(0) = 1 + 0 = 1
// 示例 2：

// 输入：n = 3
// 输出：2
// 解释：F(3) = F(2) + F(1) = 1 + 1 = 2
// 示例 3：

// 输入：n = 4
// 输出：3
// 解释：F(4) = F(3) + F(2) = 2 + 1 = 3
 

// 提示：

// 0 <= n <= 100


const fib = (n) => {
    const MOD = 1e9 + 7;
    if (n < 2) return n;
  
    // ✅ 创建一个长度为 n + 1 的数组 result，并初始化前两个斐波那契值 F(0) = 0、F(1) = 1，其余位置用 null 占位。
    const result = Array.from({ length: n + 1 }, (_, i) => {
      if (i === 0) return 0;
      if (i === 1) return 1;
      return null; // 占位
    });

    // 从 i = 2 开始，一直到 i = n，依次填充斐波那契数组 result[i] = F(i)。
    for (const i of [...Array(n - 1).keys()].map(i => i + 2)) {
      result[i] = (result[i - 1] + result[i - 2]) % MOD;
    }
  
    return result[n];
  };