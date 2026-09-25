// 题目管理业务逻辑实现
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, CollectionTag } from '@element-plus/icons-vue'
import { getQuestionListApi, deleteQuestionApi } from '@/api/question'
import { getTagListApi } from '@/api/tag'
import { PAGE_SIZE } from '@/constants'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import QuestionTagSelect from '@/components/QuestionTagSelect'
import DifficultyTag from '@/components/DifficultyTag'
import Pagination from '@/components/Pagination'
import OjEmpty from '@/components/OjEmpty'
import QuestionPreview from '@/components/QuestionPreview'
import QuestionDrawer from './components/QuestionDrawer'
import TagManageDialog from './components/TagManageDialog'

export default defineComponent({
  name: 'QuestionManage',
  components: {
    QuestionDifficultySelect,
    QuestionTagSelect,
    TagManageDialog,
    CollectionTag,
    DifficultyTag,
    Pagination,
    QuestionDrawer,
    QuestionPreview,
    OjEmpty,
    Search,
    Refresh,
    Plus
  },
  setup() {
    // 列表加载状态
    const loading = ref(false)

    // 最近一次加载是否失败（用于区分空数据与加载失败）
    const loadError = ref(false)

    // 题目列表数据
    const questionList = ref([])

    // 数据总条数
    const total = ref(0)

    // 查询与分页过滤参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: PAGE_SIZE,
      difficulty: null,
      tagCategory: null,
      tagId: null,
      title: ''
    })

    // 标签选项（筛选栏与题目抽屉共用）
    const tagOptions = ref([])
    const tagLoading = ref(false)

    // 加载标签选项（失败时保持为空，不影响题目列表）
    const loadTagOptions = async () => {
      tagLoading.value = true
      try {
        const list = await getTagListApi()
        tagOptions.value = Array.isArray(list) ? list : []
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        tagOptions.value = []
      } finally {
        tagLoading.value = false
      }
    }

    // 加载题目列表（页码超出总页数时回退到最后一页重新拉取）
    const loadQuestionList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const res = await getQuestionListApi(queryParams)
        total.value = res.total
        const maxPage = Math.ceil(total.value / queryParams.pageSize) || 1
        if (queryParams.pageNum > maxPage) {
          queryParams.pageNum = maxPage
          await loadQuestionList()
          return
        }
        questionList.value = res.rows
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        questionList.value = []
        total.value = 0
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
      queryParams.tagCategory = null
      queryParams.tagId = null
      queryParams.title = ''
      queryParams.pageNum = 1
      loadQuestionList()
    }

    // 题目抽屉组件实例引用
    const questionDrawerRef = ref(null)

    // 题目详情预览组件引用
    const previewRef = ref(null)

    // 标签管理弹窗引用
    const tagManageRef = ref(null)

    // 打开标签管理
    const openTagManage = () => {
      tagManageRef.value?.open()
    }

    // 标签有变更：刷新标签选项；当前筛选的标签被删掉时清空筛选；再刷新列表（标签名称与删除都会影响列表展示）
    const handleTagsChanged = async () => {
      await loadTagOptions()
      if (queryParams.tagId && !tagOptions.value.some(tag => tag.tagId === queryParams.tagId)) {
        queryParams.tagId = null
        queryParams.pageNum = 1
      }
      loadQuestionList()
    }

    // 查看题目详情
    const openPreview = (questionId) => {
      previewRef.value?.open(questionId)
    }

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
      ElMessageBox.confirm(`确定要删除题目【${row.title}】吗？删除后用户端将不再展示该题目。`, '删除确认', {
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
              // 错误提示已由请求拦截器统一给出
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
      loadTagOptions()
      loadQuestionList()
    })

    return {
      loading,
      loadError,
      questionList,
      total,
      queryParams,
      tagOptions,
      tagLoading,
      questionDrawerRef,
      previewRef,
      tagManageRef,
      openPreview,
      openTagManage,
      handleTagsChanged,
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
