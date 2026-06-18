// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser'
    requireConfigFile: false
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    // 'plugin:vue/essential', // 基础 防止错误或意外行为的规则
    'plugin:vue/strongly-recommended', // 超过基础 大大提高代码可读性和/或开发体验的规则
    // 'plugin:vue/recommended', // 超过strongly-recommended 强制执行主观社区默认值以确保一致性的规则
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard',
    '@vue/prettier'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-case-declarations': 'off',
    'prettier/prettier': ['error', {
      'trailingComma': 'none',
      'tabWidth': 2,
      'semi': false,
      'singleQuote': true,
      'semicolons': false,
      'bracketLine': true,
      'printWidth': 200
    }]
  }
}
