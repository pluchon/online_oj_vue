// 登录页面逻辑实现
import { defineComponent, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/user'
import { setToken } from '@/utils/auth'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()

    // 表单双向绑定数据
    const loginForm = reactive({
      userAccount: '',
      password: ''
    })

    // 提交过程中的加载状态（防重复点击）
    const loading = ref(false)

    // 行内表单校验错误提示
    const errorMsg = ref('')

    /**
     * 处理登录提交
     */
    const handleLogin = async () => {
      // 提交期间禁止重复触发
      if (loading.value) {
        return
      }

      const account = loginForm.userAccount?.trim()
      const pwd = loginForm.password

      // 前置基础校验
      if (!account) {
        errorMsg.value = '请输入管理员账号'
        ElMessage.warning('请输入管理员账号')
        return
      }

      if (!pwd) {
        errorMsg.value = '请输入登录密码'
        ElMessage.warning('请输入登录密码')
        return
      }

      errorMsg.value = ''
      loading.value = true

      try {
        // 调用 B 端管理员登录接口：POST /system/sysUser/login
        // 拦截器已统一完成两层脱壳与结果断言，返回值即为纯净的 JWT 令牌字符串
        const token = await loginApi({
          userAccount: account,
          password: pwd
        })

        if (token) {
          // 将 Token 存入 Cookie 中
          setToken(token)
        }

        ElMessage.success('登录成功，欢迎回来！')

        // 成功后优先跳转至重定向来源页，无来源则默认跳转至后台首页
        const redirect = (route.query?.redirect && route.query.redirect !== '/login')
          ? route.query.redirect
          : '/system'
        router.push(redirect)
      } catch (err) {
        // request.js 拦截器已统一弹出错误，此处同步给行内错误展示
        errorMsg.value = err?.message || '登录验证失败，请检查账号密码'
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      loading,
      errorMsg,
      handleLogin
    }
  }
})
