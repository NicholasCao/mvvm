import Handlers from './handlers.js'
import { replace } from './utils.js'
import Watcher from './watcher.js'

// 指令解析器
export default function Compile (vm, el) {
  this.el = el
  this.vm = vm

  this._textNodes = []
  this.dirs = []

  this.onRe = /^(vm-on:|@)/
  this.bindRe = /^(vm-bind:|:)/
  this.modelRe = /^vm-model/
  this.forRe = /^vm-for/
  this.showRe = /^vm-show/
  this.braceRe = /{{((?:.|\n)+?)}}/g

  this.dirs = []
  this.init()
}

Compile.prototype = {
  init () {
    if (this.el) {
      if (!this.compileNode(this.el)) {
        if (this.el.hasChildNodes()) {
          this.compileNodeList(this.el.childNodes)
        }
      }

      this.render()
    }
  },

  addDir (handle, name, value, node) {
    this.dirs.push({
      name,
      handle,
      expression: value,
      node
    })
  },

  render () {
    const vm = this.vm

    this.dirs.sort((a, b) => b.handle.priority - a.handle.priority)

    // 处理attribute
    this.dirs.forEach(dir => {
      this.handleAttrbute(vm, dir)
    })

    // 处理文本节点
    this._textNodes.forEach(textNode => {
      this.handleTextNode(vm, textNode)
    })
  },

  compileNodeList (nodes) {
    nodes.forEach(node => {
      const flag = this.compileNode(node)
      if (!flag) {
        if (node.hasChildNodes()) {
          this.compileNodeList(node.childNodes)
        }
      }
    })
  },

  compileNode (node) {
    const type = node.nodeType
    if (type === 1) {
      return this.compileElement(node)
    } else if (type === 3) {
      return this.compileTextNode(node)
    }
  },

  compileElement (node) {
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

  compileTextNode (node) {
    this._textNodes.push(node)
  },

  handleAttrbute (vm, dir) {
    const handle = dir.handle

    if (dir.name === 'vm-for') {
      // vm-for
      const obj = handle.implement(vm, dir.node, dir.expression)

      const update = (newVal, oldVal) => {
        // update(vm, node, exp, value, indexKey, valueKey, anchor, frag)
        handle.update(vm, dir.node, obj.exp, newVal, obj.indexKey, obj.valueKey, obj.anchor, obj.frag)
      }
      // update(obj.value)
      const watcher = new Watcher(this.vm, obj.exp, update)
      update(watcher.value) // 执行时先update一次
    } else if (dir.name === 'vm-model') {
      // vm-model
      // 监听attributes
      const update = (newVal, oldVal) => {
        handle.update(vm, dir.node, dir.name, newVal, oldVal)
      }
      const watcher = new Watcher(this.vm, dir.expression, update, true)

      handle.implement(vm, dir.node, dir.name, dir.expression, watcher)

      update(watcher.value) // 执行时先update一次
    } else {
      if (handle.implement) {
        handle.implement(vm, dir.node, dir.name, dir.expression)
      }
      // 监听attributes
      if (dir.handle !== Handlers.on) {
        const update = (newVal, oldVal) => {
          handle.update(vm, dir.node, dir.name, newVal, oldVal)
        }
        const watcher = new Watcher(this.vm, dir.expression, update)
        update(watcher.value) // 执行时先update一次
      }
    }
  },

  handleTextNode (vm, textNode) {
    const text = textNode.wholeText

    let lastIndex = 0
    let match, index, frag
    /* eslint-disable no-cond-assign */
    while (match = this.braceRe.exec(text)) {
    /* eslint-enable no-cond-assign */
      if (!frag) frag = document.createDocumentFragment()
      index = match.index

      // 插入普通文本节点
      if (index > lastIndex) {
        frag.appendChild(
          document.createTextNode(text.slice(lastIndex, index))
        )
      }

      // 插入{{}}节点
      const variable = match[1]
      const watchingTextNode = document.createTextNode(variable)
      Handlers.textNode.implement(vm, watchingTextNode, variable)

      const update = (newVal, oldVal) => {
        Handlers.textNode.update(vm, newVal, oldVal, watchingTextNode)
      }
      // 监听文本节点
      const watcher = new Watcher(vm, variable, update)
      update(watcher.value) // 执行时先update一次
      frag.appendChild(watchingTextNode)

      lastIndex = index + match[0].length
    }

    // 插入{{}}之后的普通节点
    if (frag && lastIndex < text.length) {
      frag.appendChild(
        document.createTextNode(text.slice(lastIndex))
      )
    }

    // 把原来的textnode 替换为 fragment
    if (frag) replace(textNode, frag)
  }
}
