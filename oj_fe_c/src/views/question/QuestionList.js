// C端题目列表与检索业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getQuestionListApi, getQuestionDetailApi, syncQuestionsApi } from '@/api/question'
import { useUserStore } from '@/store/user'
import Pagination from '@/components/Pagination'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import {
  UserFilled,
  User,
  Trophy,
  SwitchButton,
  ArrowDown,
  Search,
  Refresh
} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'QuestionList',
  components: {
    Pagination,
    UserFilled,
    User,
    Trophy,
    SwitchButton,
    ArrowDown,
    Search,
    Refresh
  },
  setup() {
    const router = useRouter()
    const { token, nickName, headImage, resetUserAction } = useUserStore()

    // 是否已登录状态
    const isLogin = computed(() => Boolean(token.value))

    // 列表查询加载状态
    const loading = ref(false)

    // 手动同步加载状态
    const syncLoading = ref(false)

    // 题目列表数据
    const questionList = ref([])

    // 题目总条数
    const total = ref(0)

    // 题目详情弹窗可见性
    const detailVisible = ref(false)

    // 当前选中的题目详情对象
    const currentQuestion = ref(null)

    // 难度筛选选项清单
    const difficultyOptions = [
      { label: '全部', value: null, className: 'pill-all' },
      { label: '简单', value: 1, className: 'pill-easy' },
      { label: '中等', value: 2, className: 'pill-medium' },
      { label: '困难', value: 3, className: 'pill-hard' }
    ]

    // 查询与分页过滤参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      keyword: '',
      difficulty: null
    })

    // 请求题目列表数据
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
        ElMessage.error(err.message || '获取题目列表失败')
      } finally {
        loading.value = false
      }
    }

    // 执行搜索
    const handleSearch = () => {
      queryParams.pageNum = 1
      fetchQuestionList()
    }

    // 重置检索条件
    const handleReset = () => {
      queryParams.keyword = ''
      queryParams.difficulty = null
      queryParams.pageNum = 1
      fetchQuestionList()
    }

    // 切换难度筛选标签
    const selectDifficulty = (val) => {
      if (queryParams.difficulty === val) {
        queryParams.difficulty = null
      } else {
        queryParams.difficulty = val
      }
      queryParams.pageNum = 1
      fetchQuestionList()
    }

    // 打开题目详情弹窗
    const openQuestionDetail = async (row) => {
      try {
        const res = await getQuestionDetailApi(row.questionId)
        if (res && res.data) {
          currentQuestion.value = res.data
        } else {
          currentQuestion.value = row
        }
        detailVisible.value = true
      } catch (err) {
        currentQuestion.value = row
        detailVisible.value = true
      }
    }

    // 手动同步题目数据至ES
    const handleManualSync = async () => {
      syncLoading.value = true
      try {
        const res = await syncQuestionsApi()
        const count = res && res.data !== undefined ? res.data : (res || 0)
        ElMessage.success(`成功同步 ${count} 道题目至ES索引`)
        fetchQuestionList()
      } catch (err) {
        ElMessage.error(err.message || '同步题目索引失败')
      } finally {
        syncLoading.value = false
      }
    }

    // 获取难度Tag颜色类别
    const getDifficultyTagType = (difficulty) => {
      switch (difficulty) {
        case 1:
          return 'success'
        case 2:
          return 'warning'
        case 3:
          return 'danger'
        default:
          return 'info'
      }
    }

    // 品牌区域点击回到首页
    const goToHome = () => {
      router.push('/question')
    }

    // 跳转登录页
    const goToLogin = () => {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }

    // 用户下拉菜单指令处理
    const handleUserCommand = (command) => {
      if (command === 'myExam') {
        router.push('/my-exam')
      } else if (command === 'logout') {
        resetUserAction()
        ElMessage.success('已安全退出登录')
        router.push('/question')
      }
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
      syncLoading,
      questionList,
      total,
      detailVisible,
      currentQuestion,
      difficultyOptions,
      queryParams,
      fetchQuestionList,
      handleSearch,
      handleReset,
      selectDifficulty,
      openQuestionDetail,
      handleManualSync,
      getDifficultyTagType,
      goToHome,
      goToLogin,
      handleUserCommand
    }
  }
})
