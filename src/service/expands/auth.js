import Cookie from 'vue-cookie'
import store from '@/plugins/store'
import { getSession, setSession, removeSession } from '@/service/expands/session'
import GLOBAL_CONST from '@/config/const'

const TOKEN_KEY = GLOBAL_CONST.token.tokenKey

function getToken() {
  return Cookie.get(TOKEN_KEY) ? Cookie.get(TOKEN_KEY) : getSession(TOKEN_KEY)
}

function setToken(token) {
  if (store.state.user.loginStatus) {
    Cookie.set(TOKEN_KEY, token, 7)
  } else {
    setSession(TOKEN_KEY, token)
  }
}

function removeToken() {
  Cookie.get(TOKEN_KEY) ? Cookie.delete(TOKEN_KEY) : removeSession(TOKEN_KEY)
}

export { getToken, setToken, removeToken }
