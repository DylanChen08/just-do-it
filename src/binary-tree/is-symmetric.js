/* 101. 对称二叉树
简单
相关标签
premium lock icon
相关企业
给你一个二叉树的根节点 root ， 检查它是否轴对称。

 

示例 1：


输入：root = [1,2,2,3,4,4,3]
输出：true
示例 2：


输入：root = [1,2,2,null,3,null,3]
输出：false
 

提示：

树中节点数目在范围 [1, 1000] 内
-100 <= Node.val <= 100
 

进阶：你可以运用递归和迭代两种方法解决这个问题吗？ */




// https://leetcode.cn/problems/symmetric-tree/description/




const isSymmetric = function(root) {
    if (!root) return true;

    function isMirror(t1, t2) {
        if (!t1 && !t2) return true;
        if (!t1 || !t2) return false;
        return (t1.val === t2.val) 
            && isMirror(t1.left, t2.right) 
            && isMirror(t1.right, t2.left);
    }

    return isMirror(root.left, root.right);
};



const isSymmetric2 = function(root) {
    if (!root) return true;

    let queue = [root.left, root.right];

    while (queue.length > 0) {
        let t1 = queue.shift();
        let t2 = queue.shift();

        if (!t1 && !t2) continue;
        if (!t1 || !t2) return false;
        if (t1.val !== t2.val) return false;

        // 按照对称顺序入队
        queue.push(t1.left);
        queue.push(t2.right);
        queue.push(t1.right);
        queue.push(t2.left);
    }
    return true;
};