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




        /*     我们可以通过一个具体的例子，用图示的方式直观理解中序遍历中左子树的范围为什么是 `inStart` 到 `inRootIndex - 1`。
    
            以下是示例1的中序遍历数组 `inorder = [9,3,15,20,7]` 的分析：
            
            ```
            中序遍历数组索引:  0    1     2     3     4
            中序遍历元素:      [9,   3,   15,   20,   7]
                               ↑     ↑     ↑     ↑     ↑
                               |     |     |     |     |
                               |   根节点   |     |     |
                               |   (3)     |     |     |
                               |           |     |     |
                        左子树范围        右子树范围
                      (inStart到inRootIndex-1)  (inRootIndex+1到inEnd)
            ```
            
            ### 图示拆解步骤：
            
            1. **确定根节点在中序中的位置**
               - 根节点是 `3`（来自前序遍历的第一个元素）
               - 在中序遍历中找到 `3` 的位置，索引为 `1`（即 `inRootIndex = 1`）
            
            2. **划分左子树范围**
               - 中序遍历的特性是：左子树 → 根 → 右子树
               - 根节点左边的所有元素都是左子树的节点
               - 左子树的起始索引：`inStart = 0`（当前子树在中序中的起始位置）
               - 左子树的结束索引：`inRootIndex - 1 = 0`（根节点位置的前一个）
               - 因此左子树范围是 `[0, 0]`，对应元素 `[9]`
            
            3. **为什么这样划分是正确的？**
               - 中序遍历中，根节点左边的所有元素都属于左子树
               - 这些元素的索引范围必然是从当前子树的起始位置 `inStart` 开始
               - 到根节点位置的前一个索引 `inRootIndex - 1` 结束
            
            4. **递归应用**
               - 对于左子树 `[9]`，它的中序遍历范围是 `[0, 0]`
               - 此时它的根节点是 `9`，`inRootIndex = 0`
               - 它的左子树范围是 `[inStart, inRootIndex - 1] = [0, -1]`（空，因为起始索引 > 结束索引）
               - 这表示 `9` 节点没有左子树
            
            通过这个图示可以清晰地看到，中序遍历中左子树的范围确实是从 `inStart` 到 `inRootIndex - 1`，这是由中序遍历"左-根-右"的特性决定的。 */

        root.left = helper(preStart + 1, preStart + leftSize, inStart, inRootIndex - 1);



        /*         我们同样用示例1来图解右子树参数的逻辑，示例中：
        `preorder = [3,9,20,15,7]`，`inorder = [9,3,15,20,7]`
        
        ### 右子树参数图解（以根节点3为例）
        
        #### 1. 前序遍历中的右子树范围：`preStart + leftSize + 1` 到 `preEnd`
        前序遍历顺序：`[根, 左子树..., 右子树...]`
        ```
        前序数组索引:  0    1     2      3      4
        前序元素:      [3,   9,   20,    15,    7]
                        ↑    ↑     ↑      ↑      ↑
                        |    |     |      |      |
                      根节点 左子树  ↓      ↓      ↓
                                  右子树范围
                            (preStart+leftSize+1 到 preEnd)
        ```
        - 当前根节点`3`的`preStart = 0`
        - 左子树大小`leftSize = 1`（只有节点9）
        - 右子树起始索引 = `preStart + leftSize + 1 = 0 + 1 + 1 = 2`
        - 右子树结束索引 = `preEnd = 4`（当前子树在前序中的结束位置）
        - 所以右子树在前序中的范围是`[2,4]`，对应元素`[20,15,7]`
        
        
        #### 2. 中序遍历中的右子树范围：`inRootIndex + 1` 到 `inEnd`
        中序遍历顺序：`[左子树..., 根, 右子树...]`
        ```
        中序数组索引:  0    1     2      3      4
        中序元素:      [9,   3,   15,    20,    7]
                        ↑    ↑     ↑      ↑      ↑
                        |    |     |      |      |
                      左子树 根节点  ↓      ↓      ↓
                                  右子树范围
                            (inRootIndex+1 到 inEnd)
        ```
        - 根节点`3`在中序中的位置`inRootIndex = 1`
        - 右子树起始索引 = `inRootIndex + 1 = 1 + 1 = 2`
        - 右子树结束索引 = `inEnd = 4`（当前子树在中序中的结束位置）
        - 所以右子树在中序中的范围是`[2,4]`，对应元素`[15,20,7]`
        
        
        #### 3. 递归验证（以右子树根节点20为例）
        当处理右子树`[20,15,7]`时：
        - 新的`preStart = 2`（前序中20的位置）
        - 新的`inRootIndex = 3`（中序中20的位置）
        - 其右子树参数计算：
          - 前序范围：`2 + (3-2) + 1 = 4` 到 `4`（对应元素`[7]`）
          - 中序范围：`3 + 1 = 4` 到 `4`（对应元素`[7]`）
        
        这完全符合二叉树的结构，验证了参数计算的正确性。
        
        
        ### 总结
        右子树参数的逻辑遵循：
        - 前序中，右子树在左子树之后，所以起始索引是`左子树结束索引 + 1`
        - 中序中，右子树在根节点之后，所以起始索引是`根节点索引 + 1`
        - 两者的结束索引都是当前子树的边界`preEnd`和`inEnd`
        
        通过这种范围划分，递归函数能精准定位右子树的节点，完成整棵树的构建。 */


        root.right = helper(preStart + leftSize + 1, preEnd, inRootIndex + 1, inEnd);

        return root;
    }

    return helper(0, preorder.length - 1, 0, inorder.length - 1);
}
