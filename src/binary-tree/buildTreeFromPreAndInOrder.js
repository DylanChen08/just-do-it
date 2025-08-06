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





/**
 * 
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */





// https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/



/* 构建二叉树的一般步骤（前序 + 中序）给定：• preorder（前序遍历）：顺序是 根 → 左 → 右• inorder（中序遍历）：顺序是 左 → 根 → 右🚧 一般步骤如下：
1. 从前序遍历中取出第一个元素，它就是当前子树的根节点。• 因为前序是根在最前面。
2. 在中序遍历中找到这个根节点的位置。• 它左边的部分就是左子树，右边的部分是右子树。
3. 计算左子树节点的数量，从而在前序数组中切出对应的左右子树范围。
4. 递归地对左子树和右子树重复这个过程，直到构建完整棵树。🧠 为什么这种方法成立？• 前序遍历告诉你 “谁是根”。• 中序遍历告诉你 “根的左边是左子树，右边是右子树”。• 两个信息合起来就能唯一地构建出这棵树（因为题目保证没有重复节点）。 */


/**
 * @param {number[]} preorder
 * @param {number[]} inorder
 * @return {TreeNode}
 */
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = this.right = null;
    }
}

function buildTree(preorder, inorder) {
    if (!preorder.length || !inorder.length) return null;

    // 用一个 Map 来加速查找 inorder 中元素的位置
    const inMap = new Map();
    inorder.forEach((val, idx) => inMap.set(val, idx));

    function helper(preStart, preEnd, inStart, inEnd) {
        if (preStart > preEnd || inStart > inEnd) return null;

        const rootVal = preorder[preStart];
        const root = new TreeNode(rootVal);

        const inRootIndex = inMap.get(rootVal); // 根节点在中序中的位置
        const leftSize = inRootIndex - inStart; // 左子树节点数量

        root.left = helper(preStart + 1, preStart + leftSize, inStart, inRootIndex - 1);
        root.right = helper(preStart + leftSize + 1, preEnd, inRootIndex + 1, inEnd);

        return root;
    }

    return helper(0, preorder.length - 1, 0, inorder.length - 1);
}
