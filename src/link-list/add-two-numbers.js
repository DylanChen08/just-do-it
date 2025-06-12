// 给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。

// 请你将两个数相加，并以相同形式返回一个表示和的链表。

// 你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

 

// 示例 1：


// 输入：l1 = [2,4,3], l2 = [5,6,4]
// 输出：[7,0,8]
// 解释：342 + 465 = 807.
// 示例 2：

// 输入：l1 = [0], l2 = [0]
// 输出：[0]
// 示例 3：

// 输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
// 输出：[8,9,9,9,0,0,0,1]
 

// 提示：

// 每个链表中的节点数在范围 [1, 100] 内
// 0 <= Node.val <= 9
// 题目数据保证列表表示的数字不含前导零




const addTwoNumbers = function(l1, l2) {
    // 虚拟头节点，方便返回结果链表的头
    let dummy = new ListNode(-1);
    let current = dummy;

    // 初始化进位 carry
    let carry = 0;

    // 遍历两个链表，直到两个都为空
    while (l1 !== null || l2 !== null) {
        // 如果当前链表为空，则值设为 0
        let val1 = l1 !== null ? l1.val : 0;
        let val2 = l2 !== null ? l2.val : 0;

        // 加上进位
        let sum = val1 + val2 + carry;

        // 当前位的值：对10取模
        let digit = sum % 10;

        // 更新进位
        carry = Math.floor(sum / 10);

        // 创建新节点连接到结果链表
        current.next = new ListNode(digit);
        current = current.next;

        // 向后移动两个链表指针
        if (l1 !== null) l1 = l1.next;
        if (l2 !== null) l2 = l2.next;
    }

    // 最后还有进位要处理（比如 9+1=10）
    if (carry > 0) {
        current.next = new ListNode(carry);
    }

    // 返回真正的头节点（跳过 dummy）
    return dummy.next;
};
