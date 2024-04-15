// 启动项目准备
// npm run install
const defaultServiceAddr = window.location.origin
// eslint-disable-next-line no-unused-vars
const CONFIG = {
  devBaseUrl: 'http://192.168.0.86:9090', // 第一次执行参考以上备注
  // devBaseUrl: 'http://localhost:9090', // 第一次执行参考以上备注
  prodBaseUrl: defaultServiceAddr // 自动获取浏览器地址栏地址作为后端访问地址，适应于前端程序部署在后端的Web服务器容器内的模式，如果分离部署模式，请修改为后台访问地址。
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

// socket连接地址
const SOCKET_URL = 'http://192.168.0.199:8888'
