// 基本逻辑就是
//1. 创建代理对象 
//2. 所有get操作收集 对象和effect回调函数关系 
//3. set操作时触发对应的effect回调

// reactive 创建可观察对象
function reactive(target) {
    return new Proxy(target, {
        get(target, key) {
            console.info('track:', key)
            track(target, key);              //记录依赖
            return Reflect.get(target, key); //默认get行为
        },
        set(target, key, value) {
            Reflect.set(target, key, value);  //默认set行为
            console.info('trigger:', key)
            trigger(target, key);             //触发依赖 
        }
    });
}
//依赖监听函数 
function effect(fn) {
    activeEffect = fn;
    //effect函数回调首先会被执行一次，只有执行了才有机会收集关联关系，并且每次执行都会再次收集，这样可以处理effect回调中有if的问题
    fn();
    activeEffect = null;  //执行完了清掉
}

//记录依赖关系
let activeEffect = null;//当前的effect回调
const triggerMap = new Map(); //收集回调&对象&key的映射关系
function track(target, key) {
    if (!activeEffect) {
        return; // 在effect外面的get操作不管，也不可能管
    }
    let has = triggerMap.get(target);
    if (!has) {
        has = new Map();
        triggerMap.set(target, has);
    }
    let children = has.get(key);
    if (!children) {
        children = new Set();
        has.set(key, children);
    }
    children.add(activeEffect);
}
//触发更新
function trigger(target, key) {
    let has = triggerMap.get(target);
    if (has) {
        let children = has.get(key);
        if (children) {
            children.forEach(fn => {
                fn();
            });
        }
    }
}

// 使用样例 

const state = reactive({
    a: 0,
    b: 0
});

setTimeout(() => {
    //外部更新状态a 
    state.a = state.a + 1;
}, 1000);

// setTimeout(() => {
//     //外部更新状态b 
//     state.b = state.b + 1;
// }, 2000);

effect(() => {
    console.info('effect:a', state.a);
});

effect(() => {
    console.info('effect:b', state.b);
});

// 打印信息梳理
/*
track: a         # effect:a 内部state.a 触发的get收集操作
effect:a 0       # effect:a 函数收集完后的调用
track: b         # 同上
effect:b 0       # 同上
track: a         # setTimeout中的 state.a 触发的get收集操作
trigger: a       # setTimeout中的 state.a=X 触发的set更新操作
track: a         # set导致的 重新执行effect:a ,affetc:a 中 state.a 叒触发了get收集操作
effect:a 1       # effect:a回调执行完成 打印输出

*/
