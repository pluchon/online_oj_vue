// 前端路由配置
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import System from '../views/System.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
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
    },
    {
      path: '/home',
      redirect: '/system',
    },
  ],
})

export default router
