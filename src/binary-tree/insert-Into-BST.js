/* 给定二叉搜索树（BST）的根节点 root 和要插入树中的值 value ，将值插入二叉搜索树。 返回插入后二叉搜索树的根节点。 输入数据 保证 ，新值和原始二叉搜索树中的任意节点值都不同。

注意，可能存在多种有效的插入方式，只要树在插入后仍保持为二叉搜索树即可。 你可以返回 任意有效的结果 。

 

示例 1：


输入：root = [4,2,7,1,3], val = 5
输出：[4,2,7,1,3,5]
解释：另一个满足题目要求可以通过的树是：

示例 2：

输入：root = [40,20,60,10,30,50,70], val = 25
输出：[40,20,60,10,30,50,70,null,null,25]
示例 3：

输入：root = [4,2,7,1,3,null,null,null,null,null,null], val = 5
输出：[4,2,7,1,3,5]
 

提示：

树中的节点数将在 [0, 104]的范围内。
-108 <= Node.val <= 108
所有值 Node.val 是 独一无二 的。
-108 <= val <= 108
保证 val 在原始BST中不存在。
面试中遇到过这道题?
1/5
是
否
通过次数
291,124/417.3K
通过率
69.8% */




// https://leetcode.cn/problems/insert-into-a-binary-search-tree/description/



// 从根节点开始，小的往左走，大的往右走；
// 如果那个方向有空位，就插入；
// 如果没空位，就继续沿着那个方向走下去，重复比较，直到找到空位为止

const insertIntoBST = function(root, val) {
    if (root === null) {
        return new TreeNode(val);
    }

    let current = root;
    while (current) {
        // 如果val小于cur.val，则插入到cur的左子树
        if (val < current.val) {
            if (current.left === null) {
                current.left = new TreeNode(val);
                break;
            } else {
                current = current.left;
            }
        } else {
            // 如果val大于cur.val，则插入到cur的右子树
            if (current.right === null) {
                current.right = new TreeNode(val);
                break;
            } else {
                current = current.right;
            }
        }
    }

    return root;
};
