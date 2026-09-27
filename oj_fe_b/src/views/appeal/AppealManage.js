// 申诉管理业务逻辑（学员经 AI 初审放行后提交的申诉，管理员逐条裁定；规则见 D-017）
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getAppealListApi } from '@/api/appeal'
import { APPEAL_DAYS_OPTIONS, PAGE_SIZE } from '@/constants'
import { appealStatusOf, judgeStatusOf, isAppealFinal } from '@/utils/appealDisplay'
import Pagination from '@/components/Pagination'
import OjEmpty from '@/components/OjEmpty'
import AppealDetailDialog from './components/AppealDetailDialog'

export default defineComponent({
  name: 'AppealManage',
  components: {
    Search,
    Refresh,
    Pagination,
    OjEmpty,
    AppealDetailDialog,
  },
  setup() {
    const route = useRoute()

    // 表格加载状态（初始为加载中，首屏数据回来前不显示空状态）
    const loading = ref(true)

    // 最近一次加载是否失败（区分空数据与加载失败）
    const loadError = ref(false)

    // 申诉列表
    const appealList = ref([])

    // 数据总条数
    const total = ref(0)

    // 详情弹窗引用
    const detailDialogRef = ref(null)

    // 查询条件
    const queryParams = reactive({
      userId: '',
      title: '',
      days: '',
      pageNum: 1,
      pageSize: PAGE_SIZE,
    })

    // 把界面筛选条件转换为接口参数
    const buildParams = () => {
      const params = { pageNum: queryParams.pageNum, pageSize: queryParams.pageSize }
      if (queryParams.userId.trim()) {
        params.userId = queryParams.userId.trim()
      }
      if (queryParams.title.trim()) {
        params.title = queryParams.title.trim()
      }
      if (queryParams.days) {
        params.days = queryParams.days
      }
      return params
    }

    // 加载申诉分页列表
    const loadAppealList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const res = await getAppealListApi(buildParams())
        appealList.value = res.rows
        total.value = res.total
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        appealList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 搜索（用户ID 须为纯数字）
    const handleSearch = () => {
      if (queryParams.userId.trim() && !/^\d+$/.test(queryParams.userId.trim())) {
        ElMessage.warning('用户ID必须为纯数字')
        return
      }
      queryParams.pageNum = 1
      loadAppealList()
    }

    // 重置筛选条件
    const handleReset = () => {
      queryParams.userId = ''
      queryParams.title = ''
      queryParams.days = ''
      queryParams.pageNum = 1
      loadAppealList()
    }

    // 打开申诉详情
    const openDetail = (row) => {
      detailDialogRef.value?.open(row.appealId)
    }

    onMounted(() => {
      // 从数据概览的难题榜跳来时，按带过来的题目名称预先筛选
      if (route.query.title) {
        queryParams.title = String(route.query.title)
      }
      loadAppealList()
    })

    return {
      APPEAL_DAYS_OPTIONS,
      loading,
      loadError,
      appealList,
      total,
      queryParams,
      detailDialogRef,
      loadAppealList,
      handleSearch,
      handleReset,
      openDetail,
      appealStatusOf,
      judgeStatusOf,
      isAppealFinal,
    }
  },
})
