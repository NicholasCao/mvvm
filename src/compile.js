import Handlers from './handlers.js'
import { deepGet } from './utils.js'
import Watcher from './watcher.js'

// 指令解析器
export default function Compile(vm, el) {
  this.el = el
  this.vm = vm

  this._textNodes = []
  this.dirs = []

  this.onRe = /^(vm-on:|@)/
  this.bindRe = /^(vm-bind:|:)/
  this.modelRe = /^vm-model/
  this.forRe = /^vm-for/
  this.showRe = /^vm-show/
  this.braceRe1 = /{{((?:.|\n)+?)}}/g
  this.braceRe2 = /[{}]/g

  this.dirs = []
  this.init()
}

Compile.prototype = {
  init() {
    if (this.el) {
      if (!this.compileNode(this.el)) {
        if (this.el.hasChildNodes()) {
          this.compileNodeList(this.el.childNodes)
        }
      }

      this.render()
    }
  },

  addDir(handle, name, value, node) {
    this.dirs.push({
      name,
      handle,
      expOrFn: value,
      node
    })
  },

  render() {
    const vm = this.vm

    this.dirs.sort((a, b) => b.handle.priority - a.handle.priority)

    // 处理attribute
    this.dirs.forEach(e => {
      if (e.name !== 'vm-for') {
        const handle = e.handle
        if (handle.implement) {
          handle.implement(vm, e.node, e.name, e.expOrFn)
        }
        const update = (newVal, oldVal) => {
          handle.update(vm, e.node, e.name, newVal, oldVal)
        }
        // 监听attribute
        if (e.handle !== Handlers.on && deepGet(this.vm, e.expOrFn) === undefined) {
          new Watcher(this.vm, e.expOrFn, update)
        }
      } else {
        // vm-for
        const handle = e.handle
        const obj = handle.implement(vm, e.node, e.expOrFn)

        const update = (newVal, oldVal) => {
          // update(vm, node, exp, value, indexKey, valueKey, anchor, frag)
          handle.update(vm, e.node, e.expOrFn, newVal, obj.indexKey, obj.valueKey, obj.anchor, obj.frag)
        }
        // update(obj.value)
        new Watcher(this.vm, obj.exp, update)
      }
    })

    // 处理文本节点
    this._textNodes.forEach(e => {
      const array = e.nodeValue.match(this.braceRe1)
      const rawValue = e.nodeValue
      if (array) {
        array.forEach(str => {
          // 去掉{{}}
          const variable = str.replace(this.braceRe2, '')
          Handlers.textNode.implement(vm, e, variable)

          const update = (newVal, oldVal) => {
            Handlers.textNode.update(vm, newVal, oldVal, e, variable, rawValue)
          }
          // 监听文本节点
          new Watcher(vm, variable, update)
        })
      }
    })
  },

  compileNodeList(nodes) {
    nodes.forEach(node => {
      const flag = this.compileNode(node)
      if (!flag) {
        if (node.hasChildNodes()) {
          this.compileNodeList(node.childNodes)
        }
      }
    })
  },

  compileNode(node) {
    const type = node.nodeType
    if (type === 1) {
      return this.compileElement(node)
    } else if (type === 3) {
      return this.compileTextNode(node)
    }
  },

  compileElement(node) {
    // node._attributes 为vm-for修改后的attributes
    if (node.hasAttributes() || node._attributes) {
      let isFor = false
      const attrs = node._attributes || [...node.attributes]

      if (node.attributes['vm-for']) {
        isFor = true
      }

      attrs.forEach(attr => {
        let name = attr.name.trim()
        const value = attr.value.trim()

        if (this.onRe.test(name) && !isFor) {
          // vm-on:|@
          name = name.replace(this.onRe, '')
          this.addDir(Handlers.on, name, value, node)
        } else if (this.bindRe.test(name) && !isFor) {
          // vm-bind:|:
          node.removeAttribute(name.split('=')[0])
          name = name.replace(this.bindRe, '')
          this.addDir(Handlers.bind, name, value, node)
        } else if (name === 'vm-model' && !isFor) {
          // vm-model
          this.addDir(Handlers.model, name, value, node)
        } else if (name === 'vm-for') {
          // vm-for
          this.addDir(Handlers.for, name, value, node)
        } else if (this.showRe.test(name) && !isFor) {
          // vm-show
          node.removeAttribute(name.split('=')[0])
          this.addDir(Handlers.show, name, value, node)
        }
      })

      return isFor
    }
  },

  compileTextNode(node) {
    this._textNodes.push(node)
  }
}
