// C端用户全局状态管理
import { reactive, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'

let initialUserInfo = null
try {
  const saved = localStorage.getItem('user_info')
  if (saved) {
    initialUserInfo = JSON.parse(saved)
  }
} catch (e) {
  initialUserInfo = null
}

const state = reactive({
  token: getToken() || '',
  userInfo: initialUserInfo
})

export const useUserStore = () => {
  const token = computed(() => state.token)
  const userInfo = computed(() => state.userInfo)
  const nickName = computed(() => state.userInfo?.nickName || '用户')
  const headImage = computed(() => state.userInfo?.headImage || '')

  // 设置并持久化用户凭据
  const setTokenAction = (newToken) => {
    state.token = newToken
    setToken(newToken)
  }

  // 设置用户信息
  const setUserInfoAction = (info) => {
    state.userInfo = info
    if (info) {
      localStorage.setItem('user_info', JSON.stringify(info))
    } else {
      localStorage.removeItem('user_info')
    }
  }

  // 部分增量更新用户信息
  const updateUserInfoAction = (partial) => {
    if (!state.userInfo) {
      state.userInfo = { ...partial }
    } else {
      state.userInfo = { ...state.userInfo, ...partial }
    }
    localStorage.setItem('user_info', JSON.stringify(state.userInfo))
  }

  // 登出/清理状态
  const resetUserAction = () => {
    state.token = ''
    state.userInfo = null
    removeToken()
    localStorage.removeItem('user_info')
  }

  return {
    token,
    userInfo,
    nickName,
    headImage,
    setTokenAction,
    setUserInfoAction,
    updateUserInfoAction,
    resetUserAction
  }
}
