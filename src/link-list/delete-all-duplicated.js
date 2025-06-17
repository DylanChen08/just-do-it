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
    // ✅ 创建虚拟头节点 dummy，防止头节点被删不好处理
    // dummy 是一个哨兵节点，避免删除头节点时处理过于繁琐
    let dummy = new ListNode(-1);
    dummy.next = head;

    // ✅ prev 表示上一个“确认保留”的节点（最开始是 dummy）
    let prev = dummy;

    // ✅ current 是遍历用的指针
    let current = head;

    // ⛳️ 一直遍历到链表末尾
    while (current !== null) {
        // ✅ 检查当前节点与下一个节点是否值相等 —— 说明是重复的
        if (current.next !== null && current.val === current.next.val) {
            // ✅ 存下重复的值，准备跳过所有重复节点
            let duplicateVal = current.val;

            // ⛳️ 易错点 ❶：这段循环是“跳过所有值等于 duplicateVal 的节点”
            // current 最终将停在第一个不等于 duplicateVal 的节点
            // ⚠️ 一定记得在循环条件中加 current !== null，避免空指针报错
            while (current !== null && current.val === duplicateVal) {
                current = current.next; 
            }

            // ✅ 易错点 ❷：千万不要写 prev = current!
            // ❌ prev = current 只是移动指针，没有真正“删除节点”
            // ✅ 正确做法是：跳过中间那段重复的节点，连接不重复的部分
            // ❗ prev.next 是链表操作真正的“删除动作” —— 把重复区段全部跳过
            prev.next = current;

        } else {
            // ✅ 如果当前节点不是重复的，prev 和 current 同时往前走
            // ✅ 易错点 ❸：不要只移动 current 而不动 prev，会导致链表断开
            prev = prev.next;
            current = current.next;
        }
    }

    // ✅ 返回 dummy.next（真正的头节点）
    return dummy.next;
};

