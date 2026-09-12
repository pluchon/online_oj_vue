// 首页逻辑
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { removeToken } from '@/utils/auth'
import { getUserDetailApi } from '@/api/user'

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const nickName = ref('')

    onMounted(async () => {
      try {
        const data = await getUserDetailApi()
        if (data && data.nickName) {
          nickName.value = data.nickName
        }
      } catch (e) {
        // 请求异常已由拦截器处理
      }
    })

    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出当前账号吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeToken()
        ElMessage.success('已安全退出登录')
        router.push('/login')
      }).catch(() => {})
    }

    return {
      nickName,
      handleLogout
    }
  }
})
