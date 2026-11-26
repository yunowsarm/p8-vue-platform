/**
 * AXIOS Interceptors Configuration
 * =================================
 * Author: Vicco Wang
 * Date: 2018.06.22
 */
import store from '@/plugins/store'
import { getToken } from '@/service/expands/auth'
import { MessageBox, Notification } from 'p8-components-ui'
let version = require('../../../package.json')['version']
const invalidAuthorizationMessage = '授权信息无效，请重新授权!'

function clearMobileToken() {
  if (!window.plus) return

  try {
    const storage = window.plus.storage
    const service = JSON.parse(storage.getItem('current_app_service') || 'null')
    if (service) {
      service.token = null
      storage.setItem('current_app_service', JSON.stringify(service))
    }
  } catch {
    // 原生存储读取失败时仍可返回登录页。
  }
}

function reloadAfterSessionExpiry() {
  const loginUrl = new URL(location.href)
  loginUrl.search = ''
  loginUrl.hash = getToken() ? '/' : '/login'
  // 移除 URL 中的旧授权参数，并重新初始化动态路由。
  history.replaceState(null, '', loginUrl.href)
  location.reload()
}

function handleUnauthorized(message, config) {
  if (message === '用户名或密码错误') {
    Notification.error({ title: '提示', message })
    return
  }

  const token = store.getters.token
  // 只处理当前会话的请求。清理令牌后，其他并发失败的响应也会被跳过。
  if (!token || config?.headers?.Authorization !== token) return

  store.dispatch('clearUserSession', token)
  clearMobileToken()
  if (message !== invalidAuthorizationMessage) {
    reloadAfterSessionExpiry()
    return
  }

  const loadingElement = document.getElementById('app-loading')
  if (loadingElement) {
    loadingElement.style.display = 'none'
  }
  MessageBox.alert(message, '提示', {
    confirmButtonText: '确定',
    type: 'warning',
    callback: reloadAfterSessionExpiry
  })
}
/**
 *
 *
 * @export
 * @param {*} config
 * @returns
 */
export function axiosRequestSucessFunc(config) {
  // dosth before request
  // config.headers['Content-type'] = 'application/x-www-form-urlencoded'
  config.headers['Version'] = version
  const token = store.getters.token
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
}

/**
 *
 *
 * @export
 * @param {*} error
 * @returns
 */
export function axiosRequestFailFunc(error) {
  return Promise.reject(error)
}
/**
 *
 *
 * @export
 * @param {*} response
 * @returns
 */
export function axiosResponseSucessFunc(response) {
  /**
   * response 基本格式如下
   * {
   *  ...
   *  status: 200,
   *  data: {
   *    head: { success: 'true' },
   *    data: { some data here }
   *  }
   *  ...
   * }
   */
  // response by remote server
  let statusManage = {
    // 消息提示
    NotificationMessage: function (message) {
      Notification.error({
        title: '提示',
        message: message
      })
    },
    400: {
      // 参数有误
      do: function (message, data) {
        statusManage.NotificationMessage(message)
        return Promise.reject(data).catch(() => {})
      }
    },
    404: {
      // 接口不存在
      do: function (message, data) {
        statusManage.NotificationMessage(message)
        return Promise.reject(data).catch(() => {})
      }
    },
    405: {
      // 权限不足
      do: function (message, data) {
        statusManage.NotificationMessage(message)
        return Promise.reject(data).catch(() => {})
      }
    },
    500: {
      // 服务器内部错误
      do: function (message, data) {
        // eslint-disable-next-line no-undef
        if (!CHECK_PRODUCTION_ERROR_TIP) {
          if (process.env.NODE_ENV !== 'production') {
            statusManage.NotificationMessage(message)
          }
        } else {
          statusManage.NotificationMessage(message)
        }
        return Promise.reject(data).catch(() => {})
      }
    }
  }
  // 明确接受创建响应的接口可以复用 P8 现有的成功响应处理。
  const responseStatus = response.status === 201 && response.config?.acceptCreated ? 200 : response.status
  switch (responseStatus) {
    case 200:
    case 304:
      const contentType = response.headers['content-type']
      if (contentType.includes('application/json')) {
        const responseData = response.data
        const responseHead = responseData.head
        // 兼容论坛等新接口直接返回业务 JSON 的格式；旧接口仍按 head/data 包装处理。
        if (!responseHead) {
          return responseData
        }
        // response success and response data
        if (responseHead && responseHead.success === 'true') {
          return responseData.data
        } else {
          // case response data error code
          //  获取code
          const status = responseHead.code
          if (String(status) === '401') {
            handleUnauthorized(responseHead.message, response.config)
          } else if (statusManage[status]) {
            // 执行
            statusManage[status].do(responseHead.message, response.data)
          }
          // 保留业务失败态给调用方处理，不能吞掉后继续执行成功逻辑。
          return Promise.reject(responseData)
        }
      } else {
        return response
      }
      break
    default:
      return Promise.reject(response.data)
  }
}

export function axiosResponseFailFunc(error) {
  const response = error.response
  const head = response?.data?.head
  if (response?.status === 401 && String(head?.code) === '401') {
    handleUnauthorized(head.message, response.config)
  }
  // 捕获请求超时异常，并给出提示
  // const errorStr = error.message
  // if (errorStr.indexOf('timeout' > -1)) {
  //   Notification.error({
  //     title: '提示',
  //     message: '请求超时'
  //   })
  // }
  return Promise.reject(error)
}
