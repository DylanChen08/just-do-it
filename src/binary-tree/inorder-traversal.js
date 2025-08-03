
/* 
94. 二叉树的中序遍历
简单
相关标签
premium lock icon
相关企业
给定一个二叉树的根节点 root ，返回 它的 中序 遍历 。

 

示例 1：


输入：root = [1,null,2,3]
输出：[1,3,2]
示例 2：

输入：root = []
输出：[]
示例 3：

输入：root = [1]
输出：[1]
 

提示：

树中节点数目在范围 [0, 100] 内
-100 <= Node.val <= 100
 
*/

// 中序 = 左 → 根 → 右

// https://leetcode.cn/problems/binary-tree-inorder-traversal/


const inorderTraversal = function(root) {
    const result = [];
    const stack = [];
    let current = root;

    while (current || stack.length) {
        while (current) {
            stack.push(current);        // 一直往左走，把所有左节点压栈
            current = current.left;
        }
        current = stack.pop();          // 左到底了，出栈的是“根”
        result.push(current.val);          // 访问“根”
        current = current.right;        // 然后去遍历“右”
    }

    return result;
};