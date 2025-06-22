/* 445. 两数相加 II
中等
相关标签
premium lock icon
相关企业
给你两个 非空 链表来代表两个非负整数。数字最高位位于链表开始位置。它们的每个节点只存储一位数字。将这两数相加会返回一个新的链表。

你可以假设除了数字 0 之外，这两个数字都不会以零开头。

 

示例1：



输入：l1 = [7,2,4,3], l2 = [5,6,4]
输出：[7,8,0,7]
示例2：

输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[8,0,7]
示例3：

输入：l1 = [0], l2 = [0]
输出：[0]
 

提示：

链表的长度范围为 [1, 100]
0 <= node.val <= 9
输入数据保证链表代表的数字无前导 0
 

进阶：如果输入链表不能翻转该如何解决？ */


// https://leetcode.cn/problems/add-two-numbers-ii/description/





/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
const addTwoNumbers = function(l1, l2) {
    const stack1 = [];
    const stack2 = [];

    // 1. 将两个链表的值压入栈中
    while (l1) {
        stack1.push(l1.val);
        l1 = l1.next;
    }
    while (l2) {
        stack2.push(l2.val);
        l2 = l2.next;
    }

    let carry = 0;
    let result = null;

    // 2. 模拟加法过程（从栈顶向下加）
    while (stack1.length > 0 || stack2.length > 0 || carry !== 0) {
        const x = stack1.length > 0 ? stack1.pop() : 0;
        const y = stack2.length > 0 ? stack2.pop() : 0;
        const sum = x + y + carry;

        carry = Math.floor(sum / 10);

        // 头插法构建链表
        const node = new ListNode(sum % 10);
        node.next = result;
        result = node;
    }

    return result;
};