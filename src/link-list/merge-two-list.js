const mergeTwoLists = function(l1, l2) {
    // 创建一个虚拟头节点，方便操作
    let dummy = new ListNode(-1);
    let current = dummy;

    // 遍历两个链表，比较大小，小的先连到新链表上
    while (l1 !== null && l2 !== null) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }

    // 把剩余的链表接上去（此时最多只剩下一个链表）
    current.next = l1 !== null ? l1 : l2;

    // 返回 dummy.next，也就是新链表的头节点
    return dummy.next;
};
