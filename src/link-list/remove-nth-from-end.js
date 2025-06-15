/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */

// https://leetcode.cn/problems/remove-nth-node-from-end-of-list/description/

const removeNthFromEnd = function(head, n) {
    // 创建一个虚拟头节点 dummy，next 指向 head
    // dummy 作为哨兵节点，可以简化删除操作，尤其当要删的是第一个节点时
    let dummy = new ListNode(-1);
    dummy.next = head;

    // 初始化两个指针，fast 和 slow 都指向 dummy
    // 这样保证 fast 提前走 n+1 步之后，slow 能停在目标节点的前一个位置
    let fast = dummy;
    let slow = dummy;

    // 先让 fast 前进 n+1 步（为了让 slow 停在要删除节点的前一个）
    // 为什么是 n+1？因为 slow 要停在要删除节点的“前一个”节点上
    for (let i = 0; i <= n; i++) {
        fast = fast.next;
    }

    // 然后 fast 和 slow 一起向前走，直到 fast 到达末尾
    // 此时 slow 到达目标节点的前一个
    while (fast !== null) {
        fast = fast.next;
        slow = slow.next;
    }

    // 1 → 2 → 3 → 4 → 5
    // 我们想删除数字 3。

    // 假设 slow 现在指向的是节点 2，也就是说：
    // slow      slow.next       slow.next.next
    // ↓           ↓                 ↓
    // [2]   →     [3]     →         [4]

    // 🔁 不是用 slow = slow.next.next; 的原因
    // 如果你写 slow = slow.next.next;，只是改变了 slow 指针的位置，链表本身没有被改动，你没有删掉任何节点。

    // 此时 slow 的下一个节点就是要删除的目标
    // 所以我们只要“跳过”这个节点，链表就完成了删除
    slow.next = slow.next.next;

    // 返回新的头节点（跳过 dummy）
    return dummy.next;
};
