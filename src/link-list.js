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
        if (index < 0 || index > this.length) return false;
        const newNode = new ListNode(value);
        if (index === 0) {
            newNode.next = this.head;
            this.head = newNode;
        } else {
            let prev = this.head;
            let i = 0;
            while (i < index - 1) {
                prev = prev.next;
                i++;
            }
            newNode.next = prev.next;
            prev.next = newNode;
        }
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
