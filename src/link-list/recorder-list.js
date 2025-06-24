/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

/**
 * @param {ListNode} head
 * @return {void}  // Do not return anything, modify head in-place instead.
 */
const reorderList = function(head) {
    if (!head || !head.next || !head.next.next) return;

    // 1. 快慢指针找中点
    let slow = head;
    let fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // 2. 反转后半部分
    let prev = null;
    let curr = slow.next;
    while (curr) {
        let next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }

    // 断开中点后面，防止成环
    slow.next = null;

    // 3. 交错合并两部分
    let first = head;
    let second = prev;
    while (second) {
        // | 行号                       | 作用                          |
        // | ------------------------ | --------------------------- |
        // | `let tmp1 = first.next`  | 保存 `first` 后面的位置（即下一轮合并的起点） |
        // | `let tmp2 = second.next` | 保存 `second` 后面的位置，防止链丢失     |
        // | `first.next = second`    | 把当前 second 插到当前 first 后面    |
        // | `second.next = tmp1`     | 把 second 和原 first 的下一个重新连上  |
        // | `first = tmp1`           | first 往前走一步                 |
        // | `second = tmp2`          | second 往前走一步                |
        

        let tmp1 = first.next;
        let tmp2 = second.next;

        first.next = second;
        second.next = tmp1;

        first = tmp1;
        second = tmp2;
    }
};
