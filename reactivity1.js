//第一步 只支持一层响应式 且 effect只能传同步函数

const targetMap = new WeakMap();  //原始对象=>对象key=>副作用函数 关系表
let activeEffect = null;//当前执行的副作用函数，保存出来这样在收集到targetMap时能找到 

//创建可响应对象，get操作时收集 数据=>affect(fn) 关系，set操作时执行affect(fn)
function reactive(obj) {
    let keys = Object.keys(obj);
    var proxy = new Proxy(obj, {
        get: function (target, key) {
            if (keys.includes(key)) { //防止原生属性触发
                console.info('track', key);
                track(target, key);
            }
            return Reflect.get(target, key);
        },
        set: function (target, key, value) {
            Reflect.set(target, key, value);
            if (keys.includes(key)) {//防止原生属性触发
                console.info('trigger', key);
                trigger(target, key);
            }
        }
    });
    return proxy;
}

/**
 *  变更监听器(副作用)
 */
function effect(fn) {
    try {
        //先存到变量，再立刻执行一次，执行完依赖就通过proxy收集好了
        activeEffect = fn;
        fn();
    } finally {
        //执行完去掉引用,此处不去掉应该也没啥，不会影响逻辑，顶多算一点内存泄漏（猜的）
        activeEffect = null;
    }
}


/**
 *  收集监听关系(副作用)
 */
function track(target, key) {
    // 初始化依赖Map
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        console.info('创建depsMap',)
        depsMap = new Map()
        targetMap.set(target, depsMap);
    }

    // 第二层依赖使用Set存放key对应的effect
    let dep = depsMap.get(key);
    if (!dep) {
        console.info('创建dep',)
        dep = new Set();
        targetMap.get(target).set(key, dep);
    }

    // 取当前的effect
    if (activeEffect) {
        console.info('dep.add(activeEffect)',)
        dep.add(activeEffect); //由于是Set[]  不会重复
    }
    console.info(depsMap)
}
/**
 * 触发监听(副作用)
 */
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (depsMap) {
        const effects = depsMap.get(key);
        console.info('effects.length', effects.size)
        effects && effects.forEach(run => run());
    }
}

window.reactive = reactive;
window.effect = effect;