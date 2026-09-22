// 选择竞赛题目业务逻辑
import { defineComponent, ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getQuestionListApi } from '@/api/question'
import { PAGE_SIZE } from '@/constants'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import DifficultyTag from '@/components/DifficultyTag'
import OjDialog from '@/components/OjDialog'
import OjEmpty from '@/components/OjEmpty'
import { Search, Refresh, Check } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ExamQuestionDialog',
  components: {
    OjDialog,
    OjEmpty,
    QuestionDifficultySelect,
    DifficultyTag,
    Search,
    Refresh,
    Check
  },
  emits: ['selected'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 表格数据加载状态
    const loading = ref(false)

    // 表格DOM引用
    const tableRef = ref(null)

    // 题目列表
    const questionList = ref([])

    // 总条数
    const total = ref(0)

    // 选中的题目项列表
    const selectedRows = ref([])

    // 查询过滤参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: PAGE_SIZE,
      difficulty: null,
      title: ''
    })

    // 加载题目库数据
    const loadQuestionList = async () => {
      loading.value = true
      try {
        const res = await getQuestionListApi(queryParams)
        total.value = res.total
        questionList.value = res.rows
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        questionList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 已绑定的题目ID列表
    const boundQuestionIds = ref([])

    // 打开选择题目弹窗
    const open = (existingIds = []) => {
      boundQuestionIds.value = existingIds
      visible.value = true
      queryParams.pageNum = 1
      queryParams.difficulty = null
      queryParams.title = ''
      selectedRows.value = []
      nextTick(() => {
        tableRef.value?.clearSelection()
      })
      loadQuestionList()
    }

    // 判断某行题目是否可选（未绑定的题目才允许勾选）
    const isRowSelectable = (row) => {
      return !boundQuestionIds.value.includes(row.questionId)
    }

    // 判断题目是否已被当前竞赛绑定
    const isBound = (questionId) => {
      return boundQuestionIds.value.includes(questionId)
    }

    // 触发搜索
    const handleSearch = () => {
      queryParams.pageNum = 1
      loadQuestionList()
    }

    // 重置筛选
    const handleReset = () => {
      queryParams.difficulty = null
      queryParams.title = ''
      queryParams.pageNum = 1
      loadQuestionList()
    }

    // 切换当前页
    const handleCurrentChange = (val) => {
      queryParams.pageNum = val
      loadQuestionList()
    }

    // 表格选中行变更监听
    const handleSelectionChange = (selection) => {
      selectedRows.value = selection
    }

    // 提交题目选择
    const handleSubmit = () => {
      if (!selectedRows.value || selectedRows.value.length === 0) {
        ElMessage.warning('请至少选择一道题目')
        return
      }
      emit('selected', selectedRows.value)
      visible.value = false
    }

    return {
      visible,
      loading,
      tableRef,
      questionList,
      total,
      queryParams,
      boundQuestionIds,
      open,
      isRowSelectable,
      isBound,
      handleSearch,
      handleReset,
      handleCurrentChange,
      handleSelectionChange,
      handleSubmit
    }
  }
})
