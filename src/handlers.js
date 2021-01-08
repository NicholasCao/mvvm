import { deepGet, deepSet, replace, remove, insertNode } from './utils.js'
import Compile from './compile.js'

const braceRe1 = /{{((?:.|\n)+?)}}/g
const braceRe2 = /[{}]/g
const argRe = /\(.*\)$/

// 针对各种指令的回调函数
export default {
  // vm-on:|@
  on: {
    priority: 7,
    implement(vm, node, name, expOrFn) {
      if (expOrFn.indexOf('(') === -1) {
        node['on' + name] = vm[expOrFn].bind(vm)
      } else if (argRe.test(expOrFn)) {
        const [fn, t] = expOrFn.split('(')
        const args = t.slice(0, -1).split(',')

        node['on' + name] = function(e) {
          const realArgs = args.map(arg => {
            // 若可以deepGet deepGet优先级更高
            const val = deepGet(vm, arg) ? deepGet(vm, arg) : arg.trim()

            return arg === '$event' ? e : val
          })

          vm[fn](...realArgs)
        }
      }
    },
    update(vm, node, name, newVal, oldVal) {

    }
  },

  // vm-bind:|:
  bind: {
    priority: 8,
    implement(vm, node, name, expOrFn) {
      node.setAttribute(name, deepGet(vm, expOrFn) ? deepGet(vm, expOrFn) : expOrFn)
    },
    update(vm, node, name, newVal, oldVal) {
      node.setAttribute(name, newVal)
    }
  },

  // vm-model
  model: {
    priority: 10,
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
    priority: 0,
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
    priority: 20,
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
      // let re1
      // let re2
      let html

      if (typeof value !== 'object') {
        console.error(`${exp}必须为对象或数组`)
        return
      }

      for (const key in value) {
        cloneNode = node.cloneNode(true)
        html = cloneNode.innerHTML

        if (valueKey) {
          const re1 = new RegExp(`{{\\s*${valueKey}\\s*}}`, 'g')
          html = html.replace(re1, value[key])
          const re2 = new RegExp(`(vm-bind:|vm-on:|:|@).*=('|").*(${valueKey}).*('|")`)
          let matchs
          while (html.match(re2)) {
            matchs = html.match(re2)
            const directive = matchs[0].replace(matchs[3], `${exp}[${key}]`)
            html = html.replace(matchs[0], directive)
          }
        }
        if (indexKey) {
          const re1 = new RegExp(`{{\\s*${indexKey}\\s*}}`, 'g')
          html = html.replace(re1, key)
          const re2 = new RegExp(`(vm-bind:|vm-on:|:|@).*=('|").*(${indexKey}).*('|")`)
          let matchs
          while (html.match(re2)) {
            matchs = html.match(re2)
            const directive = matchs[0].replace(matchs[3], key)
            html = html.replace(matchs[0], directive)
          }
        }

        cloneNode.innerHTML = html
        cloneNode.removeAttribute('vm-for')

        const attrs = [...cloneNode.attributes]
        let flag = false
        let flag2 = false
        attrs.forEach(attr => {
          const name = attr.name.trim()
          let attrValue = attr.value.trim()

          if (/^(vm-bind:|vm-on:|:|@)/.test(name)) {
            // 清除逗号前后的空格
            attrValue = attrValue.split(',').map(str => str.trim()).join(',')

            if (valueKey && attrValue.indexOf(valueKey) > -1) {
              attrValue = attrValue.replace(valueKey, `${exp}[${key}]`)
              flag = true
            }
            if (indexKey && attrValue.indexOf(indexKey) > -1) {
              attrValue = attrValue.replace(indexKey, key)
              flag = true
            }
            if (flag) {
              try {
                cloneNode.setAttribute(name, attrValue)
              } catch {
                flag2 = true
                cloneNode.removeAttribute(name)
              }
              attr.value = attrValue
            }
          }
        })

        // flag2 遇到非法attribute 例如@click
        if (flag2) {
          cloneNode._attributes = attrs
        }

        new Compile(vm, cloneNode)
        frag.appendChild(cloneNode)
      }

      insertNode(frag, anchor)
    }
  },

  // vm-show
  show: {
    priority: 19,
    implement(vm, node, name, expOrFn) {
      node.__originalDisplay = node.style.display
      if (!deepGet(vm, expOrFn)) node.style.display = 'none'
    },
    update(vm, node, name, newVal, oldVal) {
      if (!newVal) node.style.display = 'none'
      else node.style.display = node.__originalDisplay
    }
  }
}
