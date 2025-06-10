const detectCycle = function(head) {
    let slow = head;
    let fast = head;

    // 第一步：使用快慢指针判断是否有环
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;

        // 相遇了，说明有环
        if (slow === fast) {
            // 第二步：找环的入口点
            let ptr = head;
            while (ptr !== slow) {
                ptr = ptr.next;
                slow = slow.next;
            }
            return ptr; // ptr 就是入环点
        }
    }

    // 如果没有环，返回 null
    return null;
};
