/**
 * Vue3 响应式原理 - 极简实现
 *
 * 核心思路：
 * 1. reactive(obj) 用 Proxy 包装对象，拦截 get/set
 * 2. effect(fn) 执行 fn，fn 里访问响应式数据时会触发 get → track 收集当前 effect 作为依赖
 * 3. 之后修改响应式数据时触发 set → trigger 执行之前收集的 effect
 *
 * 依赖存储结构（WeakMap）：
 *   targetMap: WeakMap<target, Map<key, Set<effect>>>
 *   - target: 被代理的原始对象
 *   - key: 对象的属性名
 *   - Set<effect>: 依赖该 key 的所有 effect 函数
 */

// ============ 1. 依赖存储 ============
// WeakMap: key 是原始对象 target，value 是 Map
// Map: key 是 target 的属性名，value 是 Set（存放依赖该属性的 effect）
// 使用 WeakMap 是为了当 target 不再被引用时能被 GC 回收
const targetMap = new WeakMap();

// 当前正在执行的 effect，用于 track 时知道要收集谁
let activeEffect = null;

/**
 * 依赖收集：在 get 时调用
 * 把「当前正在执行的 effect」记录到 targetMap[target][key] 的 Set 里
 */
function track(target, key) {
  // 没有 activeEffect 说明当前不在 effect 里读这个值，不需要收集
  if (!activeEffect) return;

  // 拿到 target 对应的 depsMap，没有就新建
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  // 拿到 key 对应的 dep（Set），没有就新建
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  // 把当前 effect 加入依赖集合
  dep.add(activeEffect);
}

/**
 * 触发更新：在 set 时调用
 * 取出依赖该 key 的所有 effect，依次执行
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  // 执行所有收集到的 effect
  dep.forEach((effect) => effect.run());
}

// ============ 2. effect ============
/**
 * effect(fn)：注册一个副作用函数
 * - 执行 fn 时会把 activeEffect 设为当前 effect，这样 fn 里访问的响应式属性都会 track 到当前 effect
 * - 返回一个 runner，可以手动再执行
 */
function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
  }

  run() {
    activeEffect = this;
    try {
      return this.fn();
    } finally {
      activeEffect = null;
    }
  }
}

// ============ 3. reactive（Proxy） ============
/**
 * reactive(obj)：把对象变成响应式
 * 用 Proxy 拦截 get/set，在 get 时 track，在 set 时 trigger
 */
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集：记录「当前 effect 依赖 target[key]」
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      // 只有值真的变了才触发（避免多余触发）
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
  });
}

// 导出供 demo 使用（ES Module，浏览器可用）
export { reactive, effect, track, trigger };
