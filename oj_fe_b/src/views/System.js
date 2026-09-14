// 系统管理主布局逻辑
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Management,
  ArrowDownBold,
  SwitchButton,
  Document,
  Trophy
} from '@element-plus/icons-vue'
import { logoutApi } from '@/api/user'
import { useUserStore } from '@/store/user'

export default defineComponent({
  name: 'System',
  components: {
    Management,
    ArrowDownBold,
    SwitchButton,
    Document,
    Trophy
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    // 管理员信息已在全局路由守卫前置校验并加载至 Store
    const { nickName, resetUserInfoAction } = useUserStore()

    // 动态计算当前激活菜单项
    const activeMenu = computed(() => {
      if (route.path.startsWith('/system/question')) {
        return '/system/question'
      }
      if (route.path.startsWith('/system/exam')) {
        return '/system/exam'
      }
      return route.path
    })

    // 退出登录
    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出当前管理账号吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 调用后端退出登录接口销毁 Redis 中存储的 Token 会话
          await logoutApi()
          // 后端会话销毁成功后，通过 Action 同步清理 Store 状态与本地 Cookie
          resetUserInfoAction()
          ElMessage.success('已安全退出登录')
          // 跳转回登录页
          router.push('/login')
        } catch (err) {
          // 退出接口异常时拦截器已全局弹窗报错，前端保持在当前页面不清除会话
        }
      }).catch(() => {})
    }

    return {
      SwitchButton,
      nickName,
      activeMenu,
      handleLogout
    }
  }
})
