# 响应式系统创建与依赖收集
1. vue3 通过对proxy代理对象的拦截，实现数据劫持和依赖收集。
2. 当我们使用Reactive的时候，会触发proxy里面的get 拦截器，然后回触发track(target,key)函数，进行依赖的收集。
3. 如果遇到正在执行的副作用函数，则将当前的副作用函数，存到对应属性的依赖集合中去。


# 全局依赖结构targetmap

vue里面全局维护一个targetmap,他是weakmap的结构，然后整个targetmap下面就是depsmap ，这个depsmap是map结构的,depsmap下面是deps ，deps是set结构的。

这样一来每个响应式属性都有属于自己的一个effect集合，读取的时候就把当前effect加入到依赖集合中去。