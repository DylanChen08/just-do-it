// 206. 反转链表
// 简单
// 相关标签
// premium lock icon
// 相关企业
// 给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。
 

// 示例 1：


// 输入：head = [1,2,3,4,5]
// 输出：[5,4,3,2,1]
// 示例 2：


// 输入：head = [1,2]
// 输出：[2,1]
// 示例 3：

// 输入：head = []
// 输出：[]
 

// 提示：

// 链表中节点的数目范围是 [0, 5000]
// -5000 <= Node.val <= 5000
 

// 进阶：链表可以选用迭代或递归方式完成反转。你能否用两种方法解决这道题？



// https://leetcode.cn/problems/reverse-linked-list/description/





const reverseList = function(head) {
    // base case：链表为空或只有一个节点
    if (head === null || head.next === null) {
        return head;
    }

    let newHead = reverseList(head.next); // 反转后面

    head.next.next = head; // 反转当前节点
    head.next = null;      // 当前节点变尾巴

    return newHead; // 返回新头结点
};




