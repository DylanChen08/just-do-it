let activeEffect = null

function effect(fn) {
  activeEffect = fn
  fn();
  activeEffect = null
}


const bucket = new WeakMap()

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = bucket.get(target)
  if (!depsMap) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  dep.add(activeEffect)
}

function trigger(target, key, value) {


  const depsMap = bucket.get(target)

  if (!depsMap) return;

  const dep = depsMap.get(key)
  if (!dep) return;

  const effectToRun = new Set();

  dep.forEach(element => {
    if (element !== activeEffect) {
      effectToRun.add(element)
    }
  });

  effectToRun.forEach(element => {
    element()
  });

}

function reactive(obj){
  return new Proxy(obj,{
    get(target,key,receiver){
       track(target,key)
       return Reflect.get(target,key,receiver)
    },
    set(target,key,newValue,receiver){
      const oldValue = target[key]
      const result = Reflect.set(target,key,newValue,receiver)
      if(oldValue!==newValue){
        trigger(target,key)
      }

      return result
    }
  })
}