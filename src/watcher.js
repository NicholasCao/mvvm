import Dep from './dep.js'
import { isObject } from './utils.js'
import { parseExpression } from './expression.js'

export default function Watcher (vm, expression, callback, needSetter) {
  this.vm = vm

  // 存放dep的ID
  // 用于判断该dep是否已添加watcher
  this.depIds = new Set()

  // 更新触发回调函数
  this.cb = callback

  const res = parseExpression(expression, needSetter)

  this.getter = res.getter
  this.setter = res.setter

  // 在创建watcher实例时先取一次值
  this.value = this.get()
}

Watcher.prototype = {
  get () {
    // 在读取值时先将观察者对象赋值给Dep.target 否则Dep.target为空 不会触发收集依赖
    Dep.target = this
    const value = this.getter.call(this.vm, this.vm)
    // 触发依赖后置为空
    Dep.target = null
    return value
  },

  set (val) {
    if (this.setter) this.setter.call(this.vm, this.vm, val)
  },

  update () {
    const value = this.get()
    const oldValue = this.value

    if (value !== oldValue || isObject(value)) {
      this.cb.call(this.vm, value, oldValue)
    }
    this.value = value
  },

  addDep (dep) {
    // 如果dep不存在 则在对应的dep中添加watcher
    if (!this.depIds.has(dep.id)) {
      this.depIds.add(dep.id)
      dep.addSub(this)
    }
  }
}
