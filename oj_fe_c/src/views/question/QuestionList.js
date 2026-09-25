// C 端题库列表：检索、难度筛选、做题状态与详情预览
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshRight, Timer, Cpu } from '@element-plus/icons-vue'
import { getQuestionListApi, getQuestionDetailApi, getQuestionStatsApi, getQuestionTagsApi } from '@/api/question'
import { useUserStore } from '@/store/user'
import { DIFFICULTY_OPTIONS, USER_QUESTION_STATUS, TAG_CATEGORY_OPTIONS } from '@/constants'
import { renderMarkdown } from '@/utils/markdown'
import AppNavbar from '@/components/AppNavbar'
import OjDialog from '@/components/OjDialog'

// 每页题目数
const PAGE_SIZE = 10

// 分类、标签下拉中"全部"选项的内部取值
const ALL = 'ALL'

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

    // 当前用户在全题库的已攻克、尝试中题数（登录后加载；按全题库计算，不随筛选变化）
    const stats = reactive({
      totalCount: 0,
      solvedCount: 0,
      inProgressCount: 0
    })
    const untouchedCount = computed(() => Math.max(0, stats.totalCount - stats.solvedCount - stats.inProgressCount))

    // 题目详情弹窗
    const detailVisible = ref(false)
    const currentQuestion = ref(null)
    const currentContentHtml = computed(() => renderMarkdown(currentQuestion.value?.content))

    // 难度筛选（含"全部"）
    const difficultyOptions = [{ label: '全部', value: null }, ...DIFFICULTY_OPTIONS]

    // 做题状态筛选（含"全部"，登录后可用）
    const statusOptions = [
      { label: '全部', value: null },
      { label: '已攻克', value: USER_QUESTION_STATUS.SOLVED },
      { label: '尝试中', value: USER_QUESTION_STATUS.IN_PROGRESS },
      { label: '未尝试', value: USER_QUESTION_STATUS.UNTOUCHED }
    ]

    // 标签选项（按分类分组，空分类不展示）
    const tagOptions = ref([])
    const tagLoading = ref(false)
    const tagGroups = computed(() => TAG_CATEGORY_OPTIONS
      .map(category => ({
        value: category.value,
        label: category.label,
        tags: tagOptions.value.filter(tag => tag.category === category.value)
      }))
      .filter(group => group.tags.length > 0))

    // 查询条件
    const queryParams = reactive({
      pageNum: 1,
      keyword: '',
      difficulty: null,
      tagCategory: null,
      tagId: null,
      userStatus: null
    })

    // 分类与标签下拉的内部取值（"全部"对外统一为 null）
    const tagCategoryValue = computed({
      get: () => queryParams.tagCategory ?? ALL,
      set: (val) => {
        queryParams.tagCategory = val === ALL ? null : val
      }
    })
    const tagValue = computed({
      get: () => queryParams.tagId ?? ALL,
      set: (val) => {
        queryParams.tagId = val === ALL ? null : val
      }
    })

    // 当前分类下的标签
    const visibleTags = computed(() => tagOptions.value.filter(tag => tag.category === queryParams.tagCategory))

    // 切换分类：已选标签不属于新分类时清空，再重新查询
    const handleCategoryChange = () => {
      const current = tagOptions.value.find(tag => tag.tagId === queryParams.tagId)
      if (queryParams.tagCategory !== null && current?.category !== queryParams.tagCategory) {
        queryParams.tagId = null
      }
      handleSearch()
    }

    // 请求题目列表
    const fetchQuestionList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const res = await getQuestionListApi({
          pageNum: queryParams.pageNum,
          pageSize: PAGE_SIZE,
          keyword: queryParams.keyword.trim() || undefined,
          difficulty: queryParams.difficulty ?? undefined,
          tagCategory: queryParams.tagCategory ?? undefined,
          tagId: queryParams.tagId || undefined,
          userStatus: isLogin.value ? (queryParams.userStatus ?? undefined) : undefined
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
        stats.totalCount = Number(data.totalCount) || 0
        stats.solvedCount = Number(data.solvedCount) || 0
        stats.inProgressCount = Number(data.inProgressCount) || 0
      } catch (err) {
        // 统计失败不影响列表浏览
      }
    }

    // 加载标签选项（失败时筛选框为空，不影响列表浏览）
    const fetchTags = async () => {
      tagLoading.value = true
      try {
        const list = await getQuestionTagsApi()
        tagOptions.value = Array.isArray(list) ? list : []
      } catch (err) {
        tagOptions.value = []
      } finally {
        tagLoading.value = false
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
      queryParams.tagCategory = null
      queryParams.tagId = null
      queryParams.userStatus = null
      handleSearch()
    }

    // 切换做题状态（再次点击当前状态取消筛选）
    const selectStatus = (val) => {
      queryParams.userStatus = queryParams.userStatus === val ? null : val
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
      fetchTags()
      fetchQuestionList()
      fetchStats()
    })

    // 当前结果是否为语义推荐（关键词无匹配时后端补充）
    const isSemanticResult = computed(() => questionList.value.length > 0 && questionList.value.every(item => item.semantic))

    return {
      isSemanticResult,
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
      statusOptions,
      ALL,
      categoryOptions: TAG_CATEGORY_OPTIONS,
      tagGroups,
      visibleTags,
      tagCategoryValue,
      tagValue,
      tagLoading,
      handleCategoryChange,
      queryParams,
      handleSearch,
      clearKeyword,
      handleReset,
      selectDifficulty,
      selectStatus,
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
