// 给你一个按照非递减顺序排列的整数数组 nums，
// 和一个目标值 target。请你找出给定目标值在数组中的开始位置和结束位置。 
// 如果数组中不存在目标值 target，返回 [-1, -1]。 
// 你必须设计并实现时间复杂度为 O(log n) 的算法解决此问题。


const searchRange = (nums, target) => {
    let left = 0;
    let right = nums.length - 1
    let result = [-1, -1]

    while (left <= right) {
        let mid = Math.floor((left + right) / 2)
        if (nums[mid] === target) {
            // 先把结果暂存起来 
            result = [mid, mid]
            // 向左继续查找更小的
            let left = mid;
            while (left >= 0 && nums[left] === target) {
                result[0] = left
                left--
            }
            // 向右查找更大的 
            let right = mid;
            while (right < nums.length && nums[right] === target) {
                result[1] = right
                right++
            }
            return result
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }

    }
    return result
}

