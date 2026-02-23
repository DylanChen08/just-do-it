很好，这一步是关键。

你现在要做的不是“看答案”，而是理解：

* 第三步 = 依赖收集怎么从 0 补完整
* 第四步 = 触发更新怎么从 0 补完整

我会按照**推导过程**带你补，而不是直接扔完整代码。

---

# ✅ 第三步：把 track 补完整

我们现在只有一个壳：

```js
const bucket = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
}
```

---

## 第一步思考

我们要存什么？

👉 存 “谁依赖了 target[key]”

一个 target 可能有多个 key
一个 key 可能有多个 effect

所以必须是：

```
target → key → effects
```

那自然就是：

```
WeakMap
  target
    Map
      key
        Set(effect)
```

---

## 第二步开始补

### ① 先拿 target 对应的 Map

```js
let depsMap = bucket.get(target);
```

如果没有怎么办？

```js
if (!depsMap) {
  depsMap = new Map();
  bucket.set(target, depsMap);
}
```

---

### ② 再拿 key 对应的 Set

```js
let dep = depsMap.get(key);
```

没有就创建：

```js
if (!dep) {
  dep = new Set();
  depsMap.set(key, dep);
}
```

---

### ③ 把当前 effect 加进去

```js
dep.add(activeEffect);
```

---

## 🔥 完整 track

```js
function track(target, key) {
  if (!activeEffect) return;

  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}
```

---

# ✅ 第四步：把 trigger 补完整

现在思考：

当 set 触发时，我们要干嘛？

👉 找到 target[key] 对应的所有 effect
👉 执行它们

---

## 第一步：拿到 depsMap

```js
const depsMap = bucket.get(target);
if (!depsMap) return;
```

---

## 第二步：拿到 dep（Set）

```js
const dep = depsMap.get(key);
if (!dep) return;
```

---

## 第三步：执行所有 effect

注意：我们之前的最小版本 effect 可能就是函数

```js
dep.forEach(effect => effect());
```

如果是 class 版本：

```js
dep.forEach(effect => effect.run());
```

---

## 🔥 完整 trigger（函数版）

```js
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  dep.forEach(effect => effect());
}
```

---

# 🧠 现在你脑中应该形成这个链条

当执行：

```js
effect(() => {
  console.log(obj.count);
});
```

流程是：

```
effect 执行
  ↓
activeEffect 被设置
  ↓
读取 obj.count
  ↓
get 触发
  ↓
track 收集 activeEffect
```

当执行：

```
obj.count++
```

流程是：

```
set 触发
  ↓
trigger
  ↓
找到 Set(effect)
  ↓
逐个执行
```

---

# ⚡ 你现在可以闭眼回答 3 个问题

1. 为什么是 WeakMap？
2. 为什么是 Set？
3. 如果 key 没有依赖会发生什么？

如果你能流畅答出来，你已经不是“背代码”了。

---

如果你愿意，我可以下一步带你升级：

* 实现 cleanup（避免死循环）
* 实现嵌套 effect
* 实现 scheduler
* 或者带你手写一版完整面试答案

你现在已经非常接近真正掌握了。
