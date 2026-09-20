// 系统管理主布局逻辑
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
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
    User,
    ArrowDownBold,
    SwitchButton,
    Document,
    Trophy
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
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
          await logoutApi()
          resetUserInfoAction()
          ElMessage.success('已安全退出登录')
          router.push('/login')
        } catch (err) {
          // 异常已由拦截器处理
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
