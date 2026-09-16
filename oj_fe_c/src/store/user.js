// C端用户全局状态管理
import { reactive, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'

const state = reactive({
  token: getToken() || '',
  userInfo: null
})

export const useUserStore = () => {
  const token = computed(() => state.token)
  const userInfo = computed(() => state.userInfo)
  const nickName = computed(() => state.userInfo?.nickName || '用户')

  // 设置并持久化用户凭据
  const setTokenAction = (newToken) => {
    state.token = newToken
    setToken(newToken)
  }

  // 设置用户信息
  const setUserInfoAction = (info) => {
    state.userInfo = info
  }

  // 登出/清理状态
  const resetUserAction = () => {
    state.token = ''
    state.userInfo = null
    removeToken()
  }

  return {
    token,
    userInfo,
    nickName,
    setTokenAction,
    setUserInfoAction,
    resetUserAction
  }
}
