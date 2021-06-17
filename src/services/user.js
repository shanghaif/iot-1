import { LOGIN, ROUTES, REFRESH_TOKEN } from '@/services/api'
import { request, METHOD, removeAuthorization } from '@/utils/request'


function sha256(password) {
  let sha256 = require("js-sha256").sha256
  return sha256(password)
}

/**
 * 登录服务
 * @param name 账户名
 * @param password 账户密码
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function login(name, password) {
  //localStorage.setItem("UN",name)
  return request(LOGIN, METHOD.POST, {
    un: name,
    pd: sha256(password)
  })
}

export function refreshToken() {
  console.log("======================refreshtoken===========", new Date())
  request(REFRESH_TOKEN, METHOD.POST)
}

export async function getRoutesConfig() {
  return request(ROUTES, METHOD.GET)
}

/**
 * 退出登录
 */
export function logout() {
  localStorage.removeItem(process.env.VUE_APP_ROUTES_KEY)
  localStorage.removeItem(process.env.VUE_APP_PERMISSIONS_KEY)
  localStorage.removeItem(process.env.VUE_APP_ROLES_KEY)
  removeAuthorization()
}



export default {
  login,
  logout,
  getRoutesConfig,
}
console.log("begin-----------------interval to refresh token-----------", new Date())
setInterval(() => {
  refreshToken()
}, 1000 * 60 * 10)