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
    // 创建一个虚拟头节点 dummy，方便统一处理头节点逻辑
    // 最后我们返回 dummy.next 作为最终结果的头节点
    let dummy = new ListNode(-1);
    let current = dummy; // current 用来构建结果链表

    // carry 表示每一位相加后的进位值，初始为 0
    let carry = 0;

    // 遍历两个链表，只要还有未处理的节点就继续
    while (l1 !== null || l2 !== null) {
        // 如果某个链表已经到头，就把对应的值设为 0
        let val1 = l1 !== null ? l1.val : 0;
        let val2 = l2 !== null ? l2.val : 0;

        // 把两个节点的值以及上一次的进位值加在一起
        let sum = val1 + val2 + carry;

        // digit 是当前位的结果值 —— 只能保留个位数（因为每个节点只能存 0~9）
        let digit = sum % 10;

        // 更新进位：如果 sum >= 10，就产生进位（否则 carry = 0）
        carry = Math.floor(sum / 10);

        // 把当前计算出来的 digit 存入结果链表中
        current.next = new ListNode(digit);

        // current 指针向后移动一位，继续构建下一位
        current = current.next;

        // 分别将 l1 和 l2 向后移动一位（如果它们还有节点）
        if (l1 !== null) l1 = l1.next;
        if (l2 !== null) l2 = l2.next;
    }

    // 处理最后可能存在的进位（例如 9 + 1 = 10，最后要补 1）
    if (carry > 0) {
        current.next = new ListNode(carry);
    }

    // dummy 是虚拟头节点，dummy.next 才是真正的结果头节点
    return dummy.next;
};

