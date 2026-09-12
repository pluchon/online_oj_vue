// 管理员用户相关 API（对接 oj_system /sysUser）
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
 * 获取当前登录管理员用户详情（通过请求头Token获取）
 * @returns {Promise} 包含 nickName 的管理员视图对象
 */
export function getUserDetailApi() {
  return request({
    url: '/system/sysUser/detail',
    method: 'get'
  })
}

/**
 * 新增管理员用户
 * @param {Object} data - SysUserSaveDTO
 */
export function addUserApi(data) {
  return request({
    url: '/system/sysUser/add',
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
