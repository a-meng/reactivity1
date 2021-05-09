//第一版：只支持一层响应式
const targetMap = new WeakMap();  //原始对象=>对象key=>副作用函数 关系表
let activeEffect = null;//当前执行的副作用函数，保存出来这样在收集到targetMap时能找到 
//创建可响应对象，get操作时收集 数据=>affect(fn) 关系，set操作时执行affect(fn)
function reactive(obj) {
    let keys = Object.keys(obj);
    var proxy = new Proxy(obj, {
        get: function (target, key) {
            if (keys.includes(key)) { //防止原生属性触发
                track(target, key);
            }
            return Reflect.get(target, key);
        },
        set: function (target, key, value) {
            Reflect.set(target, key, value);
            if (keys.includes(key)) {//防止原生属性触发
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
    //先存到变量，再立刻执行一次，执行完依赖就通过proxy收集好了
    activeEffect = fn;
    fn();
}
/**
 *  收集监听关系(副作用)
 */
function track(target, key) {
    //1. 初始化依赖Map
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        console.info('创建depsMap',)
        depsMap = new Map()
        targetMap.set(target, depsMap);
    }
    //2. 第二层依赖使用Set存放key对应的effect
    let dep = depsMap.get(key);
    if (!dep) {
        console.info('创建dep',)
        dep = new Set();
        targetMap.get(target).set(key, dep);
    }
    //3. 取当前的effect
    if (activeEffect) {
        console.info('dep.add(activeEffect)',)
        dep.add(activeEffect); //由于是Set[]  不会重复
    }
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