let activeEffect = null

function effect(fn) {
  activeEffect = fn
  fn();
  activeEffect = null
}


function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      console.log("get")
      return target[key]
    },
    set(target, key, value) {
      console.log(set)
      target[key] = value
      return true

    },
  })
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
    element.run()
  });

}