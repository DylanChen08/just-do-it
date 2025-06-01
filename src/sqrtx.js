/* 
代码
测试用例
测试结果
测试结果
69. x 的平方根 
简单
相关标签
premium lock icon
相关企业
提示
给你一个非负整数 x ，计算并返回 x 的 算术平方根 。

由于返回类型是整数，结果只保留 整数部分 ，小数部分将被 舍去 。

注意：不允许使用任何内置指数函数和算符，例如 pow(x, 0.5) 或者 x ** 0.5 。

 

示例 1：

输入：x = 4
输出：2
示例 2：

输入：x = 8
输出：2
解释：8 的算术平方根是 2.82842..., 由于返回类型是整数，小数部分将被舍去。
 

提示：

0 <= x <= 231 - 1 */


// https://leetcode.cn/problems/sqrtx/description/


const mySqrt = function (x) {
    // 初始化左右边界：平方根一定在 0 到 x 之间
    let left = 0;
    let right = x;

    // 二分查找的循环条件：只要 left <= right 就继续
    while (left <= right) {
        // 取中间位置，用于判断当前猜测的平方根
        let mid = Math.floor((left + right) / 2);

        // 👉 判断 mid 的平方是否等于 x
        // 这是最理想情况，刚好找到了整数平方根
        if (mid * mid === x) {
            return mid; // 直接返回
        }

        // 👉 mid * mid < x，说明 mid 太小
        // 我们要去更大的数里找，因此把 left 往右移动
        else if (mid * mid < x) {
            left = mid + 1;
        }

        // 👉 mid * mid > x，说明 mid 太大
        // 我们要去更小的数里找，因此把 right 往左移动
        else {
            right = mid - 1;
        }

        // 💡 注意：这里每次都只用 mid 来做平方判断，而不是去判断 left * left 或 right * right
        // 原因如下：
        // 1. mid 是当前查找区间 [left, right] 的中点，是二分的核心；
        // 2. 只用 mid 判断可以明确知道该往哪一侧缩小区间；
        // 3. 如果用 left 和 right 分别判断，会逻辑混乱、效率低、容易错过正确值；
        // 4. 二分查找的本质就是每次通过中点来“折半”缩小区间，保持 O(log n) 的高效率；
    }

    // 👈 循环结束后，说明没有刚好等于 x 的整数平方根
    // 此时 right 会停在“mid * mid <= x”的最大整数上
    // 所以返回 right 就是 x 的平方根（取整数部分，向下取整）
    return right;
}

// ✅ 示例：mySqrt(4) => 2，因为 2 * 2 = 4
console.log(mySqrt(4));

