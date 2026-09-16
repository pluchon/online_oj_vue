// C端用户相关 API
import request from '@/utils/request'

/**
 * 发送短信验证码接口
 * @param {Object|string} phone - 手机号或参数对象
 * @returns {Promise} OJResult<Void>
 */
export function sendCodeApi(phone) {
  const data = typeof phone === 'object' ? phone : { phone }
  return request({
    url: '/friend/user/send-code',
    method: 'post',
    data
  })
}

/**
 * 用户短信验证码登录与注册统一接口
 * @param {Object} data - { phone: string, code: string }
 * @returns {Promise} OJResult<String>，返回值直接脱壳为 JWT 令牌字符串
 */
export function loginApi(data) {
  return request({
    url: '/friend/user/login',
    method: 'post',
    data
  })
}
