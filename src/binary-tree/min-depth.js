/* 111. 二叉树的最小深度
简单
相关标签
premium lock icon
相关企业
给定一个二叉树，找出其最小深度。

最小深度是从根节点到最近叶子节点的最短路径上的节点数量。

说明：叶子节点是指没有子节点的节点。

 

示例 1：


输入：root = [3,9,20,null,null,15,7]
输出：2
示例 2：

输入：root = [2,null,3,null,4,null,5,null,6]
输出：5
 

提示：

树中节点数的范围在 [0, 105] 内
-1000 <= Node.val <= 1000
 
面试中遇到过这道题?
1/5
是
否
通过次数
835,597/1.5M
通过率
56.3% */


// https://leetcode.cn/problems/minimum-depth-of-binary-tree/description/



const minDepth = function(root) {
    if (!root) return 0; // 空树深度为0

    let queue = [root];
    let depth = 1; // 根节点深度为1

    while (queue.length > 0) {
        let size = queue.length;
        for (let i = 0; i < size; i++) {
            let node = queue.shift();

            // 如果当前节点是叶子节点，直接返回当前深度
            if (!node.left && !node.right) {
                return depth;
            }

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        depth++;
    }
};




const minDepth2 = function(root) {
    if (!root) return 0;
    if (!root.left && !root.right) return 1;

    // 如果某一边没有子节点，只能走另一边
    if (!root.left) return 1 + minDepth(root.right);
    if (!root.right) return 1 + minDepth(root.left);

    return 1 + Math.min(minDepth(root.left), minDepth(root.right));
};
