// Token 凭据管理（基于 js-cookie）
import Cookies from 'js-cookie'

const TOKEN_KEY = 'token'

/**
 * 从 Cookie 获取 Token
 * @returns {string|undefined}
 */
export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

/**
 * 将 Token 存储到 Cookie 中
 * @param {string} token
 * @param {Object} [options] 可选的 Cookie 配置（如 expires）
 */
export function setToken(token, options) {
  return Cookies.set(TOKEN_KEY, token, options)
}

/**
 * 从 Cookie 移除 Token
 */
export function removeToken() {
  return Cookies.remove(TOKEN_KEY)
}
