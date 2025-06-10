/* 
代码
测试用例
测试结果
测试结果
面试题 02.02. 返回倒数第 k 个节点
简单
相关标签
premium lock icon
相关企业
提示
实现一种算法，找出单向链表中倒数第 k 个节点。返回该节点的值。

注意：本题相对原题稍作改动

示例：

输入： 1->2->3->4->5 和 k = 2
输出： 4
说明：

给定的 k 保证是有效的。 */

// https://leetcode.cn/problems/kth-node-from-end-of-list-lcci/description/

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {number}
 */

const kthToLast = function (head, k) {
    // 使用双指针法
    let fast = head;
    let slow = head;
    
    // 让快指针先走k步
    for (let i = 0; i < k; i++) {
        fast = fast.next;
    }
    
    // 快慢指针一起移动，直到快指针到达末尾
    while (fast) {
        fast = fast.next;
        slow = slow.next;
    }
    
    // 此时slow指向倒数第k个节点，返回该节点的值
    return slow.val;
}


// 测试用例

// 构建链表：a -> b -> c -> d -> e
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

const a = new ListNode('a');
const b = new ListNode('b');
const c = new ListNode('c');
const d = new ListNode('d');
const e = new ListNode('e');
a.next = b;
b.next = c;
c.next = d;
d.next = e;

// 测试
console.log(kthToLast(a, 1)); // e
console.log(kthToLast(a, 2)); // d
console.log(kthToLast(a, 3)); // c
console.log(kthToLast(a, 4)); // b
console.log(kthToLast(a, 5)); // a
