// 题目管理业务逻辑实现
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getQuestionListApi, deleteQuestionApi } from '@/api/question'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import DifficultyTag from '@/components/DifficultyTag'
import Pagination from '@/components/Pagination'
import QuestionDrawer from './components/QuestionDrawer'

export default defineComponent({
  name: 'QuestionManage',
  components: {
    QuestionDifficultySelect,
    DifficultyTag,
    Pagination,
    QuestionDrawer
  },
  setup() {
    // 列表加载状态
    const loading = ref(false)

    // 题目列表数据
    const questionList = ref([])

    // 数据总条数
    const total = ref(0)

    // 查询与分页过滤参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      difficulty: null,
      title: ''
    })

    // 加载题目列表（支持分页器对象同步与超页自适应兜底）
    const loadQuestionList = async (pagination) => {
      if (pagination) {
        if (typeof pagination.page === 'number') {
          queryParams.pageNum = pagination.page
        }
        if (typeof pagination.limit === 'number') {
          queryParams.pageSize = pagination.limit
        }
      }
      loading.value = true
      try {
        const res = await getQuestionListApi(queryParams)
        if (res) {
          total.value = res.total || 0
          // 计算当前总数下的最大合法页码
          const maxPage = Math.ceil(total.value / queryParams.pageSize) || 1
          // 若当前页码超出了最大有效页数，自动重置为最大有效页并重新拉取，避免展示空页
          if (queryParams.pageNum > maxPage) {
            queryParams.pageNum = maxPage
            await loadQuestionList()
            return
          }
          questionList.value = res.rows || []
        }
      } catch (err) {
        ElMessage.error(err?.message || '获取题目列表失败')
      } finally {
        loading.value = false
      }
    }

    // 触发搜索
    const handleSearch = () => {
      queryParams.pageNum = 1
      loadQuestionList()
    }

    // 重置搜索条件
    const handleReset = () => {
      queryParams.difficulty = null
      queryParams.title = ''
      queryParams.pageNum = 1
      loadQuestionList()
    }

    // 题目抽屉组件实例引用
    const questionDrawerRef = ref(null)

    // 新增题目（打开抽屉并进入 add 模式）
    const handleAddQuestion = () => {
      questionDrawerRef.value?.open('add')
    }

    // 编辑题目（打开抽屉并加载当前题目详情）
    const handleEditQuestion = (row) => {
      questionDrawerRef.value?.open('edit', row.questionId)
    }

    // 抽屉保存成功后的回调处理（区分新增与编辑）
    const handleDrawerSuccess = (type) => {
      if (type === 'add') {
        // 添加题目成功后：自动跳转到第一页展示最新添加的题目
        queryParams.pageNum = 1
        loadQuestionList()
      } else {
        // 编辑题目后：不需要跳转，保持在当前页查看刚刚编辑的题目
        loadQuestionList()
      }
    }

    // 删除题目（具备二次确认危险操作防护、提交期间禁用按钮、防空页自适应调整）
    const handleDeleteQuestion = (row) => {
      ElMessageBox.confirm(`确定要彻底删除题目【${row.title}】吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            try {
              await deleteQuestionApi(row.questionId)
              ElMessage.success('题目已成功删除')
              // 防空页页码调整：若当前页只有 1 条数据且非第 1 页，则自动回退到上一页
              if (questionList.value.length === 1 && queryParams.pageNum > 1) {
                queryParams.pageNum -= 1
              }
              await loadQuestionList()
              done()
            } catch (err) {
              ElMessage.error(err?.message || '删除题目失败')
            } finally {
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '确定删除'
            }
          } else {
            done()
          }
        }
      }).catch(() => {})
    }

    onMounted(() => {
      loadQuestionList()
    })

    return {
      Search,
      Refresh,
      Plus,
      loading,
      questionList,
      total,
      queryParams,
      questionDrawerRef,
      loadQuestionList,
      handleSearch,
      handleReset,
      handleAddQuestion,
      handleEditQuestion,
      handleDrawerSuccess,
      handleDeleteQuestion
    }
  }
})
