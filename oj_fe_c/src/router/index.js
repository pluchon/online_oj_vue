// C 端前端路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { setPageTitle } from '@/utils/title'
import { PUBLIC_PATHS } from '@/constants'
import Login from '../views/Login.vue'
import ExamList from '../views/exam/ExamList.vue'
import QuestionList from '../views/question/QuestionList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/question'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: '登录' }
    },
    {
      path: '/question',
      name: 'question',
      component: QuestionList,
      meta: { title: '题库' }
    },
    {
      path: '/exam',
      name: 'exam',
      component: ExamList,
      meta: { title: '竞赛' }
    },
    {
      path: '/my-exam',
      name: 'myExam',
      component: ExamList,
      props: { mine: true },
      meta: { title: '我的竞赛' }
    },
    {
      path: '/user/profile',
      name: 'userProfile',
      component: () => import('../views/user/UserProfile.vue'),
      meta: { title: '个人中心' }
    },
    {
      path: '/question/do',
      name: 'questionDo',
      component: () => import('../views/question/QuestionDo.vue'),
      meta: { title: '做题' }
    },
    {
      path: '/message',
      name: 'message',
      component: () => import('../views/message/Message.vue'),
      meta: { title: '消息' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/question'
    }
  ]
})

// 全局路由守卫：已登录访问登录页回到题库，未登录访问受保护页面跳转登录
router.beforeEach((to) => {
  const hasToken = Boolean(getToken())
  if (hasToken && to.path === '/login') {
    return { path: '/question' }
  }
  if (!hasToken && !PUBLIC_PATHS.includes(to.path)) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

// 路由切换后同步标签页标题
router.afterEach((to) => {
  setPageTitle(to.meta?.title)
})

export default router
