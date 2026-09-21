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

/**
 * 获取当前登录用户个人资料
 * @returns {Promise<Object>} UserVO 用户详情
 */
export function getUserProfileApi() {
  return request({
    url: '/friend/user/profile',
    method: 'get'
  })
}

/**
 * 更新当前登录用户个人资料
 * @param {Object} data - UserProfileUpdateDTO
 * @returns {Promise<boolean>}
 */
export function updateUserProfileApi(data) {
  return request({
    url: '/friend/user/profile',
    method: 'put',
    data
  })
}

/**
 * 上传当前登录用户头像
 * @param {FormData} formData - 包含 file 的表单数据
 * @returns {Promise<string>} 返回头像公网 URL
 */
export function uploadAvatarApi(formData) {
  return request({
    url: '/friend/user/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


// 获取当前用户做题统计与能力雷达（timeRange：all / year / month / week）
export function getUserOverviewApi(timeRange) {
  return request({
    url: '/friend/user/profile/overview',
    method: 'get',
    params: { timeRange }
  })
}

// 获取当前用户指定年份的每日提交次数
export function getUserCalendarApi(year) {
  return request({
    url: '/friend/user/profile/calendar',
    method: 'get',
    params: { year }
  })
}
