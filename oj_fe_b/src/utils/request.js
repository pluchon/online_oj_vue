// Axios 网络请求二次封装（已适配微服务网关与两层数据脱壳策略）
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getToken, removeToken } from '@/utils/auth'

// 创建 Axios 实例
const service = axios.create({
  // 开发环境走 Vite 代理(/dev-api)转发到微服务网关(19090)，隔离前端路由与接口路径
  baseURL: import.meta.env.VITE_API_BASE_URL || '/dev-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 若 Cookie 中存在 token，网关 AuthFilter 支持 Authorization: Bearer <token> 或 token 请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 1. 若返回的是二进制等非 JSON 格式数据（例如导出 Excel、验证码图片等），直接返回原始响应体
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      return res
    }

    // 2. 统一断言：后端 Online OJ 统一响应契约 OJResult(code, msg, data)
    // 成功码为 ResultCode.SUCCESS = 1000（兼顾通用约定 200 / 0）
    const isSuccess = res.code === 1000 || res.code === 200 || res.code === 0

    // 3. 业务失败拦截与全局统一阻断
    if (res && typeof res.code !== 'undefined' && !isSuccess) {
      const errorMsg = res.msg || res.message || '业务操作失败'
      ElMessage.error(errorMsg)

      // 3001 为后端 ResultCode.FAILED_UNAUTHORIZED（未授权 / 登录过期 / 令牌无效）
      if (res.code === 3001 || res.code === 401) {
        removeToken()
        router.push('/login')
      }

      // 抛出错误以切断调用链路，保证业务代码不会执行成功后续分支
      return Promise.reject(new Error(errorMsg))
    }

    // 4. 特殊需求支持：若调用方显式声明需要完整响应体（含 code, msg 等），则不执行脱壳
    if (response.config?.isReturnFullResponse) {
      return res
    }

    // 若后端返回的是 TableDataResult 列表分页实体（外层直接含 rows 与 total），直接向业务层返回 { rows, total }
    if (res && res.rows !== undefined) {
      return {
        rows: res.rows || [],
        total: res.total || 0
      }
    }

    // 5. 顶层脱壳策略：剥离后端 OJResult 外壳，直接向业务层返回纯净的业务数据 res.data
    // 若接口为 void 无实体返回（data 为 null 或 undefined），则返回 true 代表操作成功
    return res.data !== undefined && res.data !== null ? res.data : true
  },
  (error) => {
    let message = '网络请求异常，请稍后重试'

    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          message = data?.msg || data?.message || '请求参数错误'
          break
        case 401:
          message = '登录状态已失效，请重新登录'
          removeToken()
          router.push('/login')
          break
        case 403:
          message = '抱歉，您无权访问该资源'
          break
        case 404:
          message = '请求微服务接口不存在'
          break
        case 500:
        case 502:
        case 503:
          message = '微服务网关或后端服务繁忙，请稍后重试'
          break
        default:
          message = data?.msg || data?.message || `网络连接错误 [${status}]`
      }
    } else if (error.message && error.message.includes('timeout')) {
      message = '网络请求超时，请检查网络或网关连接'
    } else if (!window.navigator.onLine) {
      message = '网络已断开，请检查网络设置'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
