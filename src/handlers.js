import { replace, remove, insertNode } from './utils.js'
import Compile from './compile.js'
import { parseExpression, isSimplePath } from './expression.js'
import { defineReactive } from './observer.js'

// 针对各种指令的回调函数
export default {
  // vm-on:|@
  on: {
    priority: 7,
    implement (vm, node, name, expression) {
      let fn
      if (isSimplePath(expression)) {
        fn = parseExpression(expression).getter.call(vm, vm).bind(vm)
      } else {
        fn = function (e) {
          vm.$event = e
          parseExpression(expression).getter.call(vm, vm)
          vm.$event = null
        }
      }
      node['on' + name] = fn
    },
    update (vm, node, name, newVal, oldVal) {

    }
  },

  // vm-bind:|:
  bind: {
    priority: 8,
    implement (vm, node, name, expression) {

    },
    update (vm, node, name, newVal, oldVal) {
      node.setAttribute(name, newVal)

      // 解决:style 与 vm-show的冲突
      if (name === 'style') {
        if (node._show) node.style.display = node.__originalDisplay
        else if (node._show === false) node.style.display = 'none'
      }
    }
  },

  // vm-model
  model: {
    priority: 10,
    implement (vm, node, name, expression, watcher) {
      // 仅支持input的text 和 textarea
      // 不适配radio select 等
      if (node.type === 'text' || node.tagName === 'TEXTAREA') {
        node.oninput = function () {
          watcher.set(node.value)
        }
      }
    },
    update (vm, node, name, newVal, oldVal) {
      if (node.tagName !== 'INPUT' && node.tagName !== 'TEXTAREA') return

      if (node.type === 'text' || node.tagName === 'TEXTAREA') {
        node.value = newVal
      }
    }
  },

  // {{}}
  textNode: {
    priority: 1,
    implement (vm, textNode, expression) {
      // handle in compile
    },
    update (vm, newVal, oldVal, textNode) {
      textNode.data = newVal
    }
  },

  // vm-for
  for: {
    priority: 20,
    implement (vm, node, expression) {
      // in和of含义一样
      // 不同于数组的for in和for of
      const re1 = /(.*) (?:in|of) (.*)/
      const re2 = /\((.*),(.*)\)/
      const match = expression.match(re1)
      let valueKey, indexKey

      // example: (value, key) in array
      // match = ['(value, key) in array', '(value, key)', 'array']
      if (match) {
        // match1 = [value, key]
        const match1 = match[1].match(re2)
        if (match1) {
          valueKey = match1[1].trim()
          indexKey = match1[2].trim()
        } else {
          valueKey = match[1].trim()
        }
      }

      // 锚点定位
      const exp = match[2].trim()
      const frag = document.createDocumentFragment()
      const anchor = document.createTextNode('')
      replace(node, anchor)

      return {
        exp,
        valueKey,
        indexKey,
        anchor,
        frag
      }
    },
    // 将v-for节点克隆
    // 再根据值的长度克隆进去再compile渲染
    // 如果值变更 则将之前的节点全部删除 重新渲染
    update (vm, node, exp, value, indexKey, valueKey, anchor, frag) {
      if (node._vmForNumber) {
        for (let i = 0; i < node._vmForNumber; i++) {
          // 移除之前的节点
          remove(anchor.previousElementSibling)
        }
      }
      node._vmForNumber = value.length

      if (typeof value !== 'object') {
        console.error(`${exp}必须为对象或数组`)
        return
      }

      for (const key in value) {
        const cloneNode = node.cloneNode(true)
        cloneNode.removeAttribute('vm-for')

        const forVM = Object.create(vm)

        defineReactive(forVM, valueKey, vm[exp][key])
        defineReactive(forVM, indexKey, Array.isArray(value) ? Number(key) : key)

        new Compile(forVM, cloneNode)
        frag.appendChild(cloneNode)
      }

      insertNode(frag, anchor)
    }
  },

  // vm-show
  show: {
    priority: 0,
    implement (vm, node, name, expression) {
      node.__originalDisplay = node.style.display
    },
    update (vm, node, name, newVal, oldVal) {
      if (!newVal) {
        node.style.display = 'none'
        node._show = false
      } else {
        node.style.display = node.__originalDisplay
        node._show = true
      }
    }
  }
}
