/**
 * API CONSTRUCTION ClASS
 * ========================================================================
 * 该类负责构建生成对应全局API对象。API对象可以通过直接导入该类实例使用， 也可以
 * 通过在Vue组件中通过 this.$api 方式调用。注入方式请参考 inject.js
 * 例如：
 * this.$api['user/login'](params)
 * 或
 * import api from '@/plugins/api'
 *
 * api['user/login'](params)
 * ========================================================================
 * Author: Vicco Wang
 * Date: 2018.06.22
 */
import axios from './axios'
import _assign from 'lodash/assign'
import _isEmpty from 'lodash/isEmpty'
import { Message } from 'element-ui'
import { API_DEFAULT_CONFIG } from '@/config/settings'
import apis from '@/service/api'

class ApiCounstructor {
  //
  constructor(options) {
    this.api = Object.create(null)
    this.debugApi = []
    this.apiBuilder(options)
  }

  //
  apiBuilder({ apis = {}, devBaseUrl, prodBaseUrl, isDevMode = false, isDebug = false, sep = '/' }) {
    Object.keys(apis).forEach((namespace) => {
      this.buildApiWidthNamespace({ namespace, apis: apis[namespace], isDevMode, isDebug, devBaseUrl, prodBaseUrl, sep })
    })
  }

  buildApiWidthNamespace({ namespace, apis, devBaseUrl, prodBaseUrl, isDevMode, isDebug, sep }) {
    apis.forEach((api) => {
      const { name, method, path, mockPath, params, desc } = api
      const apiNamespace = `${namespace}${sep}${name}`
      const url = isDevMode ? `${devBaseUrl}${mockPath}` : `${prodBaseUrl}${path}`

      Object.defineProperty(this.api, apiNamespace, {
        value(outerParams, outerOptions) {
          // 如果没传入参数 则传递默认参数
          // const data = _isEmpty(outerParams) ? params : _assign(params, outerParams) // assign合并对象, 会修改源对象(params)的值, 页面同一个api多次请求(传递参数不同)可能导致参数混乱问题
          const data = _isEmpty(outerParams) ? params : { ...params, ...outerParams }
          // 开启debug时打印一些提示信息
          // isDebug && console.info(`调用业务接口名称:${apiNamespace}, 类型:${method}, 地址:${url}, 描述:${desc}`)
          //
          return axios(axiosParamBuilder(_assign({ url, method, desc }, outerOptions), data)).catch((error) => {
            if (error.code === 'ECONNABORTED') {
              console.error('请求超时，数据未保存或同步，请稍后重试')
              Message.warning('请求超时，数据未保存或同步，请稍后重试')
            }
            throw error
          })
        }
      })
    })
  }
}

function axiosParamBuilder(options, data) {
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    options.data = data
  } else if (options.method === 'GET') {
    options.params = data
  }
  return options
}

export default new ApiCounstructor({ apis: apis, ...API_DEFAULT_CONFIG })['api']
