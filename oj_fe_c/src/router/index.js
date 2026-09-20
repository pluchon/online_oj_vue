// C端前端路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import Login from '../views/Login.vue'
import ExamList from '../views/exam/ExamList.vue'
import MyExamList from '../views/exam/MyExamList.vue'
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
      component: Login
    },
    {
      path: '/question',
      name: 'question',
      component: QuestionList
    },
    {
      path: '/exam',
      name: 'exam',
      component: ExamList
    },
    {
      path: '/my-exam',
      name: 'myExam',
      component: MyExamList
    },
    {
      path: '/user/profile',
      name: 'userProfile',
      component: () => import('../views/user/UserProfile.vue')
    },
    {
      path: '/question/do',
      name: 'questionDo',
      component: () => import('../views/question/QuestionDo.vue')
    },
    {
      path: '/message',
      name: 'message',
      component: () => import('../views/message/Message.vue')
    },
    {
      path: '/exam/rank',
      name: 'examRank',
      component: () => import('../views/exam/ExamRank.vue')
    },
    {
      path: '/home',
      redirect: '/question'
    }
  ]
})

// 免登录白名单路由
const whiteList = ['/login', '/exam', '/exam/rank', '/question', '/question/do']

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/exam' })
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})

export default router
