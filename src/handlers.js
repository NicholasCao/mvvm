import { deepGet, deepSet } from './utils.js'

// 针对各种指令的回调函数
export default {
  on: {
    implement(vm, el, name, expOrFn) {
      el['on' + name] = vm[expOrFn].bind(vm)
    },
    update(vm, el, name, newVal, oldVal) {

    }
  },
  bind: {
    implement(vm, el, name, expOrFn) {
      el.setAttribute(name, deepGet(vm, expOrFn))
    },
    update(vm, el, name, newVal, oldVal) {
      el.setAttribute(name, newVal)
    }
  },
  model: {
    implement(vm, el, name, expOrFn) {
      el.value = deepGet(vm, expOrFn)
      el.oninput = function() {
        deepSet(vm, expOrFn, this.value)
      }
    },
    update(vm, el, name, newVal, oldVal) {
      el.value = newVal
    }
  },
  textNode: {
    implement(vm, textNode, variable) {
      textNode.nodeValue = textNode.nodeValue.replace(`{{${variable}}}`, deepGet(vm, variable))
    },
    update(vm, newVal, oldVal, textNode, variable, rawValue, re1, re2) {
      textNode.nodeValue = rawValue.replace(`{{${variable}}}`, newVal)

      // 处理一个textNode中多个{{ }}的情况
      let str = textNode.nodeValue
      if (re1.test(str)) {
        const array = str.match(re1)
        array.forEach(e => {
          const variable = e.replace(re2, '')
          str = str.replace(e, deepGet(vm, variable))
        })
        textNode.nodeValue = str
      }
    }
  }
}
