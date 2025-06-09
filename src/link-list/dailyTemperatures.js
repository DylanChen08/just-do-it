//  给定一个整数数组 temperatures ，表示每天的温度，返回一个数组 answer ，
// 其中 answer[i] 是指对于第 i 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 0 来代替。
function dailyTemperatures(temperatures) {
    const n = temperatures.length;
    const answer = new Array(n).fill(0);
    // 定义单调栈
    const stack = [];

    for (let i = 0; i < n; i++) {
        const currentTemperature = temperatures[i];
        while (stack.length > 0) {
            // 取出栈顶的坐标，但是不从栈中取出
            const topIndex = stack[stack.length - 1];
            // top index会打印什么
            const topTemperature = temperatures[topIndex];
            if (currentTemperature > topTemperature) {
                stack.pop();
                //  计算某天到更暖的那天的天数
                answer[topIndex] = i - topIndex;
            } else {
                break;
            }
        }
        //  没有比当前栈顶温度高的，则将当前温度入栈
        stack.push(i);
    }
    return answer;
}




//  简化版本

// function dailyTemperatures2(temperatures) {
//     const n = temperatures.length;
//     const answer = new Array(n).fill(0);
//     const stack = [];

//     for (let i = 0; i < n; i++) {
//         const currentTemperature = temperatures[i];
//         while (stack.length > 0 && currentTemperature > temperatures[stack[stack.length - 1]]) {
//             const topIndex = stack.pop();
//             answer[topIndex] = i - topIndex;
//         }
//         stack.push(i);
//     }
//     return answer;
// }




