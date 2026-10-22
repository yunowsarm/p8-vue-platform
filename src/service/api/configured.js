import axios from '@/plugins/axios'
import { requestUrl } from '@/utils/common'

// 后台配置的自定义数据源没有固定地址，统一在接口层处理环境地址和请求。
export function postConfiguredData(path, data = {}) {
  return axios.post(requestUrl(path), data)
}
