/* 105. 从前序与中序遍历序列构造二叉树
中等
相关标签
premium lock icon
相关企业
给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的先序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点。

 

示例 1:


输入: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
输出: [3,9,20,null,null,15,7]
示例 2:

输入: preorder = [-1], inorder = [-1]
输出: [-1]
 

提示:

1 <= preorder.length <= 3000
inorder.length == preorder.length
-3000 <= preorder[i], inorder[i] <= 3000
preorder 和 inorder 均 无重复 元素
inorder 均出现在 preorder
preorder 保证 为二叉树的前序遍历序列
inorder 保证 为二叉树的中序遍历序列 */

// https://leetcode.cn/problems/delete-node-in-a-bst/



/* 解题思路
二叉搜索树（BST）删除节点时，主要分为三种情况：

节点不存在
如果没找到目标值，直接返回原来的 root。

节点存在且只有一个子节点（或者没有子节点）

没有左子树 → 返回右子树

没有右子树 → 返回左子树

节点存在且有两个子节点

找到 右子树中的最小值节点（也叫中序后继）

用这个节点的值替换当前节点的值

再递归删除右子树中的这个最小值节点 */



const deleteNode = function(root, key) {
    if (!root) return null; // 空树，直接返回

    if (key < root.val) {
        // key 在左子树
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        // key 在右子树
        root.right = deleteNode(root.right, key);
    } else {
        // 找到需要删除的节点
        if (!root.left) return root.right; // 只有右子树或没有子树
        if (!root.right) return root.left; // 只有左子树

        // 有两个子节点
        let minNode = findMin(root.right); // 找右子树最小值
        root.val = minNode.val; // 替换当前节点值
        root.right = deleteNode(root.right, minNode.val); // 删除右子树中的最小值节点
    }
    return root;
};

// 辅助函数：找到最小值节点
function findMin(node) {
    while (node.left) {
        node = node.left;
    }
    return node;
}
