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
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
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
// viser-vue
Vue.component('v-contextmenu', Contextmenu)
Vue.component('v-contextmenu-item', ContextmenuItem)
// 全局注册CustomView--CustomView

// Vue.component('custom-view', CustomView)

Vue.prototype.$echarts = echarts

Number.prototype.toFixedNoRound = function(decimals) {
  const factor = Math.pow(10, decimals);
  return Math.floor(this * factor) / factor;
};
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
