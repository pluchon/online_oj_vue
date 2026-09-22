// 管理员与 C 端用户管理接口
import request from '@/utils/request'

// 管理员登录，返回令牌字符串
export function loginApi(data) {
  return request({
    url: '/system/sysUser/login',
    method: 'post',
    data
  })
}

// 获取当前登录管理员信息
export function getUserDetailApi() {
  return request({
    url: '/system/sysUser/me',
    method: 'get'
  })
}

// 管理员退出登录
export function logoutApi() {
  return request({
    url: '/system/sysUser/logout',
    method: 'delete'
  })
}

// 分页查询 C 端用户列表（支持用户ID精确匹配与昵称模糊过滤）
export function getUserListApi(params = {}) {
  return request({
    url: '/system/user',
    method: 'get',
    params
  })
}

// 修改 C 端用户状态（拉黑 / 解禁）
export function updateUserStatusApi(data) {
  return request({
    url: `/system/user/${data.userId}/status`,
    method: 'put',
    data: { status: data.status }
  })
}

// 管理员编辑 C 端用户资料（手机号为登录凭据，需唯一）
export function updateUserInfoApi(data) {
  return request({
    url: `/system/user/${data.userId}`,
    method: 'put',
    data
  })
}
