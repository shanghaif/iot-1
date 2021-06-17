//import Cookie from 'js-cookie'
import {showError} from '@/utils/error'
// 401拦截
const resp401 = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    const {message,router} = options
    if (response.code === 401) {
      message.error('无此权限，将重新登录...')
      router.push('/login')
    }
  
    return response
  },
  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message,router} = options
    const {response} = error
    if (response && response.status === 401) {
      message.error('无此权限，将重新登录...')
      router.push('/login')
    }
    return Promise.reject(error)
  }
}

const resp403 = {
  onFulfilled(response, options) {
    const {message} = options
    if (response.code === 403) {
      message.error('请求被拒绝')
    }
    return response
  },
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    if (response && response.status === 403) {
      message.error('请求被拒绝')
    }
    return Promise.reject(error)
  }
}

const reqCommon = {
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config) {
    /*const {message} = options
    const {url, xsrfCookieName} = config
    
    let token = sessionStorage.getItem(xsrfCookieName)
    if (url.indexOf('login') === -1 && xsrfCookieName && !token) {
      message.warning('认证 token 已过期，请重新登录')
    }else{
      config.headers["api_token"] = token
    }*/
    config.url = config.url.replace('//','/')
    return config
  },
  /**
   * 请求出错时做点什么
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    message.error(error.message)
    return Promise.reject(error)
  }
}
const resp200 = {
  onFulfilled(response, options) {
    const {message} = options
    if (response.data && response.data.error) {
      //const msg = response.data.error.message
      console.log("show ----------error",response.data.error.message)
      showError(message,response.data.error.code,response.data.error.message)
      return Promise.reject({response:response,error:response.data.error},options)
    }
    return response
  },
  onRejected(error, options) {
    const {message} = options
    //const {response} = error
    console.log("show ----------error2",error,options)
    showError(message,error.code,error.message)
    return Promise.reject(error)
  }
}
export default {
  request: [reqCommon], // 请求拦截
  response: [resp401, resp403,resp200] // 响应拦截
}

