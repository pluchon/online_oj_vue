// 用户相关 API（包含管理员与普通用户接口）
import request from '@/utils/request'

/**
 * 管理员登录接口
 * @param {Object|string} userAccount - 登录入参对象或用户名
 * @param {string} [password] - 用户密码
 * @returns {Promise} OJResult<String>，data 为 JWT Token 字符串
 */
export function loginApi(userAccount, password) {
  const data = typeof userAccount === 'object' ? userAccount : { userAccount, password }
  return request({
    url: '/system/sysUser/login',
    method: 'post',
    data
  })
}

/**
 * 获取当前登录管理员信息（通过请求头Token识别）
 * @returns {Promise} 包含 nickName 的管理员视图对象
 */
export function getUserDetailApi() {
  return request({
    url: '/system/sysUser/me',
    method: 'get'
  })
}

/**
 * 新增管理员用户
 * @param {Object} data - SysUserSaveDTO
 */
export function addUserApi(data) {
  return request({
    url: '/system/sysUser',
    method: 'post',
    data
  })
}

/**
 * 删除管理员用户
 * @param {string|number} userId
 */
export function deleteUserApi(userId) {
  return request({
    url: `/system/sysUser/${userId}`,
    method: 'delete'
  })
}

/**
 * 管理员退出登录
 * @returns {Promise}
 */
export function logoutApi() {
  return request({
    url: '/system/sysUser/logout',
    method: 'delete'
  })
}

// ================= 普通用户（C端用户）管理 API =================

// 分页查询普通用户列表（支持用户ID精确匹配与昵称模糊过滤）
export function getUserListApi(params = {}) {
  return request({
    url: '/system/user',
    method: 'get',
    params
  })
}

// 修改普通用户状态（拉黑 / 解禁）
export function updateUserStatusApi(data) {
  return request({
    url: `/system/user/${data.userId}/status`,
    method: 'put',
    data: { status: data.status }
  })
}

// 管理员编辑普通用户资料（手机号为登录凭据，需唯一）
export function updateUserInfoApi(data) {
  return request({
    url: `/system/user/${data.userId}`,
    method: 'put',
    data
  })
}
