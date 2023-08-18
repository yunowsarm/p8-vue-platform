import Vue from 'vue'
import Stomp from 'stompjs'
import { WS_CONFIG } from '@/config/settings'

class DispatchWebsocket {
  constructor({ url, login, passcode }) {
    this.url = url
    this.ws = null
    this.client = null
    this.headers = {
      login: login,
      passcode: passcode
    }
    this.onConnect = {}
    this.onError = () => {}
    this.isConnect = false
  }

  createWSConnection() {
    if (!Vue.prototype.$ws && this.url) {
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket(this.url)
        this.client = Stomp.over(this.ws)
        this.client.debug = false
        this.onConnect = () => {
          this.isConnect = true
          resolve()
        }
        this.onError = () => {
          reject(new Error('创建websoket链接失败.'))
        }
        this.client.connect(this.headers, this.onConnect, this.onError)
      })
    } else {
      console.warn('已经创建了webscoket链接，不需要重复创建！')
    }
  }

  destroyWSConnection() {
    return new Promise((resolve) => {
      this.ws &&
        this.client.disconnect(() => {
          this.isConnect = false
          resolve()
        })
    })
  }
}

export default {
  install(Vue) {
    const { isOpen, websocket } = WS_CONFIG
    if (isOpen) {
      const ws = new DispatchWebsocket(websocket)
      ws.createWSConnection()
      // 绑定websocket至原型对象
      Object.defineProperty(Vue.prototype, '$ws', {
        value: ws
      })
    }
  }
}
