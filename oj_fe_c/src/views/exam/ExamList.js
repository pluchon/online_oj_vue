// C端竞赛列表业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getExamListApi, enrollExamApi } from '@/api/exam'
import { useUserStore } from '@/store/user'
import defaultAvatar from '@/assets/images/c_user_avatar.png'
import OjDialog from '@/components/OjDialog'
import ExamRankDialog from './components/ExamRankDialog'
import {
  UserFilled,
  Search,
  RefreshRight,
  Clock,
  User,
  Document
} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ExamList',
  components: {
    OjDialog,
    ExamRankDialog,
    UserFilled,
    Search,
    RefreshRight,
    Clock,
    User,
    Document
  },
  setup() {
    const router = useRouter()
    const { token, nickName, headImage, resetUserAction } = useUserStore()

    // 是否已登录
    const isLogin = computed(() => Boolean(token.value))

    // 列表加载状态
    const loading = ref(false)

    // 完赛情况筛选分类（全部、未完赛、历史竞赛）
    const contestCategoryOptions = [
      { label: '全部', value: 'all' },
      { label: '未完赛', value: '0' },
      { label: '历史竞赛', value: '1' }
    ]
    const currentCategory = ref('all')

    // 竞赛列表数据
    const examList = ref([])

    // 数据总条数
    const total = ref(0)

    // 用户友好时间筛选选项（左右滑块平滑切换）
    const timeFilterOptions = [
      { label: '全部', value: 'all' },
      { label: '本日', value: 'today' },
      { label: '本周', value: 'week' },
      { label: '本月', value: 'month' },
      { label: '近半年', value: 'half_year' }
    ]
    const currentTimeFilter = ref('all')

    // 滑块动画定位参数与元素引用
    const sliderContainerRef = ref(null)
    const tabRefs = ref([])
    const setTabRef = (el, index) => {
      if (el) {
        tabRefs.value[index] = el
      }
    }
    const sliderIndicatorStyle = reactive({
      transform: 'translateX(0px)',
      width: '0px',
      opacity: 0
    })

    // 动态更新滑块定位样式
    const updateSliderIndicator = () => {
      const activeIndex = timeFilterOptions.findIndex(o => o.value === currentTimeFilter.value)
      if (activeIndex !== -1 && tabRefs.value[activeIndex]) {
        const el = tabRefs.value[activeIndex]
        sliderIndicatorStyle.transform = `translateX(${el.offsetLeft}px)`
        sliderIndicatorStyle.width = `${el.offsetWidth}px`
        sliderIndicatorStyle.opacity = 1
      }
    }

    // 查询过滤与分页参数（固定一页 8 场竞赛）
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 8,
      title: '',
      startTime: '',
      endTime: ''
    })

    // 报名加载状态字典
    const enrollLoadingMap = reactive({})

    // 竞赛排名弹窗
    const rankDialog = reactive({
      visible: false,
      examId: null,
      title: ''
    })

    // 通用确认弹窗
    const confirmDialog = reactive({
      visible: false,
      title: '',
      content: '',
      confirmText: '确定',
      action: null
    })

    // 打开确认弹窗
    const openConfirm = ({ title, content, confirmText = '确定', action }) => {
      confirmDialog.title = title
      confirmDialog.content = content
      confirmDialog.confirmText = confirmText
      confirmDialog.action = action
      confirmDialog.visible = true
    }

    // 确认弹窗主操作
    const handleConfirmDialog = () => {
      const action = confirmDialog.action
      confirmDialog.visible = false
      if (action) action()
    }

    // 未登录时引导登录
    const promptLogin = (content) => {
      openConfirm({
        title: '需要登录',
        content,
        confirmText: '去登录',
        action: () => handleLogin()
      })
    }

    // 日期格式化工具
    const formatDate = (date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      const s = String(date.getSeconds()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${mm}:${s}`
    }

    // 依据时间与报名状态动态判断竞赛展示状态与按钮配置
    const getStatusInfo = (item) => {
      if (!item) {
        return {
          phase: 'upcoming_not_enrolled',
          text: '未开赛',
          badgeClass: 'upcoming',
          btnText: '报名参赛',
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
            disabled: false,
            action: 'start'
          }
        } else {
          return {
            phase: 'ongoing_not_enrolled',
            text: '已开赛',
            badgeClass: 'started',
            btnText: '未报名',
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
          disabled: true,
          action: 'none'
        }
      } else {
        return {
          phase: 'upcoming_not_enrolled',
          text: '未开赛',
          badgeClass: 'upcoming',
          btnText: '报名参赛',
          disabled: false,
          action: 'enroll'
        }
      }
    }

    // 底部全量统计（进行中、未开赛、已完赛）
    const ongoingCount = computed(() => {
      return examList.value.filter(item => getStatusInfo(item).phase.startsWith('ongoing')).length
    })
    const upcomingCount = computed(() => {
      return examList.value.filter(item => getStatusInfo(item).phase.startsWith('upcoming')).length
    })
    const endedCount = computed(() => {
      return examList.value.filter(item => getStatusInfo(item).phase === 'ended').length
    })

    // 加载竞赛列表数据
    const loadExamList = async (page) => {
      if (typeof page === 'number') {
        queryParams.pageNum = page
      }
      loading.value = true
      try {
        const params = {
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize,
          type: currentCategory.value !== 'all' ? Number(currentCategory.value) : undefined,
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

    // 完赛情况下拉筛选切换（全部 / 未完赛 / 历史竞赛）
    const handleCategoryChange = (catVal) => {
      currentCategory.value = catVal
      queryParams.pageNum = 1
      loadExamList()
    }

    // 快捷时间范围选择（左右平滑滑块动画切换）
    const selectTimeFilter = (val, index) => {
      currentTimeFilter.value = val
      const now = new Date()
      if (val === 'all') {
        queryParams.startTime = ''
        queryParams.endTime = ''
      } else if (val === 'today') {
        // 本日
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        queryParams.startTime = formatDate(startOfToday)
        queryParams.endTime = formatDate(endOfToday)
      } else if (val === 'week') {
        // 本周
        const startOfWeek = new Date(now)
        const day = startOfWeek.getDay() || 7
        startOfWeek.setDate(startOfWeek.getDate() - day + 1)
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 3600 * 1000 - 1)
        queryParams.startTime = formatDate(startOfWeek)
        queryParams.endTime = formatDate(endOfWeek)
      } else if (val === 'month') {
        // 本月
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        queryParams.startTime = formatDate(startOfMonth)
        queryParams.endTime = formatDate(endOfMonth)
      } else if (val === 'half_year') {
        // 近半年
        const halfYearAgo = new Date(now.getTime() - 180 * 24 * 3600 * 1000)
        halfYearAgo.setHours(0, 0, 0, 0)
        const halfYearFuture = new Date(now.getTime() + 180 * 24 * 3600 * 1000)
        halfYearFuture.setHours(23, 59, 59, 999)
        queryParams.startTime = formatDate(halfYearAgo)
        queryParams.endTime = formatDate(halfYearFuture)
      }
      queryParams.pageNum = 1
      nextTick(() => {
        updateSliderIndicator()
      })
      loadExamList()
    }

    // 搜索操作
    const handleSearch = () => {
      queryParams.pageNum = 1
      loadExamList()
    }

    // 清除关键词
    const clearKeyword = () => {
      queryParams.title = ''
      handleSearch()
    }

    // 重置筛选条件
    const handleReset = () => {
      currentCategory.value = 'all'
      currentTimeFilter.value = 'all'
      queryParams.startTime = ''
      queryParams.endTime = ''
      queryParams.title = ''
      queryParams.pageNum = 1
      nextTick(() => {
        updateSliderIndicator()
      })
      loadExamList()
    }

    // 处理未完赛状态下的主按钮点击
    const handleActionClick = (item) => {
      const statusInfo = getStatusInfo(item)
      if (statusInfo.action === 'enroll') {
        if (!isLogin.value) {
          promptLogin('登录后才能报名竞赛。')
          return
        }
        handleEnroll(item)
      } else if (statusInfo.action === 'start') {
        goToExamRoom(item)
      }
    }

    // 报名竞赛操作（先确认再提交）
    const handleEnroll = (item) => {
      if (!item || !item.examId) {
        return
      }
      openConfirm({
        title: '报名竞赛',
        content: `确认报名「${item.title}」？`,
        confirmText: '报名',
        action: () => doEnroll(item)
      })
    }

    // 提交报名
    const doEnroll = async (item) => {
      enrollLoadingMap[item.examId] = true
      try {
        await enrollExamApi({ examId: item.examId })
        ElMessage.success('报名成功')
        await loadExamList()
      } catch (err) {
        // 错误提示已由请求拦截器统一处理
      } finally {
        enrollLoadingMap[item.examId] = false
      }
    }

    // 竞赛未绑定题目时不进入做题页
    const hasQuestions = (item) => {
      if (Number(item.questionCount) > 0) return true
      ElMessage.warning('该竞赛暂无题目')
      return false
    }

    // 进入竞赛做题（进行中计入排名）
    const goToExamRoom = (item) => {
      if (!hasQuestions(item)) return
      if (!isLogin.value) {
        promptLogin('登录后才能进入竞赛。')
        return
      }
      router.push({
        path: '/question/do',
        query: { examId: item.examId }
      })
    }

    // 竞赛练习（赛后练习，不计入排名）
    const handlePractice = (item) => {
      if (!hasQuestions(item)) return
      router.push({
        path: '/question/do',
        query: { examId: item.examId, mode: 'practice' }
      })
    }

    // 查看排名
    const handleRank = (item) => {
      rankDialog.examId = item.examId
      rankDialog.title = item.title
      rankDialog.visible = true
    }

    // 导航品牌跳转
    const goToHome = () => {
      router.push('/exam')
    }

    // 跳转登录
    const handleLogin = () => {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }

    // 退出登录
    const handleLogout = () => {
      resetUserAction()
      ElMessage.success('已安全退出')
      router.push('/exam')
    }

    onMounted(() => {
      loadExamList()
      nextTick(() => {
        updateSliderIndicator()
      })
      window.addEventListener('resize', updateSliderIndicator)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateSliderIndicator)
    })

    return {
      rankDialog,
      confirmDialog,
      handleConfirmDialog,
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      loading,
      contestCategoryOptions,
      currentCategory,
      handleCategoryChange,
      examList,
      total,
      timeFilterOptions,
      currentTimeFilter,
      sliderContainerRef,
      sliderIndicatorStyle,
      setTabRef,
      queryParams,
      enrollLoadingMap,
      ongoingCount,
      upcomingCount,
      endedCount,
      getStatusInfo,
      loadExamList,
      selectTimeFilter,
      handleSearch,
      clearKeyword,
      handleReset,
      handleActionClick,
      handlePractice,
      handleRank,
      goToHome,
      handleLogin,
      handleLogout
    }
  }
})
