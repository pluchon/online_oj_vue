// C 端用户相关接口
import request from '@/utils/request'

// 发送短信验证码
export function sendCodeApi(data) {
  return request({
    url: '/friend/user/send-code',
    method: 'post',
    data
  })
}

// 短信验证码登录（新用户自动注册），返回令牌字符串
export function loginApi(data) {
  return request({
    url: '/friend/user/login',
    method: 'post',
    data
  })
}

// 退出登录（销毁服务端会话）
export function logoutApi() {
  return request({
    url: '/friend/user/logout',
    method: 'delete'
  })
}

// 获取当前登录用户个人资料
export function getUserProfileApi() {
  return request({
    url: '/friend/user/profile',
    method: 'get'
  })
}

// 更新当前登录用户个人资料
export function updateUserProfileApi(data) {
  return request({
    url: '/friend/user/profile',
    method: 'put',
    data,
    // 昵称与个人介绍变化时后端会先做内容审核
    timeout: 15000
  })
}

// 上传当前登录用户头像，返回头像地址
export function uploadAvatarApi(formData) {
  return request({
    url: '/friend/user/avatar',
    method: 'post',
    data: formData,
    // 上传前后端会先做头像审核，耗时较长
    timeout: 20000,
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
