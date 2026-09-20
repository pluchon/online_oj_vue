// 消息中心页面交互业务逻辑
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Check,
  Refresh,
  ChatDotRound,
  User,
  Trophy,
  SwitchButton,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import { useUserStore } from '@/store/user'
import {
  getMessageListApi,
  getUnreadCountApi,
  readMessageApi,
  readAllMessagesApi
} from '@/api/message'

export default {
  name: 'MessageCenter',
  components: {
    Bell,
    Check,
    Refresh,
    ChatDotRound,
    User,
    Trophy,
    SwitchButton,
    UserFilled,
    ArrowDown
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 加载中标识
    const loading = ref(false)

    // 用户登录态与基础信息
    const isLogin = computed(() => !!userStore.token)
    const nickName = computed(() => userStore.nickName || '算法爱好者')
    const headImage = computed(() => userStore.headImage)

    // 消息列表与分页统计
    const messageList = ref([])
    const total = ref(0)
    const unreadCount = ref(0)

    // 分页查询入参
    const pageQuery = reactive({
      pageNum: 1,
      pageSize: 10
    })

    // 拉取消息列表
    const fetchMessageList = async () => {
      loading.value = true
      try {
        const res = await getMessageListApi({
          pageNum: pageQuery.pageNum,
          pageSize: pageQuery.pageSize
        })
        const data = res && res.data ? res.data : res
        if (data && data.rows !== undefined) {
          messageList.value = data.rows || []
          total.value = data.total || 0
        } else if (Array.isArray(data)) {
          messageList.value = data
          total.value = data.length
        } else {
          messageList.value = []
          total.value = 0
        }
      } catch (err) {
        ElMessage.error(err.message || '获取消息列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取未读消息数量
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadCountApi()
        const count = res && res.data !== undefined ? res.data : res
        unreadCount.value = typeof count === 'number' ? count : 0
      } catch (err) {
        unreadCount.value = 0
      }
    }

    // 标为单条已读
    const handleReadSingle = async (item) => {
      if (!item || !item.messageId || item.isRead === 1) {
        return
      }
      try {
        await readMessageApi(item.messageId)
        item.isRead = 1
        if (unreadCount.value > 0) {
          unreadCount.value--
        }
        ElMessage.success('已标为已读')
      } catch (err) {
        ElMessage.error(err.message || '标记已读失败')
      }
    }

    // 卡片点击：若未读则顺手标为已读
    const handleCardClick = (item) => {
      if (item && item.isRead === 0) {
        handleReadSingle(item)
      }
    }

    // 一键全部标为已读（二次确认）
    const handleReadAll = () => {
      if (unreadCount.value === 0) {
        return
      }
      ElMessageBox.confirm(
        '确定要将所有未读消息标记为已读吗？',
        '全部已读提示',
        {
          confirmButtonText: '确定标为已读',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await readAllMessagesApi()
          ElMessage.success('已全部标记为已读')
          unreadCount.value = 0
          // 将当前展示的列表中所有项标为已读
          messageList.value.forEach((m) => {
            m.isRead = 1
          })
        } catch (err) {
          ElMessage.error(err.message || '批量标记已读失败')
        }
      }).catch(() => {})
    }

    // 分页数量变动
    const handleSizeChange = (val) => {
      pageQuery.pageSize = val
      pageQuery.pageNum = 1
      fetchMessageList()
    }

    // 页码切换
    const handleCurrentChange = (val) => {
      pageQuery.pageNum = val
      fetchMessageList()
    }

    // 导航跳转
    const goToHome = () => router.push('/')
    const goToLogin = () => router.push('/login')

    // 下拉菜单操作分发
    const handleUserCommand = async (command) => {
      if (command === 'profile') {
        router.push('/user/profile')
      } else if (command === 'myExam') {
        router.push('/my-exam')
      } else if (command === 'logout') {
        ElMessageBox.confirm('确定要退出当前登录账号吗？', '退出提示', {
          confirmButtonText: '确定退出',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          userStore.resetUserAction()
          ElMessage.success('已安全退出登录')
          router.push('/login')
        }).catch(() => {})
      }
    }

    onMounted(() => {
      fetchMessageList()
      fetchUnreadCount()
    })

    // 判断是否为竞赛相关通知
    const isExamNotification = (item) => {
      if (!item) return false
      const title = item.title || ''
      const content = item.content || ''
      return title.includes('竞赛') || content.includes('竞赛')
    }

    // 前往竞赛大厅与榜单
    const goToContestRank = (item) => {
      if (item && item.isRead === 0) {
        handleReadSingle(item)
      }
      router.push('/exam')
    }

    return {
      loading,
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      messageList,
      total,
      unreadCount,
      pageQuery,
      fetchMessageList,
      handleReadSingle,
      handleCardClick,
      handleReadAll,
      handleSizeChange,
      handleCurrentChange,
      isExamNotification,
      goToContestRank,
      goToHome,
      goToLogin,
      handleUserCommand
    }
  }
}
