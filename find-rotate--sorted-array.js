/* 154. 寻找旋转排序数组中的最小值 II
困难
相关标签
premium lock icon
相关企业
已知一个长度为 n 的数组，预先按照升序排列，经由 1 到 n 次 旋转 后，得到输入数组。例如，原数组 nums = [0,1,4,4,5,6,7] 在变化后可能得到：
若旋转 4 次，则可以得到 [4,5,6,7,0,1,4]
若旋转 7 次，则可以得到 [0,1,4,4,5,6,7]
注意，数组 [a[0], a[1], a[2], ..., a[n-1]] 旋转一次 的结果为数组 [a[n-1], a[0], a[1], a[2], ..., a[n-2]] 。

给你一个可能存在 重复 元素值的数组 nums ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的 最小元素 。

你必须尽可能减少整个过程的操作步骤。

 

示例 1：

输入：nums = [1,3,5]
输出：1
示例 2：

输入：nums = [2,2,2,0,1]
输出：0
 

提示：

n == nums.length
1 <= n <= 5000
-5000 <= nums[i] <= 5000
nums 原来是一个升序排序的数组，并进行了 1 至 n 次旋转
 

进阶：这道题与 寻找旋转排序数组中的最小值 类似，但 nums 可能包含重复元素。允许重复会影响算法的时间复杂度吗？会如何影响，为什么？

 */

/**
 * 寻找旋转排序数组中的最小值（允许重复元素）
 * @param {number[]} nums - 输入的旋转排序数组，可能包含重复元素
 * @return {number} - 返回数组中的最小值
 */
export default function findMin(nums) {
    // 初始化左右指针，分别指向数组的首尾
    let left = 0;
    let right = nums.length - 1;

    // 当左指针小于右指针时，继续二分查找
    while (left < right) {
        // 取中间位置
        let mid = Math.floor((left + right) / 2);

        // 情况1：中间值大于右边界值，说明最小值一定在右半部分
        // 例如：[4,5,6,7,0,1,2]，mid=3, nums[mid]=7, nums[right]=2
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        }
        // 情况2：中间值小于右边界值，说明最小值在左半部分（包括mid）
        // 例如：[2,2,2,0,1], mid=2, nums[mid]=2, nums[right]=1
        else if (nums[mid] < nums[right]) {
            right = mid;
        }
        // 情况3：中间值等于右边界值，无法判断最小值在哪一侧
        // 只能缩小右边界，去掉一个重复元素
        // 例如：[2,2,2,0,1], mid=1, nums[mid]=2, nums[right]=2
        else {
            right--;
        }
    }
    // 循环结束后，left和right会重合，指向最小值
    return nums[left];
}

console.log(findMin([1, 3, 5]));
console.log(findMin([2, 2, 2, 0, 1]));
console.log(findMin([3, 3, 3, 1, 3]));
