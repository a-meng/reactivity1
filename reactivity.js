

const targetMap = new WeakMap();  //原始对象=>对象key=>副作用函数 关系表
const effectStack = [];

//创建代理对象（省略 递归创建,数组,重复创建 的逻辑处理）
function reactive(obj) {
    var proxy = new Proxy(obj, {
        get: function (target, key) {
            //在触发get时收集依赖 
            //--- 此处虽然不知道那个函数里调用的这个key，但是effect里面把函数存进了 effectStack !!!
            track(target, key);
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
        //执行一次 
        //
        fn();
    } finally {
        // 依赖收集完毕及所有get流程走完，当前effect出栈
        effectStack.pop();
    }
}


/**
 * 依赖收集
 * @param {*} target
 * @param {*} key
 */
function track(target, key) {
    // 初始化依赖Map
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap);
    }

    // 第二层依赖使用Set存放key对应的effect
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        targetMap.get(target).set(key, dep);
    }

    // 取当前栈中的effect存入第二层依赖中
    const activeEffect = effectStack[effectStack.length - 1];
    if (activeEffect) {
        dep.add(activeEffect);
    }
}

window.reactive = reactive;
window.effect = effect;