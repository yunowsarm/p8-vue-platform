import fitPage from './modules/fitPage'
import drawerDrag from './modules/drawerDrag'
import dialogDrag from './modules/dialogDrag'
import auth from './modules/auth'

const install = function (Vue) {
  Vue.directive('drawerDrag', drawerDrag)
  Vue.directive('dialogDrag', dialogDrag)
  Vue.directive('auth', auth)
  Vue.directive('fit-page', fitPage)
}

if (window.Vue) {
  Vue.use(install); // eslint-disable-line
}

export default install
