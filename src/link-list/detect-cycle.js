const detectCycle = function(head) {
    // 初始化两个指针，slow 每次走一步，fast 每次走两步
    let slow = head;
    let fast = head;

    // 第一步：使用快慢指针判断链表中是否存在环
    while (fast && fast.next) {
        slow = slow.next;        // 慢指针走一步
        fast = fast.next.next;   // 快指针走两步

        // 如果快慢指针相遇了，说明链表中存在环
        if (slow === fast) {
            // 第二步：找出环的入口点（也就是从哪里开始进入环）

            // 新建一个指针 ptr，从链表头开始走
            // 为什么从头走？因为从 head 到入口的距离是 a（非环部分）
            let ptr = head;

            // 此时 slow 在环中某处（第一次相遇点），
            // 根据数学推导：从 head 出发走 a 步、从相遇点出发走 c 步，会在 entry 节点相遇
            // 所以我们每次都让 ptr 和 slow 各走一步，直到相遇，相遇点就是环的入口
            while (ptr !== slow) {
                ptr = ptr.next;   // 从头走一步
                slow = slow.next; // 从相遇点走一步
            }

            // ptr 和 slow 相遇了，这个相遇点就是环的入口
            return ptr;
        }
    }

    // 如果循环结束也没相遇，说明 fast 指针走到了链表末尾（没有环）
    return null;
};
