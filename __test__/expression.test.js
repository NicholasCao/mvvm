import { compileExpression, noop, parseExpression } from '../src/expression.js'

describe('expression', () => {
  test('100_parseExpression_error', () => {
    const res = parseExpression('err/ \'', true)

    expect(res.getter).toBe(noop)
    expect(res.setter).toBe(noop)
  })
})
