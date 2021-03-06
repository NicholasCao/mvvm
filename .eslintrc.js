module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  globals: {
    'VM': true
  },
  extends: 'standard',
  rules: {
    'indent': ['error', 2],
    'no-new': 0,
    'quote-props': 0,
    'no-new-func': 0,
    'no-proto': 0,
    // 'space-before-function-paren': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'max-len': ['error', { code: 120 }]
  }
}
