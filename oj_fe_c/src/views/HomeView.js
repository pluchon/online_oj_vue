// 首页视图逻辑
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const { nickName, resetUserAction } = useUserStore()

    const handleLogout = () => {
      resetUserAction()
      ElMessage.success('已退出登录')
      router.push('/login')
    }

    return {
      nickName,
      handleLogout
    }
  }
})
