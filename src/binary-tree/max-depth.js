/* 104. 二叉树的最大深度
简单
相关标签

相关企业
给定一个二叉树 root ，返回其最大深度。

二叉树的 最大深度 是指从根节点到最远叶子节点的最长路径上的节点数。

 

示例 1：



 

输入：root = [3,9,20,null,null,15,7]
输出：3
示例 2：

输入：root = [1,null,2]
输出：2
 

提示：

树中节点的数量在 [0, 104] 区间内。
-100 <= Node.val <= 100 */



// https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/



const maxDepth = function(root) {
    if (!root) return 0; // 空树深度为 0
    let leftDepth = maxDepth(root.left);
    let rightDepth = maxDepth(root.right);
    return Math.max(leftDepth, rightDepth) + 1;
};