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
      pageSize: 10,
      title: '',
      startTime: '',
      endTime: ''
    })

    // 抽屉组件引用
    const examDrawerRef = ref(null)

    // 判断当前时间是否已到达或超过开赛时间（动态前端计算，无需后端持久化字段）
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

    // 加载竞赛列表（支持分页参数同步与超页自适应兜底）
    const loadExamList = async (pagination) => {
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
        const res = await getExamListApi(queryParams)
        if (res) {
          total.value = res.total || 0
          // 计算当前总数下的最大合法页码
          const maxPage = Math.ceil(total.value / queryParams.pageSize) || 1
          // 若当前页码超出了最大有效页数，自动重置为最大有效页并重新拉取，避免展示空页
          if (queryParams.pageNum > maxPage) {
            queryParams.pageNum = maxPage
            await loadExamList()
            return
          }
          examList.value = res.rows || []
        }
      } catch (err) {
        ElMessage.error(err?.message || '获取竞赛列表失败')
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

    // 删除竞赛
    // 执行删除竞赛请求
    const executeDeleteExam = async (row) => {
      try {
        await deleteExamApi(row.examId)
        ElMessage.success('竞赛已成功删除')
        // 防空页页码调整：若当前页只有 1 条数据且非第 1 页，则自动回退到上一页
        if (examList.value.length === 1 && queryParams.pageNum > 1) {
          queryParams.pageNum -= 1
        }
        await loadExamList()
      } catch (err) {
        ElMessage.error(err?.message || '删除竞赛失败')
        // 若因开赛状态变化或并发删除导致失败，重新拉取列表以同步最新状态
        await loadExamList()
      }
    }

    // 删除竞赛
    const handleDeleteExam = (row) => {
      // 方案A业务约束：处于【已发布】状态的竞赛严禁直接删除，必须先撤销发布下线
      if (row.status === 1) {
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

      ElMessageBox.confirm(`确定要删除竞赛【${row.title}】吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        executeDeleteExam(row)
      }).catch(() => {})
    }

    // 切换发布状态
    const handleTogglePublish = (row) => {
      const isPublish = row.status !== 1
      const actionText = isPublish ? '发布' : '撤销发布'
      const confirmText = isPublish
        ? `确定要发布竞赛【${row.title}】吗？发布后前台学生将公开可见该竞赛。`
        : `确定要撤销发布竞赛【${row.title}】吗？撤销后前台将不再展示该竞赛。`

      ElMessageBox.confirm(confirmText, `${actionText}确认`, {
        confirmButtonText: `确定${actionText}`,
        cancelButtonText: '取消',
        type: isPublish ? 'info' : 'warning'
      }).then(async () => {
        try {
          if (isPublish) {
            await publishExamApi(row.examId)
            ElMessage.success(`竞赛【${row.title}】已成功发布`)
          } else {
            await cancelPublishExamApi(row.examId)
            ElMessage.success(`竞赛【${row.title}】已撤销发布`)
          }
          await loadExamList()
        } catch (err) {
          ElMessage.error(err?.message || `${actionText}竞赛失败`)
          await loadExamList()
        }
      }).catch(() => {})
    }

    onMounted(() => {
      loadExamList()
    })

    return {
      Search,
      Refresh,
      Plus,
      loading,
      examList,
      total,
      dateRange,
      defaultTime,
      queryParams,
      examDrawerRef,
      isStarted,
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
