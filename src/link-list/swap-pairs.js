// 24. 两两交换链表中的节点
// 中等
// 相关标签
// premium lock icon
// 相关企业
// 给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

 

// 示例 1：


// 输入：head = [1,2,3,4]
// 输出：[2,1,4,3]
// 示例 2：

// 输入：head = []
// 输出：[]
// 示例 3：

// 输入：head = [1]
// 输出：[1]
 

// 提示：

// 链表中节点的数目在范围 [0, 100] 内
// 0 <= Node.val <= 100

// https://leetcode.cn/problems/swap-nodes-in-pairs/description/

var swapPairs = function(head) {
    let dummy = new ListNode(0);
    dummy.next = head;

    let prev = dummy;

    while (prev.next && prev.next.next) {
        let a = prev.next;        // 第一个节点
        let b = a.next;           // 第二个节点

        // 交换 a 和 b
        prev.next = b;
        a.next = b.next;
        b.next = a;

        // 移动 prev，准备下一对
        prev = a;
    }

    return dummy.next;
};
