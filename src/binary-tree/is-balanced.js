/* 110. 平衡二叉树
简单
相关标签

相关企业
给定一个二叉树，判断它是否是 平衡二叉树  

 

示例 1：


输入：root = [3,9,20,null,null,15,7]
输出：true
示例 2：


输入：root = [1,2,2,3,3,null,null,4,4]
输出：false
示例 3：

输入：root = []
输出：true
 

提示：

树中的节点数在范围 [0, 5000] 内
-104 <= Node.val <= 104
面试中遇到过这道题?
1/5
是
否
通过次数
734,192/1.2M
通过率
59.6% */

https://leetcode.cn/problems/balanced-binary-tree/description/


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
 * @return {boolean}
 */
const isBalanced = function(root) {
    // 辅助函数：返回子树高度；如果不平衡，返回 -1
    function height(node) {
        if (!node) return 0;

        let left = height(node.left);
        if (left === -1) return -1; // 左子树不平衡，直接返回

        let right = height(node.right);
        if (right === -1) return -1; // 右子树不平衡，直接返回

        if (Math.abs(left - right) > 1) return -1; // 当前节点失衡
        return Math.max(left, right) + 1; // 返回当前子树高度
    }

    return height(root) !== -1;
};
