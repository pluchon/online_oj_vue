// 消息中心业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  RefreshRight,
  Check,
  Clock,
  Bell,
  Trophy
} from '@element-plus/icons-vue'
import AppNavbar from '@/components/AppNavbar'
import OjDialog from '@/components/OjDialog'
import { MESSAGE_READ_STATUS, MESSAGE_TYPE } from '@/constants'
import {
  getMessageListApi,
  getUnreadCountApi,
  readMessageApi,
  readAllMessagesApi
} from '@/api/message'

export default defineComponent({
  name: 'MessageCenter',
  components: {
    AppNavbar,
    OjDialog,
    Search,
    RefreshRight,
    Check,
    Clock,
    Bell,
    Trophy
  },
  setup() {
    // 消息是否未读
    const isUnread = (item) => item?.isRead === MESSAGE_READ_STATUS.UNREAD

    // 数据加载与状态
    const loading = ref(false)
    const messageList = ref([])
    const total = ref(0)
    const unreadCount = ref(0)

    // 关键词输入框内容与已生效的关键词（点击搜索后才生效）
    const keyword = ref('')
    const appliedKeyword = ref('')

    // 类型筛选下拉选项
    const categoryOptions = [
      { label: '全部通知', value: 'all' },
      { label: '系统通知', value: MESSAGE_TYPE.SYSTEM },
      { label: '竞赛通知', value: MESSAGE_TYPE.EXAM }
    ]
    const currentCategory = ref('all')

    // 是否处于筛选状态（筛选时总数只代表筛选结果）
    const isFiltered = computed(() => currentCategory.value !== 'all' || Boolean(appliedKeyword.value))

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

    // 消息类型对应的文案、样式与图标（以后端 type 为准）
    const TYPE_INFO = {
      [MESSAGE_TYPE.SYSTEM]: { label: '系统通知', typeClass: 'system', iconComponent: Bell },
      [MESSAGE_TYPE.EXAM]: { label: '竞赛通知', typeClass: 'exam', iconComponent: Trophy }
    }
    const getTypeInfo = (item) => TYPE_INFO[item?.type] || TYPE_INFO[MESSAGE_TYPE.SYSTEM]

    // 按照年份聚合编年史时间轴分组（左侧时间线顶部只显示该年度，向下贯穿该年消息）
    const timelineGroups = computed(() => {
      const list = messageList.value
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
          pageSize: pageQuery.pageSize,
          type: currentCategory.value === 'all' ? undefined : currentCategory.value,
          keyword: appliedKeyword.value || undefined
        }
        const res = await getMessageListApi(params)
        messageList.value = res.rows
        total.value = res.total
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        messageList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 获取未读消息总数
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCountApi()
        unreadCount.value = typeof count === 'number' ? count : 0
      } catch (err) {
        unreadCount.value = 0
      }
    }

    // 回到第一页重新查询
    const reloadFromFirstPage = () => {
      pageQuery.pageNum = 1
      fetchMessageList()
    }

    // 切换类型
    const handleCategoryChange = () => {
      reloadFromFirstPage()
    }

    // 按关键词搜索
    const handleSearch = () => {
      appliedKeyword.value = keyword.value.trim()
      reloadFromFirstPage()
    }

    // 清空关键词
    const clearKeyword = () => {
      keyword.value = ''
      handleSearch()
    }

    // 重置全部筛选
    const handleReset = () => {
      keyword.value = ''
      appliedKeyword.value = ''
      currentCategory.value = 'all'
      reloadFromFirstPage()
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
      if (isUnread(item)) {
        try {
          await readMessageApi(item.messageId)
          item.isRead = MESSAGE_READ_STATUS.READ
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
          m.isRead = MESSAGE_READ_STATUS.READ
        })
        unreadCount.value = 0
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      }
    }

    // 路由守卫已保证登录后才能进入本页
    onMounted(() => {
      fetchMessageList()
      fetchUnreadCount()
    })

    return {
      isUnread,
      loading,
      messageList,
      total,
      unreadCount,
      readCount,
      keyword,
      categoryOptions,
      currentCategory,
      isFiltered,
      pageQuery,
      detailVisible,
      currentMessage,
      timelineGroups,
      getYear,
      getMonthDay,
      getTypeInfo,
      handleCategoryChange,
      handleSearch,
      clearKeyword,
      handleReset,
      handlePageChange,
      openMessageDetail,
      handleReadAll
    }
  }
})
