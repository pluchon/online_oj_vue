// 竞赛管理业务逻辑实现
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getExamListApi,
  deleteExamApi,
  publishExamApi,
  cancelPublishExamApi
} from '@/api/exam'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { EXAM_STATUS, PAGE_SIZE } from '@/constants'
import Pagination from '@/components/Pagination'
import OjEmpty from '@/components/OjEmpty'
import ExamDrawer from './components/ExamDrawer'

export default defineComponent({
  name: 'ExamManage',
  components: {
    Pagination,
    ExamDrawer,
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

    // 查询与分页过滤参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: PAGE_SIZE,
      title: '',
      startTime: '',
      endTime: ''
    })

    // 抽屉组件引用
    const examDrawerRef = ref(null)

    // 竞赛是否已发布
    const isPublished = (row) => row.status === EXAM_STATUS.PUBLISHED

    // 判断当前时间是否已到达或超过开赛时间（仅用于展示，是否可操作以后端校验为准）
    const isStarted = (startTime) => {
      if (!startTime) {
        return false
      }
      return new Date(startTime).getTime() <= Date.now()
    }

    // 日期选择范围变动联动更新查询参数
    const handleDateChange = (val) => {
      if (val && val.length === 2) {
        queryParams.startTime = val[0]
        queryParams.endTime = val[1]
      } else {
        queryParams.startTime = ''
        queryParams.endTime = ''
      }
    }

    // 加载竞赛列表（页码超出总页数时回退到最后一页重新拉取）
    const loadExamList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const res = await getExamListApi(queryParams)
        total.value = res.total
        const maxPage = Math.ceil(total.value / queryParams.pageSize) || 1
        if (queryParams.pageNum > maxPage) {
          queryParams.pageNum = maxPage
          await loadExamList()
          return
        }
        examList.value = res.rows
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        examList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 触发搜索
    const handleSearch = () => {
      queryParams.pageNum = 1
      loadExamList()
    }

    // 重置搜索条件
    const handleReset = () => {
      dateRange.value = []
      queryParams.title = ''
      queryParams.startTime = ''
      queryParams.endTime = ''
      queryParams.pageNum = 1
      loadExamList()
    }

    // 添加竞赛：打开抽屉进入 add 模式
    const handleAddExam = () => {
      examDrawerRef.value?.open('add')
    }

    // 编辑竞赛：打开抽屉进入 edit 模式
    const handleEditExam = (row) => {
      examDrawerRef.value?.open('edit', row.examId)
    }

    // 抽屉保存或题目绑定成功后的回调处理（成功时回到第一页展示最新添加的竞赛）
    const handleDrawerSuccess = (type) => {
      if (type === 'add') {
        // 新增成功：自动跳转到第一页展示最新添加的竞赛
        queryParams.pageNum = 1
        loadExamList()
      } else {
        // 编辑成功：保持在原来页
        loadExamList()
      }
    }

    // 确认框内执行异步操作：执行期间按钮显示加载态，结束后刷新列表同步最新状态
    const confirmWithLoading = (message, title, options, action) => {
      const confirmText = options.confirmButtonText
      return ElMessageBox.confirm(message, title, {
        cancelButtonText: '取消',
        ...options,
        beforeClose: async (type, instance, done) => {
          if (type !== 'confirm') {
            done()
            return
          }
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '处理中...'
          try {
            await action()
          } catch (err) {
            // 错误提示已由请求拦截器统一给出
          } finally {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = confirmText
            done()
          }
          await loadExamList()
        }
      }).catch(() => {})
    }

    // 删除竞赛
    const handleDeleteExam = (row) => {
      // 已发布的竞赛需先撤销发布才能删除
      if (isPublished(row)) {
        ElMessageBox.alert(
          `竞赛【${row.title}】当前处于【已发布】状态，不能直接删除。请先点击【撤销发布】将其下线后，再执行删除操作。`,
          '禁止删除',
          {
            confirmButtonText: '我知道了',
            type: 'warning'
          }
        )
        return
      }

      confirmWithLoading(`确定要删除竞赛【${row.title}】吗？`, '删除确认', {
        confirmButtonText: '确定删除',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }, async () => {
        await deleteExamApi(row.examId)
        ElMessage.success('竞赛已成功删除')
        // 删除当前页最后一条时回退到上一页
        if (examList.value.length === 1 && queryParams.pageNum > 1) {
          queryParams.pageNum -= 1
        }
      })
    }

    // 切换发布状态
    const handleTogglePublish = (row) => {
      const isPublish = !isPublished(row)
      const actionText = isPublish ? '发布' : '撤销发布'
      const confirmText = isPublish
        ? `确定要发布竞赛【${row.title}】吗？发布后前台学生将公开可见该竞赛。`
        : `确定要撤销发布竞赛【${row.title}】吗？撤销后前台将不再展示该竞赛。`

      confirmWithLoading(confirmText, `${actionText}确认`, {
        confirmButtonText: `确定${actionText}`,
        type: isPublish ? 'info' : 'warning'
      }, async () => {
        if (isPublish) {
          await publishExamApi(row.examId)
          ElMessage.success(`竞赛【${row.title}】已成功发布`)
        } else {
          await cancelPublishExamApi(row.examId)
          ElMessage.success(`竞赛【${row.title}】已撤销发布`)
        }
      })
    }

    onMounted(() => {
      loadExamList()
    })

    return {
      loading,
      loadError,
      examList,
      total,
      dateRange,
      defaultTime,
      queryParams,
      examDrawerRef,
      isStarted,
      isPublished,
      handleDateChange,
      loadExamList,
      handleSearch,
      handleReset,
      handleAddExam,
      handleEditExam,
      handleDrawerSuccess,
      handleDeleteExam,
      handleTogglePublish
    }
  }
})
