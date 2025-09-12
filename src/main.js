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
import 'echarts-gl'
import api from 'p8-components-ui/dist/api'
import p8Config from '@/config/p8Config'
import P8LowCode from 'p8-lowcode'
import 'p8-lowcode/lib/P8LowCode.css'
// 引入入参出参封装公共方法
import P8ParamFunc from '@/utils/paramsEncapsulation.js'
import hljs from 'highlight.js'
import hljsVuePlugin from '@highlightjs/vue-plugin'
// 引入你需要的语言和样式
import 'highlight.js/styles/monokai.css' // 选择你喜欢的主题样式
// 注册插件
Vue.use(hljsVuePlugin, { hljs })
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

Vue.prototype.$P8ParamFunc = P8ParamFunc
Number.prototype.toFixedNoRound = function (decimals) {
  const factor = Math.pow(10, decimals)
  return Math.floor(this * factor) / factor
}
// 延迟加载非登录页必需的库
// 1. 延迟加载VXETable
const loadVXETable = () => {
  import('vxe-table').then((VXETable) => {
    import('vxe-table/lib/style.css')
    Vue.use(VXETable.default)
  })
  import('vxe-pc-ui').then((VxeUI) => {
    import('vxe-pc-ui/lib/style.css')
    Vue.use(VxeUI.default)
  })
}

// 2. 延迟加载echarts
const loadECharts = () => {
  import('echarts').then((echarts) => {
    if (!window.echarts) {
      window.echarts = echarts
      import('echarts-gl')
    }
    return window.echarts
  })
}

// 全局方法，供其他组件调用
Vue.prototype.$loadVXETable = loadVXETable
Vue.prototype.$loadECharts = loadECharts

// 挂载到window对象，供router.js使用
window.loadVXETable = loadVXETable
window.loadECharts = loadECharts
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
