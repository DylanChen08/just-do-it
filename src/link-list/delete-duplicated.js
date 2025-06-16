/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
const deleteDuplicates = function(head) {
    // 如果链表为空或只有一个节点，直接返回
    if (head === null || head.next === null) return head;

    // 当前节点指针
    let current = head;

    // 遍历整个链表
    while (current !== null && current.next !== null) {
        if (current.val === current.next.val) {
            // 如果当前节点和下一个节点值相同，跳过下一个节点
            current.next = current.next.next;
        } else {
            // 否则，向后移动 current
            current = current.next;
        }
    }

    // 返回处理后的链表头
    
    return head;
};
