// C 端全局导航栏：导航高亮、用户信息展示与退出登录
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { PUBLIC_PATHS } from '@/constants'
import defaultAvatar from '@/assets/images/c_user_avatar.png'
import OjDialog from '@/components/OjDialog'
import { useConfirmDialog } from '@/utils/confirmDialog'

// 导航项（needLogin 为 true 时仅登录后展示）
const NAV_LINKS = [
  { path: '/question', label: '题库中心', needLogin: false },
  { path: '/exam', label: '竞赛中心', needLogin: false },
  { path: '/my-exam', label: '我的竞赛', needLogin: true },
  { path: '/message', label: '消息中心', needLogin: true },
  { path: '/user/profile', label: '个人中心', needLogin: true }
]

// 本次页面会话是否已从服务端同步过用户资料
let profileSynced = false

export default defineComponent({
  name: 'AppNavbar',
  components: {
    OjDialog
  },
  setup() {
    // 退出登录确认弹窗
    const confirmDialog = useConfirmDialog()

    const route = useRoute()
    const router = useRouter()
    const { isLogin, nickName, headImage, fetchUserInfoAction, logoutAction } = useUserStore()

    // 退出登录请求中
    const loggingOut = ref(false)

    // 头像加载失败时回退默认头像
    const avatarError = ref(false)
    const avatarSrc = computed(() => (!avatarError.value && headImage.value) || defaultAvatar)
    const handleAvatarError = () => {
      avatarError.value = true
    }
    watch(headImage, () => {
      avatarError.value = false
    })

    // 当前可见的导航项
    const visibleLinks = computed(() => NAV_LINKS.filter((item) => !item.needLogin || isLogin.value))

    // 当前高亮的导航项（竞赛内做题归属竞赛中心）
    const activePath = computed(() => {
      if (route.path === '/question/do') {
        return route.query.examId ? '/exam' : '/question'
      }
      return NAV_LINKS.find((item) => route.path.startsWith(item.path))?.path || ''
    })

    // 品牌跳转题库
    const goToHome = () => {
      router.push('/question')
    }

    // 跳转登录并带回跳地址
    const goToLogin = () => {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    }

    // 退出登录：公开页面留在原地，受保护页面回到题库
    const handleLogout = async () => {
      const choice = await confirmDialog.ask({
        title: '退出登录',
        message: '确定要退出当前账号吗？',
        confirmText: '确定退出'
      })
      if (choice !== 'confirm') return
      loggingOut.value = true
      try {
        await logoutAction()
      } catch (err) {
        // 服务端会话可能已失效，本地登录态已清除
      } finally {
        loggingOut.value = false
      }
      ElMessage.success('已安全退出')
      profileSynced = false
      if (!PUBLIC_PATHS.includes(route.path)) {
        router.push('/question')
      }
    }

    // 登录后首次进入页面时同步用户资料（昵称、头像）
    onMounted(() => {
      if (isLogin.value && (!profileSynced || !nickName.value)) {
        profileSynced = true
        fetchUserInfoAction().catch(() => {
          profileSynced = false
        })
      }
    })

    return {
      confirmDialog,
      isLogin,
      nickName,
      avatarSrc,
      loggingOut,
      visibleLinks,
      activePath,
      handleAvatarError,
      goToHome,
      goToLogin,
      handleLogout
    }
  }
})
