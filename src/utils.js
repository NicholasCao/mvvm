export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

// dom
export function replace (oldNode, newNode) {
  const parent = oldNode.parentNode
  if (parent) {
    parent.replaceChild(newNode, oldNode)
  }
}

export function remove (el) {
  if (el) el.parentNode.removeChild(el)
}

export function insertNode (newNode, oldNode) {
  oldNode.parentNode.insertBefore(newNode, oldNode)
}
