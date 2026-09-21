// 消息中心业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Search,
  RefreshRight,
  Check,
  Clock,
  Bell,
  Trophy,
  Cpu,
  ChatDotRound
} from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/images/c_user_avatar.png'
import OjDialog from '@/components/OjDialog'
import { useUserStore } from '@/store/user'
import {
  getMessageListApi,
  getUnreadCountApi,
  readMessageApi,
  readAllMessagesApi
} from '@/api/message'

export default defineComponent({
  name: 'MessageCenter',
  components: {
    OjDialog,
    UserFilled,
    Search,
    RefreshRight,
    Check,
    Clock,
    Bell,
    Trophy,
    Cpu,
    ChatDotRound
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 登录态判定与用户信息
    const isLogin = computed(() => Boolean(userStore.token))
    const nickName = computed(() => userStore.nickName || '学员')
    const headImage = computed(() => userStore.headImage)

    // 用户头像（优先使用用户个性化头像，缺失或失效自动降级学者默认头像）
    const avatarError = ref(false)
    const userAvatar = computed(() => {
      if (avatarError.value) return defaultAvatar
      const raw = userStore.headImage?.value !== undefined ? userStore.headImage.value : userStore.headImage
      if (raw && typeof raw === 'string' && raw.trim() && raw !== 'null' && raw !== 'undefined') {
        return raw
      }
      return defaultAvatar
    })
    const handleAvatarError = () => {
      avatarError.value = true
    }

    // 数据加载与状态
    const loading = ref(false)
    const messageList = ref([])
    const total = ref(0)
    const unreadCount = ref(0)

    // 关键词搜索
    const keyword = ref('')

    // 分类筛选下拉选项
    const categoryOptions = [
      { label: '全部通知', value: 'all' },
      { label: '系统通知', value: 'system' },
      { label: '竞赛相关', value: 'exam' },
      { label: '评测相关', value: 'judge' },
      { label: '站内消息', value: 'station' }
    ]
    const currentCategory = ref('all')

    // 分页参数（一页固定 8 条消息）
    const pageQuery = reactive({
      pageNum: 1,
      pageSize: 8
    })

    // 详情弹窗控制
    const detailVisible = ref(false)
    const currentMessage = ref(null)

    // 已读数统计
    const readCount = computed(() => {
      return Math.max(0, total.value - unreadCount.value)
    })

    // 提取年份，如 '2026'
    const getYear = (timeStr) => {
      if (!timeStr) return '2026'
      try {
        const y = timeStr.split(' ')[0].split('-')[0]
        return y || '2026'
      } catch {
        return '2026'
      }
    }

    // 提取月.日，如 '09.19'
    const getMonthDay = (timeStr) => {
      if (!timeStr) return '--'
      try {
        const parts = timeStr.split(' ')[0].split('-')
        if (parts.length >= 3) {
          return `${parts[1]}.${parts[2]}`
        }
      } catch {
        return '--'
      }
      return '--'
    }

    // 依据消息内容智能推导类型分类、图标与语义颜色
    const getTypeInfo = (item) => {
      if (!item) {
        return { label: '站内消息', typeClass: 'station', iconComponent: ChatDotRound }
      }
      const t = item.type || item.messageType
      if (t === 1 || t === 'system') {
        return { label: '系统通知', typeClass: 'system', iconComponent: Bell }
      }
      if (t === 2 || t === 'exam') {
        return { label: '竞赛相关', typeClass: 'exam', iconComponent: Trophy }
      }
      if (t === 3 || t === 'judge') {
        return { label: '评测相关', typeClass: 'judge', iconComponent: Cpu }
      }
      if (t === 4 || t === 'station') {
        return { label: '站内消息', typeClass: 'station', iconComponent: ChatDotRound }
      }

      // 根据标题与正文关键词兜底语义分类
      const text = `${item.title || ''} ${item.content || ''}`
      if (text.includes('竞赛') || text.includes('比赛') || text.includes('周赛') || text.includes('战报') || text.includes('排名')) {
        return { label: '竞赛相关', typeClass: 'exam', iconComponent: Trophy }
      }
      if (text.includes('评测') || text.includes('判题') || text.includes('提交') || text.includes('通过') || text.includes('代码')) {
        return { label: '评测相关', typeClass: 'judge', iconComponent: Cpu }
      }
      if (text.includes('系统') || text.includes('欢迎') || text.includes('公告') || text.includes('升级') || text.includes('维护')) {
        return { label: '系统通知', typeClass: 'system', iconComponent: Bell }
      }
      return { label: '站内消息', typeClass: 'station', iconComponent: ChatDotRound }
    }

    // 前端多维过滤展现清单（配合后端分页返回的数据进行类别与关键词实时过滤）
    const displayMessageList = computed(() => {
      let list = messageList.value || []
      if (currentCategory.value !== 'all') {
        list = list.filter(item => {
          const info = getTypeInfo(item)
          return info.typeClass === currentCategory.value
        })
      }
      if (keyword.value && keyword.value.trim()) {
        const kw = keyword.value.trim().toLowerCase()
        list = list.filter(item => {
          const t = (item.title || '').toLowerCase()
          const c = (item.content || '').toLowerCase()
          return t.includes(kw) || c.includes(kw)
        })
      }
      return list
    })

    // 按照年份聚合编年史时间轴分组（左侧时间线顶部只显示该年度，向下贯穿该年消息）
    const timelineGroups = computed(() => {
      const list = displayMessageList.value || []
      if (list.length === 0) return []

      const groups = []
      let curYear = null
      let curGroup = null

      list.forEach((item) => {
        const y = getYear(item.createTime)
        if (y !== curYear) {
          curYear = y
          curGroup = {
            year: y,
            items: []
          }
          groups.push(curGroup)
        }
        curGroup.items.push(item)
      })

      return groups
    })

    // 拉取消息列表
    const fetchMessageList = async () => {
      loading.value = true
      try {
        const params = {
          pageNum: pageQuery.pageNum,
          pageSize: pageQuery.pageSize
        }
        const res = await getMessageListApi(params)
        const data = res && res.data !== undefined ? res.data : res
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
        messageList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 获取未读消息总数
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadCountApi()
        const count = res && res.data !== undefined ? res.data : res
        unreadCount.value = typeof count === 'number' ? count : 0
      } catch (err) {
        unreadCount.value = 0
      }
    }

    // 下拉分类切换
    const handleCategoryChange = (val) => {
      currentCategory.value = val
    }

    // 分类切换
    const selectCategory = (val) => {
      currentCategory.value = val
    }

    // 搜索
    const handleSearch = () => {
      // 触发 displayMessageList 过滤
    }

    // 清空关键词
    const clearKeyword = () => {
      keyword.value = ''
    }

    // 重置
    const handleReset = () => {
      keyword.value = ''
      currentCategory.value = 'all'
      pageQuery.pageNum = 1
      fetchMessageList()
    }

    // 翻页
    const handlePageChange = (page) => {
      pageQuery.pageNum = page
      fetchMessageList()
    }

    // 打开详情弹窗并自动置为已读
    const openMessageDetail = async (item) => {
      if (!item) return
      currentMessage.value = item
      detailVisible.value = true
      if (item.isRead === 0 && item.messageId) {
        try {
          await readMessageApi(item.messageId)
          item.isRead = 1
          if (unreadCount.value > 0) {
            unreadCount.value--
          }
        } catch (e) {
          // 静默处理
        }
      }
    }

    // 标记全部已读
    const handleReadAll = async () => {
      if (unreadCount.value === 0 || loading.value) return
      try {
        await ElMessageBox.confirm('确认将全部未读消息标记为已读吗？', '标为已读', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
      } catch {
        return
      }

      try {
        await readAllMessagesApi()
        ElMessage.success('已全部标记为已读')
        messageList.value.forEach(m => {
          m.isRead = 1
        })
        unreadCount.value = 0
      } catch (err) {
        ElMessage.error(err?.message || '标记已读失败，请稍后重试')
      }
    }

    // 品牌首页跳转
    const goToHome = () => {
      router.push('/question')
    }

    // 登录跳转
    const goToLogin = () => {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }

    // 退出登录
    const handleLogout = () => {
      userStore.resetUserAction()
      ElMessage.success('已安全退出')
      router.push('/question')
    }

    onMounted(() => {
      if (isLogin.value) {
        fetchMessageList()
        fetchUnreadCount()
      } else {
        router.push({ path: '/login', query: { redirect: '/message' } })
      }
    })

    return {
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      userAvatar,
      handleAvatarError,
      loading,
      messageList,
      total,
      unreadCount,
      readCount,
      keyword,
      categoryOptions,
      currentCategory,
      pageQuery,
      detailVisible,
      currentMessage,
      displayMessageList,
      timelineGroups,
      getYear,
      getMonthDay,
      getTypeInfo,
      selectCategory,
      handleCategoryChange,
      handleSearch,
      clearKeyword,
      handleReset,
      handlePageChange,
      openMessageDetail,
      handleReadAll,
      goToHome,
      goToLogin,
      handleLogout
    }
  }
})
