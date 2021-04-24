
const effectStack = [];

//创建代理对象（省略 递归创建,数组,重复创建 的逻辑处理）
function reactive(obj) {
    var proxy = new Proxy(obj, {
        get: function (target, key) {
            return Reflect.get(target, key);
        },
        set: function (target, key, value) {
            Reflect.set(target, key, value);
            return true;
        }
    });
    return proxy;
}

/**
 * 副作用函数
 */
function effect(fn) {
    try {
        // 将需要执行的effect入栈
        effectStack.push(fn);
        fn();//执行一次
    } finally {
        // 依赖收集完毕及所有get流程走完，当前effect出栈
        effectStack.pop();
    }
}

window.reactive = reactive;
window.effect = effect;