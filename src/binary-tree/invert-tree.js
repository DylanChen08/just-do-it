// 226. 翻转二叉树
// 简单
// 相关标签
// premium lock icon
// 相关企业
// 给你一棵二叉树的根节点 root ，翻转这棵二叉树，并返回其根节点。

 

// 示例 1：



// 输入：root = [4,2,7,1,3,6,9]
// 输出：[4,7,2,9,6,3,1]
// 示例 2：



// 输入：root = [2,1,3]
// 输出：[2,3,1]
// 示例 3：

// 输入：root = []
// 输出：[]
 

// 提示：

// 树中节点数目范围在 [0, 100] 内
// -100 <= Node.val <= 100



// 递归解法

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function(root) {
    if (!root) return null;

    // 交换左右子树
    [root.left, root.right] = [root.right, root.left];

    // 递归翻转左右子树
    invertTree(root.left);
    invertTree(root.right);

    return root;
};




// https://leetcode.cn/problems/invert-binary-tree/description/

// 迭代版本（BFS），这样不会用递归栈：

const invertTree = function(root) {
    if (!root) return null;

    let queue = [root];
    while (queue.length > 0) {
        let node = queue.shift();
        [node.left, node.right] = [node.right, node.left];
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return root;
};



