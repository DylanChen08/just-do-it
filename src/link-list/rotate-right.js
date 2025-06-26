// 给你一个链表的头节点 head ，旋转链表，将链表每个节点向右移动 k 个位置。

 

// 示例 1：


// 输入：head = [1,2,3,4,5], k = 2
// 输出：[4,5,1,2,3]
// 示例 2：


// 输入：head = [0,1,2], k = 4
// 输出：[2,0,1]
 

// 提示：

// 链表中节点的数目在范围 [0, 500] 内
// -100 <= Node.val <= 100
// 0 <= k <= 2 * 109



// https://leetcode.cn/problems/rotate-list/

const rotateRight = (head, k) => {
    if (!head || !head.next || k === 0) return head;

    // 1. 统计链表长度
    let len = 1;
    let tail = head;
    while (tail.next) {
        tail = tail.next;
        len++;
    }

    // 2. 计算真正移动的步数
    k = k % len;
    if (k === 0) return head;

    // 3. 找到新尾部的位置
    let stepsToNewTail = len - k;
    let newTail = head;
    for (let i = 1; i < stepsToNewTail; i++) {
        newTail = newTail.next;
    }

    // 4. 新的头和断链操作
    let newHead = newTail.next;
    newTail.next = null;
    tail.next = head;

    return newHead;
}