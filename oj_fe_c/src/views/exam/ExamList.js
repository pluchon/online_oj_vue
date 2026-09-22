// C 端竞赛列表（竞赛中心与我的竞赛共用，mine 为 true 时只展示本人已报名的竞赛）
import { defineComponent, ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight, Clock, User, Document } from '@element-plus/icons-vue'
import { getExamListApi, getMyExamListApi, enrollExamApi } from '@/api/exam'
import { useUserStore } from '@/store/user'
import { EXAM_CONTEST_STATUS, EXAM_LIST_TYPE } from '@/constants'
import AppNavbar from '@/components/AppNavbar'
import OjDialog from '@/components/OjDialog'
import ExamRankDialog from './components/ExamRankDialog'

// 每页竞赛数（一行 4 场，两行）
const PAGE_SIZE = 8

// 完赛情况筛选
const CATEGORY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '未完赛', value: EXAM_LIST_TYPE.UNFINISHED },
  { label: '历史竞赛', value: EXAM_LIST_TYPE.HISTORY }
]

// 时间范围快捷筛选
const TIME_FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '本日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '近半年', value: 'half_year' }
]

// 一天的毫秒数
const DAY_MS = 24 * 3600 * 1000

// 格式化为后端约定的 yyyy-MM-dd HH:mm:ss
const formatDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

// 计算时间筛选对应的起止时间
const resolveTimeRange = (value) => {
  const now = new Date()
  if (value === 'today') {
    return [
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    ]
  }
  if (value === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
    return [start, new Date(start.getTime() + 7 * DAY_MS - 1000)]
  }
  if (value === 'month') {
    return [
      new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
      new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    ]
  }
  if (value === 'half_year') {
    const start = new Date(now.getTime() - 180 * DAY_MS)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now.getTime() + 180 * DAY_MS)
    end.setHours(23, 59, 59, 0)
    return [start, end]
  }
  return null
}

export default defineComponent({
  name: 'ExamList',
  components: {
    AppNavbar,
    OjDialog,
    ExamRankDialog,
    Search,
    RefreshRight,
    Clock,
    User,
    Document
  },
  props: {
    // 是否为"我的竞赛"
    mine: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const { isLogin } = useUserStore()

    // 列表加载状态与是否加载失败
    const loading = ref(false)
    const loadError = ref(false)

    // 竞赛列表与总数
    const examList = ref([])
    const total = ref(0)

    // 筛选条件
    const currentCategory = ref('all')
    const currentTimeFilter = ref('all')
    const queryParams = reactive({
      pageNum: 1,
      title: ''
    })

    // 报名中的竞赛
    const enrollLoadingMap = reactive({})

    // 时间筛选滑块定位
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
    const updateSliderIndicator = () => {
      const index = TIME_FILTER_OPTIONS.findIndex((o) => o.value === currentTimeFilter.value)
      const el = tabRefs.value[index]
      if (el) {
        sliderIndicatorStyle.transform = `translateX(${el.offsetLeft}px)`
        sliderIndicatorStyle.width = `${el.offsetWidth}px`
        sliderIndicatorStyle.opacity = 1
      }
    }

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
    const openConfirm = ({ title, content, confirmText = '确定', action }) => {
      Object.assign(confirmDialog, { title, content, confirmText, action, visible: true })
    }
    const handleConfirmDialog = () => {
      const action = confirmDialog.action
      confirmDialog.visible = false
      if (action) action()
    }

    // 跳转登录并带回跳地址
    const goToLogin = () => {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    }

    // 未登录时引导登录
    const promptLogin = (content) => {
      openConfirm({ title: '需要登录', content, confirmText: '去登录', action: goToLogin })
    }

    // 竞赛卡片展示状态与按钮（以后端 contestStatus 为准）
    const getStatusInfo = (item) => {
      if (item.contestStatus === EXAM_CONTEST_STATUS.FINISHED) {
        return { phase: 'ended', text: '已完赛', badgeClass: 'ended' }
      }
      if (item.contestStatus === EXAM_CONTEST_STATUS.ONGOING) {
        return item.isEnter
          ? { phase: 'ongoing', text: '进行中', badgeClass: 'ongoing', btnText: '开始答题', disabled: false, action: 'start' }
          : { phase: 'ongoing', text: '已开赛', badgeClass: 'started', btnText: '未报名', disabled: true, action: 'none' }
      }
      return item.isEnter
        ? { phase: 'upcoming', text: '已报名', badgeClass: 'enrolled', btnText: '已报名', disabled: true, action: 'none' }
        : { phase: 'upcoming', text: '未开赛', badgeClass: 'upcoming', btnText: '报名参赛', disabled: false, action: 'enroll' }
    }

    // 本页各状态场次
    const countByPhase = (phase) => examList.value.filter((item) => getStatusInfo(item).phase === phase).length
    const ongoingCount = computed(() => countByPhase('ongoing'))
    const upcomingCount = computed(() => countByPhase('upcoming'))
    const endedCount = computed(() => countByPhase('ended'))

    // 加载竞赛列表
    const loadExamList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const range = resolveTimeRange(currentTimeFilter.value)
        const params = {
          pageNum: queryParams.pageNum,
          pageSize: PAGE_SIZE,
          type: currentCategory.value === 'all' ? undefined : currentCategory.value,
          title: queryParams.title.trim() || undefined,
          startTime: range ? formatDateTime(range[0]) : undefined,
          endTime: range ? formatDateTime(range[1]) : undefined
        }
        const res = await (props.mine ? getMyExamListApi(params) : getExamListApi(params))
        examList.value = res.rows
        total.value = res.total
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        examList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 回到第一页重新查询
    const reloadFromFirstPage = () => {
      queryParams.pageNum = 1
      loadExamList()
    }

    // 切换完赛情况
    const handleCategoryChange = () => {
      reloadFromFirstPage()
    }

    // 切换时间范围
    const selectTimeFilter = (value) => {
      currentTimeFilter.value = value
      nextTick(updateSliderIndicator)
      reloadFromFirstPage()
    }

    // 搜索
    const handleSearch = () => {
      reloadFromFirstPage()
    }

    // 清除关键词
    const clearKeyword = () => {
      queryParams.title = ''
      reloadFromFirstPage()
    }

    // 重置全部筛选
    const handleReset = () => {
      currentCategory.value = 'all'
      currentTimeFilter.value = 'all'
      queryParams.title = ''
      nextTick(updateSliderIndicator)
      reloadFromFirstPage()
    }

    // 翻页
    const handlePageChange = (page) => {
      queryParams.pageNum = page
      loadExamList()
    }

    // 竞赛未绑定题目时不进入做题页
    const hasQuestions = (item) => {
      if (Number(item.questionCount) > 0) return true
      ElMessage.warning('该竞赛暂无题目')
      return false
    }

    // 报名：确认后提交
    const handleEnroll = (item) => {
      openConfirm({
        title: '报名竞赛',
        content: `确认报名「${item.title}」？`,
        confirmText: '报名',
        action: async () => {
          enrollLoadingMap[item.examId] = true
          try {
            await enrollExamApi(item.examId)
            ElMessage.success('报名成功')
            await loadExamList()
          } catch (err) {
            // 错误提示已由请求拦截器统一给出
          } finally {
            enrollLoadingMap[item.examId] = false
          }
        }
      })
    }

    // 进入竞赛答题（进行中计入排名）
    const goToExamRoom = (item) => {
      if (!hasQuestions(item)) return
      router.push({ path: '/question/do', query: { examId: item.examId } })
    }

    // 卡片主按钮
    const handleActionClick = (item) => {
      const { action } = getStatusInfo(item)
      if (action === 'none') return
      if (!isLogin.value) {
        promptLogin(action === 'enroll' ? '登录后才能报名竞赛。' : '登录后才能进入竞赛。')
        return
      }
      if (action === 'enroll') {
        handleEnroll(item)
      } else {
        goToExamRoom(item)
      }
    }

    // 赛后练习（不计入排名）
    const handlePractice = (item) => {
      if (!hasQuestions(item)) return
      router.push({ path: '/question/do', query: { examId: item.examId, mode: 'practice' } })
    }

    // 查看排名
    const handleRank = (item) => {
      Object.assign(rankDialog, { examId: item.examId, title: item.title, visible: true })
    }

    // 竞赛中心与我的竞赛之间切换时复用组件，需重置筛选并重新加载
    watch(() => props.mine, handleReset)

    onMounted(() => {
      loadExamList()
      nextTick(updateSliderIndicator)
      window.addEventListener('resize', updateSliderIndicator)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateSliderIndicator)
    })

    return {
      loading,
      loadError,
      examList,
      total,
      pageSize: PAGE_SIZE,
      contestCategoryOptions: CATEGORY_OPTIONS,
      timeFilterOptions: TIME_FILTER_OPTIONS,
      currentCategory,
      currentTimeFilter,
      queryParams,
      enrollLoadingMap,
      sliderIndicatorStyle,
      setTabRef,
      rankDialog,
      confirmDialog,
      handleConfirmDialog,
      ongoingCount,
      upcomingCount,
      endedCount,
      getStatusInfo,
      handleCategoryChange,
      selectTimeFilter,
      handleSearch,
      clearKeyword,
      handleReset,
      handlePageChange,
      handleActionClick,
      handlePractice,
      handleRank
    }
  }
})
