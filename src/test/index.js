const obj = {
    name: 'Tom',
    say() {
      console.log(this.name)
    }
  }
  
  setTimeout(obj.say, 1000)
  // 输出：undefined（this 丢了）


//   console.log(9999)

// obj.say()


// const fn = obj.say
// fn()
// console.log(this)
// setTimeout(fn, 1000)

// 正确: 用bind绑定
setTimeout(obj.say.bind(obj), 1000);