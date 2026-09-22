// Axios 请求封装：统一携带令牌、剥离 OJResult 外壳、集中提示错误
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import { SUCCESS_CODE, UNAUTHORIZED_CODE, PUBLIC_PATHS } from '@/constants'

// 创建 Axios 实例（开发环境经 Vite 代理 /dev-api 转发到网关）
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/dev-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 登录失效：清除本地登录态；受保护页面跳转登录，公开页面留在原地（并发请求只提示一次）
let handlingUnauthorized = false
const handleUnauthorized = (message) => {
  useUserStore().resetUserAction()
  if (handlingUnauthorized) {
    return
  }
  handlingUnauthorized = true
  ElMessage.error(message)
  const current = router.currentRoute.value
  if (PUBLIC_PATHS.includes(current.path)) {
    handlingUnauthorized = false
    return
  }
  router.push({ path: '/login', query: { redirect: current.fullPath } }).finally(() => {
    handlingUnauthorized = false
  })
}

// 请求拦截器：携带 Bearer 令牌
service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：业务失败统一提示并中断调用链
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 二进制响应直接返回
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      return res
    }
    if (res.code !== SUCCESS_CODE) {
      const errorMsg = res.msg || '业务操作失败'
      if (res.code === UNAUTHORIZED_CODE) {
        handleUnauthorized(errorMsg)
      } else {
        ElMessage.error(errorMsg)
      }
      return Promise.reject(new Error(errorMsg))
    }
    // 分页结果（TableDataResult）直接返回 rows 与 total
    if (res.rows !== undefined) {
      return {
        rows: res.rows || [],
        total: res.total || 0
      }
    }
    // 无返回体的写操作以 true 表示成功
    return res.data !== undefined && res.data !== null ? res.data : true
  },
  (error) => {
    let message = '网络请求异常，请稍后重试'
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        handleUnauthorized('登录状态已失效，请重新登录')
        return Promise.reject(error)
      }
      if (status === 403) {
        message = '抱歉，您无权访问该资源'
      } else if (status === 404) {
        message = '请求的接口不存在'
      } else if (status >= 500) {
        message = '服务繁忙，请稍后重试'
      } else {
        message = error.response.data?.msg || `网络连接错误 [${status}]`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '网络请求超时，请稍后重试'
    } else if (!window.navigator.onLine) {
      message = '网络已断开，请检查网络设置'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
