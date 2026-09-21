// C端题目列表与检索业务交互逻辑
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getQuestionListApi, getQuestionDetailApi } from '@/api/question'
import { useUserStore } from '@/store/user'
import OjDialog from '@/components/OjDialog'
import defaultAvatar from '@/assets/images/c_user_avatar.png'
import {
  UserFilled,
  Search,
  RefreshRight,
  Timer,
  Cpu
} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'QuestionList',
  components: {
    OjDialog,
    UserFilled,
    Search,
    RefreshRight,
    Timer,
    Cpu
  },
  setup() {
    const router = useRouter()
    const { token, nickName, headImage, resetUserAction } = useUserStore()

    // 登录态判定
    const isLogin = computed(() => Boolean(token.value))

    // 数据加载状态
    const loading = ref(false)

    // 题目清单与总数
    const questionList = ref([])
    const total = ref(0)

    // 题目状态统计（攻克、尝试中、未尝试）
    const solvedCount = computed(() => {
      return questionList.value.filter(q => q.userStatus === 1 || q.passStatus === 1).length
    })
    const progressCount = computed(() => {
      return questionList.value.filter(q => q.userStatus === 2 || q.passStatus === 2).length
    })
    const untouchedCount = computed(() => {
      return questionList.value.filter(q => !q.userStatus && !q.passStatus).length
    })

    // 题目详情弹窗
    const detailVisible = ref(false)
    const currentQuestion = ref(null)

    // 难度筛选选项清单
    const difficultyOptions = [
      { label: '全部', value: null },
      { label: '简单', value: 1 },
      { label: '中等', value: 2 },
      { label: '困难', value: 3 }
    ]

    // 查询过滤与分页（固定一页 10 道题目）
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      keyword: '',
      difficulty: null
    })

    // 请求题目列表
    const fetchQuestionList = async () => {
      loading.value = true
      try {
        const params = {
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize,
          keyword: queryParams.keyword ? queryParams.keyword.trim() : undefined,
          difficulty: queryParams.difficulty !== null ? queryParams.difficulty : undefined
        }
        const res = await getQuestionListApi(params)
        if (res && res.rows) {
          questionList.value = res.rows
          total.value = res.total || 0
        } else if (Array.isArray(res)) {
          questionList.value = res
          total.value = res.length
        } else {
          questionList.value = []
          total.value = 0
        }
      } catch (err) {
        ElMessage.error(err?.message || '获取题目列表失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索
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
      queryParams.pageNum = 1
      fetchQuestionList()
    }

    // 切换难度
    const selectDifficulty = (val) => {
      queryParams.difficulty = queryParams.difficulty === val ? null : val
      queryParams.pageNum = 1
      fetchQuestionList()
    }

    // 分页切页（一页固定 10 题）
    const handlePageChange = (page) => {
      queryParams.pageNum = page
      fetchQuestionList()
    }

    // 难度矿物色样式类
    const getDifficultyClass = (difficulty) => {
      switch (Number(difficulty)) {
        case 1:
          return 'diff-easy'
        case 2:
          return 'diff-medium'
        case 3:
          return 'diff-hard'
        default:
          return 'diff-default'
      }
    }

    // 难度文案映射
    const getDifficultyText = (difficulty) => {
      switch (Number(difficulty)) {
        case 1:
          return '简单'
        case 2:
          return '中等'
        case 3:
          return '困难'
        default:
          return '常规'
      }
    }

    // 月相状态符号
    const getStatusSymbol = (row) => {
      if (row.userStatus === 1 || row.passStatus === 1) return '●'
      if (row.userStatus === 2 || row.passStatus === 2) return '◐'
      return '○'
    }

    // 月相状态文案
    const getStatusText = (row) => {
      if (row.userStatus === 1 || row.passStatus === 1) return '已攻克'
      if (row.userStatus === 2 || row.passStatus === 2) return '尝试中'
      return '未尝试'
    }

    // 月相样式类名
    const getStatusClass = (row) => {
      if (row.userStatus === 1 || row.passStatus === 1) return 'is-solved'
      if (row.userStatus === 2 || row.passStatus === 2) return 'is-progress'
      return 'is-untouched'
    }

    // 打开题目详情公共弹窗
    const openQuestionDetail = async (row) => {
      if (!row || !row.questionId) return
      try {
        const res = await getQuestionDetailApi(row.questionId)
        currentQuestion.value = (res && res.data ? res.data : res) || row
      } catch (err) {
        currentQuestion.value = row
      } finally {
        detailVisible.value = true
      }
    }

    // 前往做题工作台
    const goToQuestionDo = (row) => {
      if (!row || !row.questionId) return
      detailVisible.value = false
      router.push({
        path: '/question/do',
        query: { questionId: row.questionId }
      })
    }

    // 导航跳转
    const goToHome = () => router.push('/question')
    const goToLogin = () => router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })

    // 直接退出登录
    const handleLogout = () => {
      resetUserAction()
      ElMessage.success('已安全退出')
      router.push('/question')
    }

    onMounted(() => {
      fetchQuestionList()
    })

    return {
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      loading,
      questionList,
      total,
      solvedCount,
      progressCount,
      untouchedCount,
      detailVisible,
      currentQuestion,
      difficultyOptions,
      queryParams,
      fetchQuestionList,
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
      goToQuestionDo,
      goToHome,
      goToLogin,
      handleLogout
    }
  }
})
