// 83 题（保留一个）：
// 输入：[1,1,2,3,3]
// 输出：[1,2,3]
// 👉 重复的 1 和 3 各保留一个

// 82 题（全部删掉重复的）：
// 输入：[1,1,2,3,3]
// 输出：[2]
// 👉 重复的 1 和 3 全部被删掉，只留下不重复的 2





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
const deleteDuplicates = function (head) {
    // 创建虚拟头节点，防止头节点本身被删时不好处理
    let dummy = new ListNode(-1);
    dummy.next = head;

    // prev 是前一个不重复的节点
    let prev = dummy;
    let current = head;

    while (current !== null) {
        // 检查是否有重复值
        if (current.next !== null && current.val === current.next.val) {
            // 存下当前的值（重复的值）
            let duplicateVal = current.val;
            // 跳过所有值为 duplicateVal 的节点
            while (current !== null && current.val === duplicateVal) {
                current = current.next;
            }
            // 将 prev.next 指向不重复的下一个节点
            prev.next = current;
        } else {
            // 如果当前节点没有重复，prev 往前移动
            prev = prev.next;
            current = current.next;
        }
    }

    // 返回真正的新链表头
    return dummy.next;
}