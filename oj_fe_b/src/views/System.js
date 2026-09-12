// 系统管理主布局逻辑
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Management,
  ArrowDownBold,
  SwitchButton,
  Document,
  Trophy
} from '@element-plus/icons-vue'
import { getUserDetailApi, logoutApi } from '@/api/user'
import { removeToken } from '@/utils/auth'

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
    // 管理员昵称，直接从后端接口动态获取
    const nickName = ref('')

    // 页面挂载后获取当前管理员详情信息
    onMounted(async () => {
      try {
        const data = await getUserDetailApi()
        if (data && data.nickName) {
          nickName.value = data.nickName
        }
      } catch (err) {
        // 请求异常已由拦截器处理
      }
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
          // 后端会话销毁成功后，清理前端 Cookie 中存储的 Token
          removeToken()
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
      handleLogout
    }
  }
})
