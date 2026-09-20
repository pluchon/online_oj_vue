// C端竞赛列表业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExamListApi, enrollExamApi } from '@/api/exam'
import { getUnreadCountApi } from '@/api/message'
import { useUserStore } from '@/store/user'
import Pagination from '@/components/Pagination'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import { UserFilled, User, Trophy, SwitchButton, ArrowDown, Bell } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ExamList',
  components: {
    Pagination,
    UserFilled,
    User,
    Trophy,
    SwitchButton,
    ArrowDown,
    Bell
  },
  setup() {
    const router = useRouter()
    const { token, nickName, headImage, resetUserAction } = useUserStore()

    // 是否已登录
    const isLogin = computed(() => Boolean(token.value))

    // 未读消息数量
    const unreadCount = ref(0)

    // 列表加载状态
    const loading = ref(false)

    // 当前选中的 Tab 分类（'0': 未完赛, '1': 历史竞赛）
    const activeTab = ref('0')

    // 竞赛列表数据
    const examList = ref([])

    // 数据总条数
    const total = ref(0)

    // 日期范围双向绑定变量
    const dateRange = ref([])

    // 默认时间点范围（00:00:00 至 23:59:59）
    const defaultTime = [
      new Date(2000, 0, 1, 0, 0, 0),
      new Date(2000, 0, 1, 23, 59, 59)
    ]

    // 查询过滤与分页参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 6,
      type: 0,
      title: '',
      startTime: '',
      endTime: ''
    })

    // 报名加载状态字典
    const enrollLoadingMap = reactive({})

    // 依据时间与报名状态动态判断竞赛展示状态与按钮配置
    const getStatusInfo = (item) => {
      if (!item) {
        return {
          phase: 'upcoming_not_enrolled',
          text: '未开赛',
          badgeClass: 'upcoming',
          btnText: '报名参赛',
          btnType: 'primary',
          plain: false,
          disabled: false,
          action: 'enroll'
        }
      }

      const now = Date.now()
      const start = item.startTime ? new Date(item.startTime).getTime() : 0
      const end = item.endTime ? new Date(item.endTime).getTime() : 0
      const isEnrolled = Boolean(item.isEnter)

      // 1. 已完赛 (now > end)
      if (end > 0 && now > end) {
        return {
          phase: 'ended',
          text: '已完赛',
          badgeClass: 'ended'
        }
      }

      // 2. 进行中 (start <= now <= end)
      if (start > 0 && now >= start && (end === 0 || now <= end)) {
        if (isEnrolled) {
          return {
            phase: 'ongoing_enrolled',
            text: '进行中',
            badgeClass: 'ongoing',
            btnText: '开始答题',
            btnType: 'primary',
            plain: false,
            disabled: false,
            action: 'start'
          }
        } else {
          return {
            phase: 'ongoing_not_enrolled',
            text: '已开赛',
            badgeClass: 'started',
            btnText: '已开赛',
            btnType: 'info',
            plain: true,
            disabled: true,
            action: 'none'
          }
        }
      }

      // 3. 未开赛 (now < start)
      if (isEnrolled) {
        return {
          phase: 'upcoming_enrolled',
          text: '已报名',
          badgeClass: 'enrolled',
          btnText: '已报名',
          btnType: 'success',
          plain: true,
          disabled: true,
          action: 'none'
        }
      } else {
        return {
          phase: 'upcoming_not_enrolled',
          text: '未开赛',
          badgeClass: 'upcoming',
          btnText: '报名参赛',
          btnType: 'primary',
          plain: false,
          disabled: false,
          action: 'enroll'
        }
      }
    }

    /**
     * 加载竞赛列表数据
     */
    const loadExamList = async () => {
      loading.value = true
      try {
        const params = {
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize,
          type: Number(activeTab.value),
          title: queryParams.title ? queryParams.title.trim() : undefined,
          startTime: queryParams.startTime || undefined,
          endTime: queryParams.endTime || undefined
        }

        const res = await getExamListApi(params)
        if (res) {
          examList.value = res.rows || []
          total.value = res.total || 0
        }
      } catch (err) {
        examList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    /**
     * 切换未完赛 / 历史竞赛 Tab
     * @param {string} tabKey - 标签标识 ('0' | '1')
     */
    const handleTabChange = (tabKey) => {
      if (activeTab.value === tabKey) {
        return
      }
      activeTab.value = tabKey
      queryParams.pageNum = 1
      loadExamList()
    }

    /**
     * 日期范围变动联动
     */
    const handleDateChange = (val) => {
      if (val && val.length === 2) {
        queryParams.startTime = val[0]
        queryParams.endTime = val[1]
      } else {
        queryParams.startTime = ''
        queryParams.endTime = ''
      }
      queryParams.pageNum = 1
      loadExamList()
    }

    /**
     * 搜索操作
     */
    const handleSearch = () => {
      queryParams.pageNum = 1
      loadExamList()
    }

    /**
     * 重置筛选条件
     */
    const handleReset = () => {
      dateRange.value = []
      queryParams.startTime = ''
      queryParams.endTime = ''
      queryParams.title = ''
      queryParams.pageNum = 1
      loadExamList()
    }

    // 处理未完赛状态下的主按钮点击
    const handleActionClick = (item) => {
      const statusInfo = getStatusInfo(item)
      if (statusInfo.action === 'enroll') {
        if (!isLogin.value) {
          ElMessage.warning('请先登录后再进行竞赛报名')
          router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
          return
        }

        ElMessageBox.confirm(
          `确定要报名参加竞赛「${item.title}」吗？报名成功后请于开赛前做好准备。`,
          '竞赛报名确认',
          {
            confirmButtonText: '确定报名',
            cancelButtonText: '取消',
            type: 'info'
          }
        ).then(async () => {
          enrollLoadingMap[item.examId] = true
          try {
            await enrollExamApi({ examId: item.examId })
            ElMessage.success(`恭喜您，已成功报名「${item.title}」！`)
            await loadExamList()
          } catch (err) {
            // 业务异常由网络层统一捕获与提示
          } finally {
            enrollLoadingMap[item.examId] = false
          }
        }).catch(() => {})
      } else if (statusInfo.action === 'start') {
        ElMessage.success(`正在进入竞赛「${item.title}」答题考场...`)
      }
    }

    // 处理已完赛状态下的【竞赛练习】点击
    const handlePractice = (item) => {
      ElMessage.info(`「${item.title}」竞赛练习模式正在建设中，敬请期待`)
    }

    // 处理已完赛状态下的【查看排名】点击
    const handleRank = (item) => {
      if (!item || !item.examId) return
      router.push({
        path: '/exam/rank',
        query: { examId: item.examId }
      })
    }

    // 点击导航栏品牌前往竞赛大厅
    const goToHome = () => {
      router.push('/exam')
    }

    // 跳转至消息中心
    const goToMessage = () => {
      router.push('/message')
    }

    // 获取未读消息数
    const fetchUnreadCount = async () => {
      if (!isLogin.value) return
      try {
        const res = await getUnreadCountApi()
        const count = res && res.data !== undefined ? res.data : res
        unreadCount.value = typeof count === 'number' ? count : 0
      } catch (err) {
        unreadCount.value = 0
      }
    }

    // 跳转至登录页
    const handleLogin = () => {
      router.push('/login')
    }

    // 退出登录
    const handleLogout = () => {
      resetUserAction()
      ElMessage.success('已退出登录')
      router.push('/login')
    }

    // 用户头像下拉菜单指令分发
    const handleUserCommand = (command) => {
      if (command === 'logout') {
        handleLogout()
      } else if (command === 'profile') {
        router.push('/user/profile')
      } else if (command === 'myExam') {
        router.push('/my-exam')
      } else if (command === 'message') {
        goToMessage()
      }
    }

    onMounted(() => {
      loadExamList()
      fetchUnreadCount()
    })

    return {
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      unreadCount,
      loading,
      activeTab,
      examList,
      total,
      dateRange,
      defaultTime,
      queryParams,
      enrollLoadingMap,
      getStatusInfo,
      loadExamList,
      fetchUnreadCount,
      handleTabChange,
      handleDateChange,
      handleSearch,
      handleReset,
      handleActionClick,
      handlePractice,
      handleRank,
      goToHome,
      goToMessage,
      handleLogin,
      handleLogout,
      handleUserCommand
    }
  }
})
