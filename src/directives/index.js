import drawerDrag from './modules/drawerDrag'
import dialogDrag from './modules/dialogDrag'

const install = function(Vue) {
  Vue.directive('drawerDrag', drawerDrag)
  Vue.directive('dialogDrag', dialogDrag)
}

if (window.Vue) {
  Vue.use(install); // eslint-disable-line
}

export default install
