// C端前端路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { setPageTitle } from '@/utils/title'
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
      component: MyExamList,
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
      path: '/home',
      redirect: '/question'
    }
  ]
})

// 免登录白名单路由
const whiteList = ['/login', '/exam', '/question', '/question/do']

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

// 路由切换后同步标签页标题
router.afterEach((to) => {
  setPageTitle(to.meta?.title)
})

export default router
