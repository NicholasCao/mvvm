import { compileExpression, noop, parseExpression } from '../src/expression.js'

describe('expression', () => {
  test('01_simple_xpression', () => {
    let body = compileExpression('a + 1')
    expect(body).toBe(' vm.a+1')

    body = compileExpression('a + b.c')
    expect(body).toBe(' vm.a+vm.b.c')
  })
  test('02_ternary expression', () => {
    const body = compileExpression('a > 1 ? b.c : b.d')
    expect(body).toBe(' vm.a>1?vm.b.c:vm.b.d')
  })

  test('100_parseExpression_error', () => {
    const res = parseExpression('err/ \'', true)

    expect(res.getter).toBe(noop)
    expect(res.setter).toBe(noop)
  })
})
