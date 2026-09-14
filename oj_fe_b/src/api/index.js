// API 统一出口
// 遵循规范：页面禁止直接调用 Axios，统一走 src/api/ 封装
import request from '@/utils/request'
export * from './user'
export * from './question'
export * from './exam'

export { request }
export default request
