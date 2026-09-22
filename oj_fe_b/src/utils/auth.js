// 令牌凭据管理（基于 js-cookie）
import Cookies from 'js-cookie'

// 与 C 端区分：Cookie 不区分端口，同一 localhost 下共用同名 Cookie 会互相覆盖令牌
const TOKEN_KEY = 'oj_b_token'

// 勾选"记住我"时令牌 Cookie 保留的天数（服务端会话仍按自身有效期失效）
const REMEMBER_DAYS = 7

// 读取令牌
export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

// 保存令牌：记住我时持久化，否则为会话 Cookie（关闭浏览器即清除）
export function setToken(token, remember = false) {
  return Cookies.set(TOKEN_KEY, token, remember ? { expires: REMEMBER_DAYS } : undefined)
}

// 清除令牌
export function removeToken() {
  return Cookies.remove(TOKEN_KEY)
}
