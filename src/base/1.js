function Person() {

}


// const person1 = new Person()

// person1.name = 'John'

// console.log(person1.name)

// console.log(1111,person1.__proto__===Person.prototype)
// console.log(9999)

// console.log(2222,person1.__proto__===Person.prototype)



Person.prototype.name = 'cy'
const person1 = new Person()
person1.name = 'John'
console.log(person1.name)   
delete person1.name
console.log(person1.name)
console.log(Person.prototype.__proto__)