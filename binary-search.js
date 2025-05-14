const binarySearch = (arr, target) => {
    let left = 0
    let right = arr.length - 1;

    // 当左边界没有大于有边界，循环就会继续，就会一直查找
    while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        if (arr[mid] === target) {
            return mid;
        }
        // 如果中间的值小于目标值 则将左边界移动到中间的右边一位
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;


        }

    }
    return -1;
}
