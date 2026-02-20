# Vue3 Reactive 依赖与 trigger 速记

## 1. 依赖存储结构（get / track）

Reactive 在 **get**（即 **track**）时，依赖按下面三层结构存储：

```
targetMap (WeakMap)
  └─ target →
       depsMap (Map)
         └─ key →
              dep (Set)
                ├─ effect1
                ├─ effect2
                └─ ...
```

- **targetMap**：`WeakMap<target, depsMap>`，以响应式对象为 key
- **depsMap**：`Map<key, dep>`，以对象的属性名为 key
- **dep**：`Set<Effect>`，该属性对应的所有 effect 函数

一句话：**target → key → Set(effects)**。

---

## 2. trigger 为什么要用副本遍历？

Vue3 在 **trigger** 时不会直接遍历依赖集合，而是**先复制一份再执行**。

原因：effect 执行过程中会做 **cleanup** 和**重新依赖收集**，会对原 `Set` 进行 `delete` / `add`，直接遍历会导致**遍历污染**（迭代器失效或漏执行）。用副本遍历可以保证本次 trigger 的执行稳定、可预测。
