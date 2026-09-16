// 前端路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import Login from '../views/Login.vue'
import System from '../views/System.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 根路径重定向至系统管理页，由路由守卫统一按登录态分发
    {
      path: '/',
      redirect: '/system',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/system',
      name: 'system',
      component: System,
      children: [
        {
          path: 'user',
          name: 'UserManage',
          component: () => import('../views/user/UserManage.vue'),
        },
        {
          path: 'question',
          name: 'QuestionManage',
          component: () => import('../views/question/QuestionManage.vue'),
        },
        {
          path: 'exam',
          name: 'ExamManage',
          component: () => import('../views/exam/ExamManage.vue'),
        },
      ],
    },
    {
      path: '/home',
      redirect: '/system',
    },
  ],
})

// 免登录白名单路由
const whiteList = ['/login']

// 全局前置路由守卫
router.beforeEach(async (to, from, next) => {
  const hasToken = getToken()

  if (hasToken) {
    // 已经登录状态下，若试图访问登录页，直接重定向至管理后台
    if (to.path === '/login') {
      next({ path: '/system' })
    } else {
      const { userInfo, getUserInfoAction, resetUserInfoAction } = useUserStore()
      // 判断本地全局状态中是否已有用户信息
      if (userInfo.value && userInfo.value.nickName) {
        next()
      } else {
        try {
          // 首次进入或刷新页面，在路由守卫处前置调用接口校验 Token 并拉取管理员详情
          await getUserInfoAction()
          // 校验通过，方允许挂载目标管理页面
          next()
        } catch (error) {
          // Token 在服务端已失效（如 3001 过期），清空本地状态与凭据，在门外截停回跳登录页
          resetUserInfoAction()
          next({ path: '/login', query: { redirect: to.fullPath } })
        }
      }
    }
  } else {
    // 未登录状态下
    if (whiteList.includes(to.path)) {
      // 访问白名单页面，正常放行
      next()
    } else {
      // 访问受保护页面，拦截并跳转到登录页，并记录原目标地址便于登录后回跳
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})

export default router
