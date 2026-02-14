const target = {
    message1: "大家",
    message2: "好",
};

const handler1 = {
    get(target, prop, receiver) {
        if (prop === "message1") {
            return "hello world5";
        }
        return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
        if (prop === "message1") {
            target[prop] = value;

            return true;
        }
    }
};

const proxy1 = new Proxy(target, handler1);

console.log(proxy1.message1);
console.log(proxy1.message2);

proxy1.message1 = "hello world33331";
console.log(proxy1.message1);