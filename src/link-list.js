// 定义节点类
class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

// 定义链表类
class LinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }

    // 获取指定位置的节点值
    get(index) {
        // ✅ 第一步：边界检查
        // 如果 index 小于 0，或者大于等于链表长度（即不存在这个位置）
        // 则返回 null，表示无效访问
        if (index < 0 || index >= this.length) return null;
    
        // ✅ 第二步：定义 current 指针，用于从头节点开始遍历链表
        // ⚠️ 注意：this.head 是链表的起点，也就是第 0 个节点
        let current = this.head;
    
        // ✅ 第三步：通过循环找到第 index 个节点
        // 初始化一个计数器 i，从 0 开始
        let i = 0;
    
        // 当 i < index 时，就向后跳一个节点
        // 每执行一次循环，相当于向后走一步（current = current.next）
        while (i < index) {
            current = current.next; // ⭐️ current 向后跳一个节点
            i++;                    // 计数器加 1
        }
    
        // 循环结束时：i === index，current 指向我们要找的目标节点
    
        // ✅ 第四步：返回目标节点的值
        return current.value;
    }
    

    // 在指定位置插入节点（支持在末尾插入）
    insert(index, value) {
        // 如果插入位置不合法（负数或超出长度），直接返回 false
        if (index < 0 || index > this.length) return false;
    
        // 创建新节点，包含插入的 value
        const newNode = new ListNode(value);
    
        if (index === 0) {
            // 👉 插入到头部的特殊处理：
            // 1. 把当前 head（原来的第一个节点）赋给 newNode.next，接上原来的链表
            newNode.next = this.head;
            // 2. 更新 head，使其指向新节点，也就是把新节点放到最前面
            this.head = newNode;
        } else {
            // 👉 插入到中间或尾部：
            // 1. 找到前一个节点（插入位置 index 的前一个位置 index - 1）
            let prev = this.head;
            let i = 0;
            while (i < index - 1) {
                prev = prev.next;
                i++;
            }
    
            // 2. 将前一个节点的 next（即原来指向后一个节点）赋给 newNode.next
            //    👉 此步确保新节点仍能连上链表后方，避免断链
            newNode.next = prev.next;
    
            // 3. 然后将 newNode 赋值给 prev.next，相当于把新节点插在中间
            //    👉 此步完成真正的“插入”：前节点指向新节点，链表结构完整衔接
            prev.next = newNode;
        }
    
        // 链表长度 +1
        this.length++;
        return true;
    }
    

    // 修改指定位置的节点值
    update(index, value) {
        // ✅ 1. 检查 index 是否越界，非法则直接返回 false
        if (index < 0 || index >= this.length) return false;
    
        // ✅ 2. 初始化 current 指针，用于从链表头开始遍历
        // ⚠️ this.head 代表的是链表的起点（第 0 个节点），不是 index 对应位置的头
        let current = this.head;
    
        // ✅ 3. 从头节点开始，逐步往后走 index 次，定位到目标节点
        let i = 0;
        while (i < index) {
            // ⭐️ current = current.next：
            // 将 current 指针跳转到下一个节点，相当于“向后走一步”
            // 每执行一次，就向链表后面移动一格
            current = current.next;
            i++;
        }
        // 🧠 循环结束时，i === index，current 指向了目标节点
        // 也就是说，我们已经跳了 index 次，准确落在目标位置
    
        // ✅ 4. 对目标节点的值进行更新
        current.value = value;
    
        // ✅ 5. 更新成功，返回 true
        return true;
    }
    

    // 删除指定位置的节点
    remove(index) {
        // 🧱 步骤 1：边界检查，确保 index 合法
        // 如果 index 小于 0，或大于等于链表长度（越界），返回 false，防止非法访问
        if (index < 0 || index >= this.length) return false;
    
        // 🧱 步骤 2：特殊情况 - 删除头节点（第 0 个）
        if (index === 0) {
            // 直接将 head 指向原头节点的下一个节点，相当于跳过第一个节点
            this.head = this.head.next;
        } else {
            // 🧱 步骤 3：常规情况 - 删除中间或尾部节点
    
            // 初始化指针 prev，指向链表头
            let prev = this.head;
    
            // 遍历到 index - 1 位置，即找到要删除节点的前一个节点
            let i = 0;
            while (i < index - 1) {
                prev = prev.next;
                i++;
            }
    
            // 🧠 核心逻辑：
            // 让前一个节点的 next 指向它原本 next 的 next（即跳过要删除的节点）
            // 示例：prev -> [X] -> [Y] -> [Z]
            //        删除 Y，就变成：prev -> [X] -> [Z]
            prev.next = prev.next.next;
        }
    
        // 🧱 步骤 4：链表长度 -1
        this.length--;
    
        // 删除成功，返回 true
        return true;
    }
    

    // 获取链表长度
    getLength() {
        return this.length;
    }

    // 打印链表（辅助调试）
    print() {
        let output = [];
        let current = this.head;
        while (current) {
            output.push(current.value);
            current = current.next;
        }
        console.log(output.join(' -> '));
    }
}


const list = new LinkedList();

list.insert(0, 'a'); // a
list.insert(1, 'b'); // a -> b
list.insert(1, 'c'); // a -> c -> b
list.print();

console.log('值:', list.get(1)); // c

list.update(1, 'x'); // a -> x -> b
list.print();

list.remove(0); // x -> b
list.print();

console.log('长度:', list.getLength()); // 2
