/* 整数数组 nums 按升序排列，数组中的值 互不相同 。

在传递给函数之前，nums 在预先未知的某个下标 k（0 <= k < nums.length）上进行了 旋转，使数组变为 [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]（下标 从 0 开始 计数）。例如， [0,1,2,4,5,6,7] 在下标 3 处经旋转后可能变为 [4,5,6,7,0,1,2] 。

给你 旋转后 的数组 nums 和一个整数 target ，如果 nums 中存在这个目标值 target ，则返回它的下标，否则返回 -1 。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。

 

示例 1：

输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4
示例 2：

输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1
示例 3：

输入：nums = [1], target = 0
输出：-1
 

提示：

1 <= nums.length <= 5000
-104 <= nums[i] <= 104
nums 中的每个值都 独一无二
题目数据保证 nums 在预先未知的某个下标上进行了旋转
-104 <= target <= 104 */


// https://leetcode.cn/problems/search-in-rotated-sorted-array/


const search = function (nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        // 找到目标，直接返回下标
        if (nums[mid] === target) {
            return mid;
        }

        // 判断左半部分是否是有序区间
        // 关键点：如果 nums[left] <= nums[mid]，说明左边[left, mid]是“完整有序的区间”
        // 注意：这里比较的是 nums[left] 和 nums[mid]，而不是简单看局部递增，
        // 因为旋转数组中有且只有一边是连续递增且不含断点的区间。
        if (nums[left] <= nums[mid]) {

            // 判断 target 是否在左边这个有序区间内
            // 这里判断 nums[left] <= target < nums[mid]
            // 因为左边是递增区间，如果 target 在区间内，
            // 就在左边继续二分搜索，缩小右边界 right = mid - 1
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                // 否则 target 不在左边有序区间中，只能去右边搜索
                left = mid + 1;
            }
        } else {
            // 如果左边不是有序区间，说明右边[mid, right]是有序区间
            // 因为旋转数组只有一个断点
            // 右边区间是连续递增的

            // 判断 target 是否在右边这个有序区间内
            // 这里判断 nums[mid] < target <= nums[right]
            // 如果在右边区间，就在右边继续二分搜索，缩小左边界 left = mid + 1
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                // 否则 target 不在右边有序区间中，只能去左边搜索
                right = mid - 1;
            }
        }
    }
    // 没找到目标，返回 -1
    return -1;
}

console.log(search([4,5,6,7,0,1,2], 0));
