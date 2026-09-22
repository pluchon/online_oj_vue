// C端用户短信登录与注册逻辑实现
import { defineComponent, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Iphone, ChatDotSquare } from '@element-plus/icons-vue'
import { sendCodeApi, loginApi } from '@/api/user'
import { useUserStore } from '@/store/user'

// 记住我时保存手机号的本地存储键
const STORAGE_PHONE_KEY = 'moheng_c_phone'

// 手机号格式
const PHONE_PATTERN = /^1[3-9]\d{9}$/

// 验证码重新发送冷却秒数
const CODE_COOLDOWN_SECONDS = 60

export default defineComponent({
  name: 'Login',
  components: {
    Iphone,
    ChatDotSquare
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { setTokenAction, fetchUserInfoAction } = useUserStore()

    // 表单数据
    const loginForm = reactive({
      phone: '',
      code: ''
    })

    // 交互状态
    const rememberMe = ref(true)
    const loading = ref(false)
    const codeLoading = ref(false)
    const countdown = ref(0)
    const errorMsg = ref('')
    let timer = null

    // 清理倒计时定时器
    const clearTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    // 初始化读取已记住的手机号（存储不可用时忽略）
    onMounted(() => {
      try {
        const savedPhone = localStorage.getItem(STORAGE_PHONE_KEY)
        if (savedPhone) {
          loginForm.phone = savedPhone
          rememberMe.value = true
        }
      } catch (e) {
        // 浏览器禁用存储时不回填
      }
    })

    // 组件卸载时释放定时器
    onUnmounted(() => {
      clearTimer()
    })

    // 发送短信验证码
    const handleSendCode = async () => {
      const phone = loginForm.phone?.trim()
      if (!phone) {
        errorMsg.value = '请输入手机号'
        ElMessage.warning('请输入手机号')
        return
      }
      if (!PHONE_PATTERN.test(phone)) {
        errorMsg.value = '请输入正确的11位手机号'
        ElMessage.warning('请输入正确的11位手机号')
        return
      }

      errorMsg.value = ''
      codeLoading.value = true

      try {
        await sendCodeApi({ phone })
        ElMessage.success('验证码已发送')

        // 启动重新发送冷却
        countdown.value = CODE_COOLDOWN_SECONDS
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

    // 登录与进入系统
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
      if (!PHONE_PATTERN.test(phone)) {
        errorMsg.value = '请输入正确的11位手机号'
        ElMessage.warning('请输入正确的11位手机号')
        return
      }
      if (!code) {
        errorMsg.value = '请输入验证码'
        ElMessage.warning('请输入验证码')
        return
      }

      errorMsg.value = ''
      loading.value = true

      try {
        const token = await loginApi({ phone, code })
        setTokenAction(token, rememberMe.value)
        // 同步昵称与头像，失败不影响登录
        fetchUserInfoAction().catch(() => {})

        // 记住我时保存手机号
        try {
          if (rememberMe.value) {
            localStorage.setItem(STORAGE_PHONE_KEY, phone)
          } else {
            localStorage.removeItem(STORAGE_PHONE_KEY)
          }
        } catch (e) {
          // 浏览器禁用存储时忽略
        }

        ElMessage.success('欢迎进入墨衡')

        const redirect = (route.query?.redirect && route.query.redirect !== '/login')
          ? route.query.redirect
          : '/question'
        router.push(redirect)
      } catch (err) {
        errorMsg.value = err?.message || '登录失败，请核对验证码'
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      rememberMe,
      loading,
      codeLoading,
      countdown,
      errorMsg,
      handleSendCode,
      handleLogin
    }
  }
})
