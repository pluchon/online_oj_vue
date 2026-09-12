// 用户状态管理（基于 Vue 3 响应式 API）
import { reactive, computed } from 'vue'
import { getUserDetailApi } from '@/api/user'
import { removeToken } from '@/utils/auth'

// 响应式单例状态
const state = reactive({
  userInfo: null
})

export const useUserStore = () => {
  // Getters 导出计算属性
  const userInfo = computed(() => state.userInfo)
  const nickName = computed(() => state.userInfo?.nickName || '')

  // Actions 业务操作
  // 获取当前登录管理员详情
  const getUserInfoAction = async () => {
    const data = await getUserDetailApi()
    state.userInfo = data
    return data
  }

  // 清除用户信息与凭据
  const resetUserInfoAction = () => {
    state.userInfo = null
    removeToken()
  }

  return {
    userInfo,
    nickName,
    getUserInfoAction,
    resetUserInfoAction
  }
}
