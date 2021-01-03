export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

// 处理{{obj.a.b.c}}
export function deepGet(vm, exp) {
  exp = exp.trim()
  return exp.indexOf('.') > -1 || exp.indexOf('[') > -1
    ? new Function('vm', 'return ' + 'vm.' + exp)(vm)
    : vm[exp]
}

export function deepGetter(vm, exp) {
  exp = exp.trim()
  return exp.indexOf('.') > -1 || exp.indexOf('[') > -1
    ? new Function('vm', `return vm.${exp}`)
    : () => vm[exp]
}

export function deepSet(vm, exp, value) {
  exp = exp.trim()
  if (exp.indexOf('.') > -1 || exp.indexOf('[') > -1) new Function(`vm.${exp} = ${value}`)()
  else vm[exp] = value
}

// export function deepSetter(vm, exp) {
//   exp = exp.trim()
//   return exp.indexOf('.') > -1 || exp.indexOf('[') > -1
//     ? new Function('value', `vm.${exp} = value`)
//     : value => { vm[exp] = value }
// }

// dom
export function replace(oldNode, newNode) {
  const parent = oldNode.parentNode
  if (parent) {
    parent.replaceChild(newNode, oldNode)
  }
}

export function remove(el) {
  if (el) el.parentNode.removeChild(el)
}

export function insertNode(newNode, oldNode) {
  oldNode.parentNode.insertBefore(newNode, oldNode)
}
