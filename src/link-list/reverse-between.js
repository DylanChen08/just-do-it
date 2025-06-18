/* 
代码
测试用例
测试用例
测试结果
92. 反转链表 II
中等
相关标签
premium lock icon
相关企业
给你单链表的头指针 head 和两个整数 left 和 right ，其中 left <= right 。请你反转从位置 left 到位置 right 的链表节点，返回 反转后的链表 。
 

示例 1：


输入：head = [1,2,3,4,5], left = 2, right = 4
输出：[1,4,3,2,5]
示例 2：

输入：head = [5], left = 1, right = 1
输出：[5]
 

提示：

链表中节点数目为 n
1 <= n <= 500
-500 <= Node.val <= 500
1 <= left <= right <= n
 

进阶： 你可以使用一趟扫描完成反转吗？ */


// https://leetcode.cn/problems/reverse-linked-list-ii/description/

const reverseBetween = function(head, left, right) {
    if (!head || left === right) return head;

    // 虚拟头结点，简化头部操作
    let dummy = new ListNode(0, head);
    let prev = dummy;

    // 1. 找到 left 节点的前一个节点 prev
    for (let i = 1; i < left; i++) {
        prev = prev.next;
    }

    // 2. 从 left 开始，原地反转 right-left+1 个节点
    let curr = prev.next;
    let next = null;

    for (let i = 0; i < right - left; i++) {
        next = curr.next;
        curr.next = next.next;
        next.next = prev.next;
        prev.next = next;
    }

    return dummy.next;
};