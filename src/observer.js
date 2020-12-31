import Dep from './dep.js'
import { def, hasOwn } from './utils.js'

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

// 数组
methodsToPatch.forEach(function(method) {
  // 缓存原型自身的方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    // 保存旧的长度 用于vm-for
    this._oldLength = this.length

    // 先执行原型自身的方法
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
    case 'push':
    case 'unshift':
      inserted = args
      break
    case 'splice':
      inserted = args.slice(2)
      break
    }
    if (inserted) {
      ob.observeArray(inserted)
    }
    // 触发依赖更新
    ob.dep.notify()
    return result
  })
})

// 对数据进行监听
export default function observe(value) {
  if (!value || typeof value !== 'object') {
    return
  }
  let ob
  if (hasOwn.call(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }

  return ob
}

function Observer(value) {
  this.dep = new Dep()
  def(value, '__ob__', this)

  if (Array.isArray(value)) {
    // 不可枚举
    def(value, '_oldLength', 0)
    value.__proto__ = arrayMethods
    this.observeArray(value)
  } else {
    this.walk(value)
  }
}

Observer.prototype = {
  walk(obj) {
    for (const key in obj) {
      defineReactive(obj, key, obj[key])
    }
  },

  observeArray(array) {
    array.forEach(item => {
      observe(item)
    })
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep()

  let childOb = observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 收集对应的观察者对象
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return val
    },

    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal

      // 递归监听对象
      if (typeof val === 'object') {
        childOb = observe(newVal)
      }

      dep.notify()
    }
  })
}
