// 启动项目准备
// npm run install
// eslint-disable-next-line no-unused-vars
const CONFIG = {
  devBaseUrl: 'http://192.168.0.205:9099', // 第一次执行参考以上备注
  // devBaseUrl: 'http://localhost:9090', // 第一次执行参考以上备注
  prodBaseUrl: 'http://localhost:9090'
}

// eslint-disable-next-line no-unused-vars
const SYSTEM_NAME = 'P8V3.0-PLATFORM'

// eslint-disable-next-line no-unused-vars
// CA登录设置  为true时，CA登录
// eslint-disable-next-line no-unused-vars
const loginCa = false

// 在生产环境检测错误给出提示，默认为false 意为生产环境不提示
// eslint-disable-next-line no-unused-vars
const CHECK_PRODUCTION_ERROR_TIP = false
