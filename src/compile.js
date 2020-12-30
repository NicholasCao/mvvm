import Handlers from './handlers.js'
import Watcher from './watcher.js'

// 指令解析器
export default function Compile(vm) {
  this.el = vm.$el
  this.vm = vm

  this.onRe = /^(vm-on:|@)/
  this.bindRe = /^(vm-bind:|:)/
  this.modelRe = /^vm-model/
  this.braceRe1 = /{{((?:.|\n)+?)}}/g
  this.braceRe2 = /[{}]/g

  this.dirs = []
  this.init()
}

Compile.prototype = {
  init() {
    if (this.el) {
      this.parse(this.el)
      this.render()
    }
  },

  parse(el) {
    const attrs = el.attributes
    let name

    [...attrs].forEach(e => {
      if (this.onRe.test(e.name)) {
        // vm-on:|@
        name = e.name.replace(this.onRe, '')
        this.addDir(Handlers.on, name, e.value, el)
      } else if (this.bindRe.test(e.name)) {
        // vm-bind:|:
        el.removeAttribute(e.name.split('=')[0])
        name = e.name.replace(this.bindRe, '')
        this.addDir(Handlers.bind, name, e.value, el)
      } else if (this.modelRe.test(e.name)) {
        // vm-model
        name = e.name.replace(this.modelRe, '')
        this.addDir(Handlers.model, name, e.value, el)
      }
    })

    const children = el.childNodes
    if (children.length > 0) {
      children.forEach(ele => {
        switch (ele.nodeType) {
        // 元素节点
        case 1:
          this.parse(ele)
          break
        // 文本节点
        case 3:
          if (this.braceRe1.test(ele.nodeValue)) {
            this.vm._textNodes.push(ele)
          }
          break
        }
      })
    }
  },

  addDir(handle, name, value, el) {
    this.dirs.push({
      vm: this.vm,
      name,
      handle,
      expOrFn: value,
      el
    })
  },

  render() {
    const vm = this.vm
    const that = this

    // 处理attribute
    this.dirs.forEach(e => {
      const handle = e.handle
      if (handle.implement) {
        handle.implement(e.vm, e.el, e.name, e.expOrFn)
      }
      const update = (newVal, oldVal) => {
        handle.update(e.vm, e.el, e.name, newVal, oldVal)
      }
      // 监听attribute
      new Watcher(this.vm, e.expOrFn, update)
    })

    // 处理文本节点
    vm._textNodes.forEach(e => {
      const array = e.nodeValue.match(this.braceRe1)
      const rawValue = e.nodeValue
      array.forEach(str => {
        const variable = str.replace(this.braceRe2, '')
        Handlers.textNode.implement(vm, e, variable)

        const update = (newVal, oldVal) => {
          Handlers.textNode.update(vm, newVal, oldVal, e, variable, rawValue, that.braceRe1, that.braceRe2)
        }
        // 监听文本节点
        new Watcher(vm, variable, update)
      })
    })
  }
}
