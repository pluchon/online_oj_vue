// 登录页面逻辑实现（墨衡后台管理）
import { defineComponent, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { loginApi } from '@/api/user'
import { setToken } from '@/utils/auth'
import Masonry from '@/components/Masonry/Masonry.vue'

// 导入生成的 12 张复古学术与算法美学背景图
import bg1 from '@/assets/images/b_login_background_1.jpg'
import bg2 from '@/assets/images/b_login_background_2.jpg'
import bg3 from '@/assets/images/b_login_background_3.jpg'
import bg4 from '@/assets/images/b_login_background_4.jpg'
import bg5 from '@/assets/images/b_login_background_5.jpg'
import bg6 from '@/assets/images/b_login_background_6.jpg'
import bg7 from '@/assets/images/b_login_background_7.jpg'
import bg8 from '@/assets/images/b_login_background_8.jpg'
import bg9 from '@/assets/images/b_login_background_9.jpg'
import bg10 from '@/assets/images/b_login_background_10.jpg'
import bg11 from '@/assets/images/b_login_background_11.jpg'
import bg12 from '@/assets/images/b_login_background_12.jpg'

export default defineComponent({
  name: 'Login',
  components: {
    User,
    Lock,
    Masonry
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    // 表单双向绑定数据
    const loginForm = reactive({
      userAccount: '',
      password: ''
    })

    // 记住我勾选项
    const rememberMe = ref(false)

    // 提交过程中的加载状态（防重复点击）
    const loading = ref(false)

    // 行内表单校验错误提示
    const errorMsg = ref('')

    // 右侧瀑布流卡片列表（分配高雅错落高度并绑定生成的12张复古工笔手稿图）
    const cards = ref([
      { id: 'card-1', height: 260, img: bg1 },
      { id: 'card-2', height: 210, img: bg2 },
      { id: 'card-3', height: 290, img: bg3 },
      { id: 'card-4', height: 230, img: bg4 },
      { id: 'card-5', height: 270, img: bg5 },
      { id: 'card-6', height: 220, img: bg6 },
      { id: 'card-7', height: 300, img: bg7 },
      { id: 'card-8', height: 240, img: bg8 },
      { id: 'card-9', height: 280, img: bg9 },
      { id: 'card-10', height: 210, img: bg10 },
      { id: 'card-11', height: 290, img: bg11 },
      { id: 'card-12', height: 250, img: bg12 }
    ])

    /**
     * 处理管理员登录提交
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
        const token = await loginApi({
          userAccount: account,
          password: pwd
        })

        if (token) {
          setToken(token)
        }

        ElMessage.success('登录成功，欢迎回来！')

        // 成功后优先跳转至重定向来源页，无来源则默认跳转至后台首页
        const redirect = (route.query?.redirect && route.query.redirect !== '/login')
          ? route.query.redirect
          : '/system'
        router.push(redirect)
      } catch (err) {
        errorMsg.value = err?.message || '登录验证失败，请检查账号密码'
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      rememberMe,
      loading,
      errorMsg,
      cards,
      handleLogin
    }
  }
})
