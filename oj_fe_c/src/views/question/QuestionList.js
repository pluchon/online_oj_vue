// C 端题库列表：检索、难度筛选、做题状态与详情预览
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshRight, Timer, Cpu } from '@element-plus/icons-vue'
import { getQuestionListApi, getQuestionDetailApi, getQuestionStatsApi } from '@/api/question'
import { useUserStore } from '@/store/user'
import { DIFFICULTY_OPTIONS, USER_QUESTION_STATUS } from '@/constants'
import { renderMarkdown } from '@/utils/markdown'
import AppNavbar from '@/components/AppNavbar'
import OjDialog from '@/components/OjDialog'

// 每页题目数
const PAGE_SIZE = 10

// 做题状态展示（月相符号、文案、样式）
const STATUS_DISPLAY = {
  [USER_QUESTION_STATUS.SOLVED]: { symbol: '●', text: '已攻克', cls: 'is-solved' },
  [USER_QUESTION_STATUS.IN_PROGRESS]: { symbol: '◐', text: '尝试中', cls: 'is-progress' },
  [USER_QUESTION_STATUS.UNTOUCHED]: { symbol: '○', text: '未尝试', cls: 'is-untouched' }
}

export default defineComponent({
  name: 'QuestionList',
  components: {
    AppNavbar,
    OjDialog,
    Search,
    RefreshRight,
    Timer,
    Cpu
  },
  setup() {
    const router = useRouter()
    const { isLogin } = useUserStore()

    // 列表加载状态与是否加载失败
    const loading = ref(false)
    const loadError = ref(false)

    // 题目列表与总数
    const questionList = ref([])
    const total = ref(0)

    // 当前用户在全题库的已攻克、尝试中题数（登录后加载）
    const stats = reactive({
      solvedCount: 0,
      inProgressCount: 0
    })
    const untouchedCount = computed(() => Math.max(0, total.value - stats.solvedCount - stats.inProgressCount))

    // 题目详情弹窗
    const detailVisible = ref(false)
    const currentQuestion = ref(null)
    const currentContentHtml = computed(() => renderMarkdown(currentQuestion.value?.content))

    // 难度筛选（含"全部"）
    const difficultyOptions = [{ label: '全部', value: null }, ...DIFFICULTY_OPTIONS]

    // 查询条件
    const queryParams = reactive({
      pageNum: 1,
      keyword: '',
      difficulty: null
    })

    // 请求题目列表
    const fetchQuestionList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const res = await getQuestionListApi({
          pageNum: queryParams.pageNum,
          pageSize: PAGE_SIZE,
          keyword: queryParams.keyword.trim() || undefined,
          difficulty: queryParams.difficulty ?? undefined
        })
        questionList.value = res.rows
        total.value = res.total
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        questionList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 加载当前用户做题统计（未登录不请求）
    const fetchStats = async () => {
      if (!isLogin.value) return
      try {
        const data = await getQuestionStatsApi()
        stats.solvedCount = Number(data.solvedCount) || 0
        stats.inProgressCount = Number(data.inProgressCount) || 0
      } catch (err) {
        // 统计失败不影响列表浏览
      }
    }

    // 回到第一页重新查询
    const handleSearch = () => {
      queryParams.pageNum = 1
      fetchQuestionList()
    }

    // 清空搜索词
    const clearKeyword = () => {
      queryParams.keyword = ''
      handleSearch()
    }

    // 重置全部条件
    const handleReset = () => {
      queryParams.keyword = ''
      queryParams.difficulty = null
      handleSearch()
    }

    // 切换难度（再次点击当前难度取消筛选）
    const selectDifficulty = (val) => {
      queryParams.difficulty = queryParams.difficulty === val ? null : val
      handleSearch()
    }

    // 翻页
    const handlePageChange = (page) => {
      queryParams.pageNum = page
      fetchQuestionList()
    }

    // 难度样式与文案
    const findDifficulty = (difficulty) => DIFFICULTY_OPTIONS.find((item) => item.value === Number(difficulty))
    const getDifficultyClass = (difficulty) => findDifficulty(difficulty)?.tagClass || 'diff-default'
    const getDifficultyText = (difficulty) => findDifficulty(difficulty)?.label || '未知'

    // 做题状态展示
    const statusOf = (row) => STATUS_DISPLAY[row.userStatus] || STATUS_DISPLAY[USER_QUESTION_STATUS.UNTOUCHED]
    const getStatusSymbol = (row) => statusOf(row).symbol
    const getStatusText = (row) => statusOf(row).text
    const getStatusClass = (row) => statusOf(row).cls

    // 打开题目详情预览（详情加载失败时用列表数据兜底）
    const openQuestionDetail = async (row) => {
      try {
        currentQuestion.value = await getQuestionDetailApi(row.questionId)
      } catch (err) {
        currentQuestion.value = row
      }
      detailVisible.value = true
    }

    // 前往做题工作台
    const goToQuestionDo = (row) => {
      if (!row?.questionId) return
      detailVisible.value = false
      router.push({ path: '/question/do', query: { questionId: row.questionId } })
    }

    onMounted(() => {
      fetchQuestionList()
      fetchStats()
    })

    return {
      isLogin,
      loading,
      loadError,
      questionList,
      total,
      pageSize: PAGE_SIZE,
      stats,
      untouchedCount,
      detailVisible,
      currentQuestion,
      currentContentHtml,
      difficultyOptions,
      queryParams,
      handleSearch,
      clearKeyword,
      handleReset,
      selectDifficulty,
      handlePageChange,
      getDifficultyClass,
      getDifficultyText,
      getStatusSymbol,
      getStatusText,
      getStatusClass,
      openQuestionDetail,
      goToQuestionDo
    }
  }
})
