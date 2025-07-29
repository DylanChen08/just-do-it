/* 面试题 08.06. 汉诺塔问题
简单
相关标签
premium lock icon
相关企业
提示
在经典汉诺塔问题中，有 3 根柱子及 N 个不同大小的穿孔圆盘，盘子可以滑入任意一根柱子。一开始，所有盘子自上而下按升序依次套在第一根柱子上(即每一个盘子只能放在更大的盘子上面)。移动圆盘时受到以下限制:
(1) 每次只能移动一个盘子;
(2) 盘子只能从柱子顶端滑出移到下一根柱子;
(3) 盘子只能叠在比它大的盘子上。

请编写程序，用栈将所有盘子从第一根柱子移到最后一根柱子。

你需要原地修改栈。

示例 1：

 输入：A = [2, 1, 0], B = [], C = []
 输出：C = [2, 1, 0]
示例 2：

 输入：A = [1, 0], B = [], C = []
 输出：C = [1, 0]
提示：

A 中盘子的数目不大于 14 个。 */

// https://leetcode.cn/problems/hanota-lcci/

const hanota = function (A, B, C) {
    function move(n, source, buffer, target) {
        if (n === 1) {
            // 只剩一个盘子，直接移动到目标柱子
            target.push(source.pop());
        } else {
            // 先将前 n-1 个盘子移动到缓冲柱子
            move(n - 1, source, target, buffer);
            // 将第 n 个盘子移动到目标柱子
            target.push(source.pop());
            // 将缓冲柱子的 n-1 个盘子移动到目标柱子
            move(n - 1, buffer, source, target);
        }
    }

    move(A.length, A, B, C);
}