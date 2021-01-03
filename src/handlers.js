import { deepGet, deepSet, replace, remove, insertNode } from './utils.js'
import Compile from './compile.js'

const braceRe1 = /{{((?:.|\n)+?)}}/g
const braceRe2 = /[{}]/g

// 针对各种指令的回调函数
export default {
  // vm-on:|@
  on: {
    implement(vm, node, name, expOrFn) {
      node['on' + name] = vm[expOrFn].bind(vm)
    },
    update(vm, node, name, newVal, oldVal) {

    }
  },

  // vm-bind:|:
  bind: {
    implement(vm, node, name, expOrFn) {
      node.setAttribute(name, deepGet(vm, expOrFn))
    },
    update(vm, node, name, newVal, oldVal) {
      node.setAttribute(name, newVal)
    }
  },

  // vm-model
  model: {
    implement(vm, node, name, expOrFn) {
      node.value = deepGet(vm, expOrFn)
      node.oninput = function() {
        deepSet(vm, expOrFn, node.value)
      }
    },
    update(vm, node, name, newVal, oldVal) {
      node.value = newVal
    }
  },

  // {{}}
  textNode: {
    implement(vm, textNode, variable) {
      textNode.nodeValue = textNode.nodeValue.replace(`{{${variable}}}`, deepGet(vm, variable))
    },
    update(vm, newVal, oldVal, textNode, variable, rawValue) {
      // 更新修改的变量
      textNode.nodeValue = rawValue.replace(`{{${variable}}}`, newVal)

      // 处理一个textNode中多个{{ }}的情况
      let str = textNode.nodeValue
      if (braceRe1.test(str)) {
        const array = str.match(braceRe1)

        // 将其他{{ }} 替换
        array.forEach(e => {
          const variable = e.replace(braceRe2, '')
          str = str.replace(e, deepGet(vm, variable))
        })
        textNode.nodeValue = str
      }
    }
  },

  // vm-for
  for: {
    implement(vm, node, expOrFn) {
      // in和of含义一样
      // 不同于数组的for in和for of
      const re1 = /(.*) (?:in|of) (.*)/
      const re2 = /\((.*),(.*)\)/
      const match = expOrFn.match(re1)
      let valueKey, indexKey

      // (value, key) in array
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
      } else {
        valueKey = match[1].trim()
      }

      // 锚点定位
      const exp = match[2].trim()
      const frag = document.createDocumentFragment()
      const anchor = document.createTextNode('')
      replace(node, anchor)

      this.update(vm, node, exp, deepGet(vm, exp), indexKey, valueKey, anchor, frag)
      return {
        exp,
        valueKey,
        indexKey,
        anchor,
        frag
      }
    },
    // 将v-for节点克隆 再根据值的长度克隆进去再compile渲染 如果值变更 则将之前的节点全部删除 重新渲染
    update(vm, node, exp, value, indexKey, valueKey, anchor, frag) {
      if (value._oldLength) {
        for (let i = 0; i < value._oldLength; i++) {
          // 移除之前的节点
          remove(anchor.previousElementSibling)
        }
      }
      let cloneNode
      let re1
      let re2
      let html

      if (typeof value !== 'object') {
        console.error(`${exp}必须为对象或数组`)
        return
      }

      for (const key in value) {
        cloneNode = node.cloneNode(true)
        html = cloneNode.innerHTML

        if (valueKey) {
          re1 = new RegExp(`{{\\s*${valueKey}\\s*}}`, 'g')
          html = html.replace(re1, value[key])
        }
        if (indexKey) {
          re2 = new RegExp(`{{\\s*${indexKey}\\s*}}`, 'g')
          html = html.replace(re2, key)
        }

        cloneNode.innerHTML = html

        cloneNode.removeAttribute('vm-for')

        // compile cloneNode
        new Compile(vm, cloneNode)
        frag.appendChild(cloneNode)
      }

      insertNode(frag, anchor)
    }
  }
}
