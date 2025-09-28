/**
 * AXIOS Interceptors Configuration
 * =================================
 * Author: Vicco Wang
 * Date: 2018.06.22
 */
import store from '@/plugins/store'
import { MessageBox, Notification } from 'p8-components-ui'
let version = require('../../../package.json')['version']
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
    reload: function () {
      store.dispatch('userLogout').then(() => {
        location.reload()
      })
    },
    400: {
      // 参数有误
      do: function (message, data) {
        statusManage.NotificationMessage(message)
        return Promise.reject(data).catch(() => {})
      }
    },
    401: {
      do: function (message, data) {
        // 权限不够,重新登录
        // 如果是登录时用户名或密码错误，则给出提示
        // 如果同一个账号，不同电脑登录，被踢掉时，给出提示
        if (message === '用户名或密码错误') {
          statusManage.NotificationMessage(message)
        } else if (message === '授权信息无效，请重新授权!') {
          const loadingElement = document.getElementById('app-loading')
          if (loadingElement) {
            loadingElement.style.display = 'none'
          }
          MessageBox.alert(message, '提示', {
            confirmButtonText: '确定',
            type: 'warning',
            callback: (action) => {
              statusManage.reload()
            }
          })
        } else {
          statusManage.reload()
        }
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
  switch (response.status) {
    case 200:
    case 304:
      const contentType = response.headers['content-type']
      if (contentType.includes('application/json')) {
        const responseData = response.data
        const responseHead = responseData.head
        // response success and response data
        if (responseHead && responseHead.success === 'true') {
          return responseData.data
        } else {
          // case response data error code
          //  获取code
          let status = responseHead.code
          if (statusManage[status]) {
            // 执行
            statusManage[status].do(responseHead.message, response.data)
          } else {
            Promise.reject(response.data).catch(() => {})
          }
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
