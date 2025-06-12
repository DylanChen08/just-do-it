// https://leetcode.cn/problems/merge-two-sorted-lists/

const mergeTwoLists = function(l1, l2) {
    // 创建一个虚拟头节点 dummy，它不是真正的链表数据，只是为了简化拼接逻辑
    // 例如我们不需要特判“第一个节点是谁”
    let dummy = new ListNode(-1);

    // current 是一个指针，指向新链表的“尾部”，我们将不断把更小的节点接到 current 后面
    let current = dummy;

    // 当两个链表都还没走完时（都有节点）
    while (l1 !== null && l2 !== null) {
        // 比较当前两个链表的节点值，谁小就先接谁
        if (l1.val <= l2.val) {
            // l1 的值小，说明它应该排在前面
            current.next = l1; // 把 l1 当前节点接到新链表的尾部
            l1 = l1.next;      // l1 往后走一步（相当于“再看看它的下一个”）
        } else {
            // l2 更小，接上 l2 的节点
            current.next = l2;
            l2 = l2.next;
        }

        // 不管接的是谁，current 都往后移一格，保持在“新链表的最后一个节点”
        current = current.next;
    }

    // 这里 while 循环结束了，说明其中一个链表已经走到头（为 null）
    // 而另一个链表可能还剩下一段没用完，直接把它接到 current 后面就行
    // 因为两个链表本身就是升序，剩下的那段本来也排好序
    current.next = l1 !== null ? l1 : l2;

    // 返回真正的头节点（跳过 dummy），即 dummy.next 是第一个有效节点
    return dummy.next;
};
