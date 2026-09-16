// C端用户短信登录与注册逻辑实现
import { defineComponent, reactive, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { sendCodeApi, loginApi } from '@/api/user'
import { useUserStore } from '@/store/user'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { setTokenAction } = useUserStore()

    // 表单输入绑定
    const loginForm = reactive({
      phone: '',
      code: ''
    })

    // 状态定义
    const loading = ref(false)
    const codeLoading = ref(false)
    const countdown = ref(0)
    const errorMsg = ref('')
    let timer = null

    // 清除倒计时定时器
    const clearTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    // 组件卸载时释放定时器
    onUnmounted(() => {
      clearTimer()
    })

    /**
     * 发送短信验证码处理
     */
    const handleSendCode = async () => {
      const phone = loginForm.phone?.trim()
      if (!phone) {
        errorMsg.value = '请输入手机号'
        ElMessage.warning('请输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        errorMsg.value = '请输入正确的11位大陆手机号'
        ElMessage.warning('请输入正确的11位大陆手机号')
        return
      }

      errorMsg.value = ''
      codeLoading.value = true

      try {
        await sendCodeApi({ phone })
        ElMessage.success('验证码已发送，请注意查收短信')

        // 启动 60 秒冷却倒计时
        countdown.value = 60
        clearTimer()
        timer = setInterval(() => {
          if (countdown.value > 1) {
            countdown.value--
          } else {
            countdown.value = 0
            clearTimer()
          }
        }, 1000)
      } catch (err) {
        errorMsg.value = err?.message || '验证码发送失败，请稍后重试'
      } finally {
        codeLoading.value = false
      }
    }

    /**
     * 统一登录/注册提交处理
     */
    const handleLogin = async () => {
      if (loading.value) {
        return
      }

      const phone = loginForm.phone?.trim()
      const code = loginForm.code?.trim()

      if (!phone) {
        errorMsg.value = '请输入手机号'
        ElMessage.warning('请输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        errorMsg.value = '请输入正确的11位大陆手机号'
        ElMessage.warning('请输入正确的11位大陆手机号')
        return
      }
      if (!code) {
        errorMsg.value = '请输入短信验证码'
        ElMessage.warning('请输入短信验证码')
        return
      }

      errorMsg.value = ''
      loading.value = true

      try {
        // 调用统一登录/注册接口：POST /friend/user/login
        // 成功时返回脱壳后的 JWT Token 字符串
        const token = await loginApi({ phone, code })

        if (token) {
          setTokenAction(token)
        }

        ElMessage.success('登录成功，欢迎来到比特OJ！')

        // 跳转至重定向页或首页
        const redirect = (route.query?.redirect && route.query.redirect !== '/login')
          ? route.query.redirect
          : '/home'
        router.push(redirect)
      } catch (err) {
        errorMsg.value = err?.message || '登录失败，请核对验证码'
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      loading,
      codeLoading,
      countdown,
      errorMsg,
      handleSendCode,
      handleLogin
    }
  }
})
