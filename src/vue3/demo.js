/**
 * Vue3 reactive + effect 极简版 Demo
 *
 * 浏览器运行：用 index.html 打开本目录，或起一个静态服务访问 index.html
 */

import { reactive, effect } from './reactive.js';

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

state.count = 11;
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

// ========== 实时输入 Demo（输入框 + 按钮，边改边展示）==========
const inputEl = document.getElementById('live-input');
const displayEl = document.getElementById('live-display');
const clearBtn = document.getElementById('live-clear');

const formState = reactive({ text: '' });

// effect：一旦 formState.text 变化，就更新展示区域（像 Vue 的响应式更新）
effect(() => {
  const value = formState.text;
  displayEl.textContent = value ? `当前内容：${value}` : '当前内容：（空）';
  displayEl.classList.toggle('empty', !value);
});

inputEl.addEventListener('input', (e) => {
  formState.text = e.target.value;
});

clearBtn.addEventListener('click', () => {
  formState.text = '';
  inputEl.value = '';
});
