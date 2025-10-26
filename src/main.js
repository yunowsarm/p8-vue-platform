// initialize base framework
import Vue from 'vue'
import config from '@/config'
import store from '@/plugins/store'
import inject from '@/plugins/inject'
import router from '@/plugins/router'
import App from './App'
import directive from './directives' // directive
import Validate from '@/utils/extendValidate/extendValidate.js'
import p8, { P8Contextmenu as Contextmenu, P8ContextmenuItem as ContextmenuItem } from 'p8-components-ui'
import * as echarts from 'echarts'
import 'echarts-gl'
import api from 'p8-components-ui/dist/api'
import p8Config from '@/config/p8Config'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VXETable from 'vxe-table'
import P8LowCode from 'p8-lowcode'
import 'vxe-table/lib/style.css'
import 'p8-lowcode/lib/P8LowCode.css'
// 引入入参出参封装公共方法
import P8ParamFunc from '@/utils/paramsEncapsulation.js'
import hljs from 'highlight.js'
import hljsVuePlugin from '@highlightjs/vue-plugin'
// 引入你需要的语言和样式
import 'highlight.js/styles/monokai.css' // 选择你喜欢的主题样式
// 注册插件
Vue.use(hljsVuePlugin, { hljs })
Vue.use(VxeUI)
Vue.use(VXETable)
Vue.use(api, p8Config)
Vue.use(p8)
Vue.use(directive)
// 全局配置项
Vue.use(config)
// 注入自定义组件和方法
Vue.use(inject)
// 表单校验
Vue.use(Validate)
Vue.use(P8LowCode, {
  loadComp: (url) => {
    return () => import('@/views/' + url + '.vue')
  }
})
// viser-vue
Vue.component('v-contextmenu', Contextmenu)
Vue.component('v-contextmenu-item', ContextmenuItem)
// 全局注册CustomView--CustomView

// Vue.component('custom-view', CustomView)

Vue.prototype.$echarts = echarts
Vue.prototype.$P8ParamFunc = P8ParamFunc
Vue.prototype.$isMobile = store.getters.isMobile
Vue.prototype.$blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
Number.prototype.toFixedNoRound = function (decimals) {
  const factor = Math.pow(10, decimals)
  return Math.floor(this * factor) / factor
}
const loadingElement = document.getElementById('app-loading')
if (loadingElement) {
  loadingElement.style.display = 'none'
}

window.addEventListener('resize', () => {
  store.dispatch('updateIsMobile')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: {
    App
  },
  template: '<App/>'
})
