
// reactive 创建可观察对象
function reactive(target) {
    return new Proxy(target, {
        get(target, key) {
            track(target, key);              //记录依赖
            return Reflect.get(target, key); //默认get行为
        },
        set(target, key, value) {
            Reflect.set(target, key, value);  //默认set行为
            trigger(target, key);             //触发依赖
            return true;
        }
    });
}
//依赖监听函数
function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;  //执行完了清掉
}

//记录依赖关系
let activeEffect = null;//当前的effect回调
const triggerMap = new Map(); //依赖关系
function track(target, key) {
    if (!activeEffect) {
        // 在effect外面更改状态不需要跟踪
        return;
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
            children.forEach(fn => fn());
        }
    }
}

// 使用样例

const state = reactive({
    a: 0,
    b: 0
});
//更新a 
setInterval(() => {
    console.info('更新a');
    state.a++;
}, 1000);
//更新b
//setInterval(() => state.b++, 2000);

effect(() => {
    console.info('触发a监听', state.a);
});

effect(() => {
    console.info('触发b监听', state.b);
});


