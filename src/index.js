import Observer from './observer.js'
import Compile from './compile.js'
import Watcher from './watcher.js'
import { deepGet, isObject } from './utils.js'

// ViewModel
export default function VM(options) {
  // 存放观察者实例
  this._watchers = []
  // 存放文本节点 在compile上会用到
  this._textNodes = []
  this.$options = options
  this.init()
}

VM.prototype = {
  // 初始化数据和方法
  init() {
    this.initData()
    this.initMethods()

    // 监听数据
    new Observer(this._data)

    // 解析指令
    new Compile(this)

    // 生成dep之后才能watch
    this.initWatch()
  },

  initData() {
    const vm = this
    vm.$el = document.querySelector(vm.$options.el)
    let data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data() : data || {}
    const keys = Object.keys(data)

    // 对每一个key实现代理 即可通过vm.abc来访问vm._data.abc
    keys.forEach(e => {
      vm.proxy(vm, '_data', e)
    })
  },

  initMethods() {
    const vm = this
    const methods = vm.$options.methods ? vm.$options.methods : {}
    const keys = Object.keys(methods)
    // 将methods上的方法赋值到vm实例上
    keys.forEach(e => {
      vm[e] = methods[e]
    })
  },

  initWatch() {
    if (this.$options.watch) {
      const watch = this.$options.watch

      for (const key in watch) {
        this.$watch(key, watch[key])
      }
    }
  },

  proxy(target, sourceKey, key) {
    const sharedPropertyDefinition = {
      enumerable: true,
      configurable: true
    }

    sharedPropertyDefinition.get = function proxyGetter() {
      return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
      this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
  },

  $watch(variable, callback) {
    const val = deepGet(this, variable)

    // 对象则递归watch
    if (isObject(val) && !Array.isArray(val)) {
      for (const key in val) {
        this.$watch(`${variable}.${key}`, callback)
      }
    } else {
      new Watcher(this, variable, callback)
    }
  },

  // 当为对象添加属性或修改数组的值时可用这个方法 能实时更新
  $set(obj, key, val) {
    if (!this[obj]) return

    this[obj][key] = val
    this[obj].__ob__.dep.notify()
  },

  // 当为对象删除属性或删除数组的值时可用这个方法 能实时更新
  $delete(obj, key) {
    if (!this[obj]) return

    if (Array.isArray(this[obj])) {
      this[obj].splice(key, 1)
    } else {
      delete this[obj][key]
      this[obj].__ob__.dep.notify()
    }
  }
}

window.VM = VM
