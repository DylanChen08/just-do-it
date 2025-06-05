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
        if (index < 0 || index >= this.length) return null;
        let current = this.head;
        let i = 0;
        while (i < index) {
            current = current.next;
            i++;
        }
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
        if (index < 0 || index >= this.length) return false;
        let current = this.head;
        let i = 0;
        while (i < index) {
            current = current.next;
            i++;
        }
        current.value = value;
        return true;
    }

    // 删除指定位置的节点
    remove(index) {
        if (index < 0 || index >= this.length) return false;
        if (index === 0) {
            this.head = this.head.next;
        } else {
            let prev = this.head;
            let i = 0;
            while (i < index - 1) {
                prev = prev.next;
                i++;
            }
            prev.next = prev.next.next;
        }
        this.length--;
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
