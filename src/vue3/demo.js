/**
 * Vue3 reactive + effect 极简版 Demo
 *
 * 运行：node src/vue3/demo.js
 */

const { reactive, effect } = require('./reactive');

console.log('========== Demo 1: 基础响应式 ==========');
const state = reactive({ count: 0 });

// effect 会立即执行一次，并且会收集依赖：state.count 被读取 → track(state, 'count')
effect(() => {
  console.log('effect 执行，count =', state.count);
});
// 输出：effect 执行，count = 0

// 修改 state.count → 触发 set → trigger → 再次执行上面的 effect
state.count++;
// 输出：effect 执行，count = 1

state.count = 10;
// 输出：effect 执行，count = 10

console.log('\n========== Demo 2: 多个属性 ==========');
const obj = reactive({ a: 1, b: 2 });

effect(() => {
  console.log('a + b =', obj.a + obj.b);
});
// 输出：a + b = 3

obj.a = 2;
// 输出：a + b = 4

obj.b = 3;
// 输出：a + b = 5

console.log('\n========== Demo 3: 只依赖用到的属性 ==========');
const user = reactive({ name: 'Alice', age: 18 });

effect(() => {
  // 只读了 name，所以只 track 了 'name'
  console.log('name:', user.name);
});
// 输出：name: Alice

user.age = 20;
// 不会触发上面的 effect，因为 effect 没有依赖 age

user.name = 'Bob';
// 输出：name: Bob

console.log('\n========== Demo 完成 ==========');
