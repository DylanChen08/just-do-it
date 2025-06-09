/* 
代码
测试用例
测试结果
测试结果
876. 链表的中间结点
简单
相关标签
premium lock icon
相关企业
给你单链表的头结点 head ，请你找出并返回链表的中间结点。

如果有两个中间结点，则返回第二个中间结点。

 

示例 1：


输入：head = [1,2,3,4,5]
输出：[3,4,5]
解释：链表只有一个中间结点，值为 3 。
示例 2：


输入：head = [1,2,3,4,5,6]
输出：[4,5,6]
解释：该链表有两个中间结点，值分别为 3 和 4 ，返回第二个结点。
 

提示：

链表的结点数范围是 [1, 100]
1 <= Node.val <= 100 */


const middleNode = (head) => {
    // ✅ 初始化两个指针，起点都在链表头部
    // slow 每次走 1 步，fast 每次走 2 步
    let slow = head;
    let fast = head;

    // ✅ 循环条件：只要 fast 和 fast.next 不为 null，就继续向前移动
    // 说明 fast 还能再向前跳两步（即链表还没走完）
    while (fast && fast.next) {
        // 🐢 slow 向前移动一步（每次只走一个节点）
        slow = slow.next;

        // 🐇 fast 向前移动两步（每次跳过一个节点）
        fast = fast.next.next;

        // 🧠 由于 fast 每次走得比 slow 快一倍
        // 当 fast 走到链表末尾时，slow 正好走到链表的中间位置
    }

    // ✅ 当循环结束时，slow 正好指向链表中间的节点（目标节点）
    return slow;
};
