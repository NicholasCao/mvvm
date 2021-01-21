// return getter
export function parseExpression (exp, needSetter) {
  exp = exp.trim()

  const res = { exp }

  res.getter = makeGetterFn(exp)

  if (needSetter) res.setter = makeSetterFn(exp)

  return res
}

// export for test
export function noop () {
}

function makeGetterFn (exp) {
  const body = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
    ? 'vm.' + exp
    // dynamic getter
    : compileExpression(exp)

  try {
    return new Function('vm', 'return ' + body + ';')
  } catch {
    return noop
  }
}

function makeSetterFn (exp) {
  const body = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple setter
    ? 'vm.' + exp
    // dynamic setter
    : compileExpression(exp)

  try {
    return new Function('vm, value', body + '= value' + ';')
  } catch {
    return noop
  }
}

const saved = []

// these RE are copied from vue-1.0
// disable eslint

/* eslint-disable no-useless-escape */
const wsRE = /\s/g
/* eslint-disable max-len */
const saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\"']|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g
/* eslint-enable max-len */
const restoreRE = /"(\d+)"/g
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g
/* eslint-enable no-useless-escape */

// export for test
export function compileExpression (exp) {
  // 重置saved
  saved.length = 0

  // 取出字符串 保存于saved,并用"index" 替代, index 为saved中对应的索引
  let body = exp
    .replace(saveRE, save)

  // 去空格
  body = body.replace(wsRE, '')

  // 添加vm
  body = (' ' + body).replace(identRE, rewrite)

  // 从saved取出字符
  body = body.replace(restoreRE, restore)

  return body
}

function save (str) {
  const i = saved.length
  saved[i] = str

  return '"' + i + '"'
}

function rewrite (raw) {
  const c = raw.charAt(0)
  let path = raw.slice(1)

  path = path.indexOf('"') > -1
    ? path.replace(restoreRE, restore)
    : path

  return c + 'vm.' + path
}

function restore (str, i) {
  return saved[i]
}

const pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/

export function isSimplePath (exp) {
  return pathTestRE.test(exp)
}
