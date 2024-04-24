/**
 * Global Configurations
 * =========================
 * Author: Vicco Wang
 * Date: 2018.06.22
 */

/**
 * 全局项目名称配置
 */
// eslint-disable-next-line no-undef
export const PLATFORM_PREFIX_NAME = 'P8V3.0-PLATFORM'
/**
 * //是否ca登录
 */

// eslint-disable-next-line no-undef
export const CA_LOGIN = loginCa

const DEFAULT_CONFIG = {
  devBaseUrl: 'http://localhost:9090',
  prodBaseUrl: 'http://localhost:9090',
  isDevMode: process.env.NODE_ENV !== 'production',
  isDebug: true,
  sep: '.'
}

function getConfig() {
  // eslint-disable-next-line no-undef
  if (typeof CONFIG !== 'undefined') {
    // eslint-disable-next-line no-undef
    Object.assign(DEFAULT_CONFIG, CONFIG)
  }

  return DEFAULT_CONFIG
}

/**
 * API接口默认参数配置
 */
export const API_DEFAULT_CONFIG = getConfig()

/**
 * Websocket 默认参数配置
 */
export const WS_CONFIG = {
  isOpen: false, // 是否开启websocket功能
  websocket: {
    url: 'ws://192.168.10.10:1234/ws',
    login: 'admin',
    passcode: 'admin'
  }
}

/**
 * AXIOS默认参数配置
 */
export const AXIOS_DEFAULT_CONFIG = {
  timeout: 5000
}

/**
 * 平台基础参数配置
 */
export const PLATFORM_DEFAULT_CONFIG = {
  productionTip: false
}

/**
 * 路由表默认参数配置
 */
export const ROUTER_DEFAULT_CONFIG = {
  isUseStaticRouter: false
}
/**
 * 外链进入系统默认路径
 */
export const OUTER_CHAIN_DEFAULT_CONFIG = {
  path: ['/signIn']
}
