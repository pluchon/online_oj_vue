// C 端用户全局状态（令牌与导航栏展示用的昵称、头像）
import { reactive, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserProfileApi, logoutApi } from '@/api/user'

// 本地缓存键（刷新页面时先用缓存渲染导航栏，再以服务端资料为准）
const USER_INFO_KEY = 'user_info'

// 读取本地缓存的用户信息
const readCachedUserInfo = () => {
  try {
    const saved = localStorage.getItem(USER_INFO_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    return null
  }
}

// 写入本地缓存（存储不可用时忽略）
const writeCachedUserInfo = (info) => {
  try {
    if (info) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  } catch (e) {
    // 浏览器禁用存储时仅保留内存状态
  }
}

// 响应式单例状态
const state = reactive({
  token: getToken() || '',
  userInfo: readCachedUserInfo()
})

export const useUserStore = () => {
  // 是否已登录
  const isLogin = computed(() => Boolean(state.token))

  // 用户信息
  const userInfo = computed(() => state.userInfo)

  // 昵称（未加载时为空，由页面决定占位文案）
  const nickName = computed(() => state.userInfo?.nickName || '')

  // 头像地址
  const headImage = computed(() => state.userInfo?.headImage || '')

  // 保存令牌
  const setTokenAction = (newToken, remember = false) => {
    state.token = newToken
    setToken(newToken, remember)
  }

  // 局部更新用户信息（资料修改、头像上传后调用）
  const updateUserInfoAction = (partial) => {
    state.userInfo = { ...(state.userInfo || {}), ...partial }
    writeCachedUserInfo(state.userInfo)
  }

  // 从服务端拉取当前用户资料
  const fetchUserInfoAction = async () => {
    const profile = await getUserProfileApi()
    updateUserInfoAction({
      userId: profile.userId,
      nickName: profile.nickName,
      headImage: profile.headImage
    })
    return profile
  }

  // 清除本地登录态
  const resetUserAction = () => {
    state.token = ''
    state.userInfo = null
    removeToken()
    writeCachedUserInfo(null)
  }

  // 退出登录：先销毁服务端会话，失败也清除本地登录态
  const logoutAction = async () => {
    try {
      await logoutApi()
    } finally {
      resetUserAction()
    }
  }

  return {
    isLogin,
    userInfo,
    nickName,
    headImage,
    setTokenAction,
    updateUserInfoAction,
    fetchUserInfoAction,
    resetUserAction,
    logoutAction
  }
}
