// 最近竞赛面板：按时间段汇总报名与参赛人数，竞赛列表后端分页（口径见 D-019）
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import { getOverviewExamApi } from '@/api/overview'
import { OVERVIEW_EXAM_DAYS_OPTIONS, OVERVIEW_EXAM_PAGE_SIZE } from '@/constants'
import OjEmpty from '@/components/OjEmpty'
import Pagination from '@/components/Pagination'

// 列表里的开赛时间只显示到分钟（月-日 时:分），完整起止时间放在悬停提示里
function shortTime(time) {
  return time ? time.slice(5, 16) : '-'
}

export default defineComponent({
  name: 'ExamPanel',
  components: {
    MagicStick,
    OjEmpty,
    Pagination,
  },
  setup() {
    // 查询条件
    const query = reactive({
      days: OVERVIEW_EXAM_DAYS_OPTIONS[2].value,
      pageNum: 1,
      pageSize: OVERVIEW_EXAM_PAGE_SIZE,
    })

    // 汇总与当前页数据
    const summary = ref(null)

    // 加载状态（初始为加载中，数据回来前不显示空状态）
    const loading = ref(true)

    // 最近一次加载是否失败
    const loadError = ref(false)

    // 请求序号（快速切换时丢弃过期响应）
    let requestSeq = 0

    // 当前页竞赛
    const rows = computed(() => summary.value?.rows || [])

    // 竞赛总数
    const total = computed(() => Number(summary.value?.total || 0))

    // 当前时间段的文案
    const currentLabel = computed(() => OVERVIEW_EXAM_DAYS_OPTIONS.find((item) => item.value === query.days)?.label || '')

    // 三项汇总（加载失败时显示 -）
    const summaryItems = computed(() => {
      const data = summary.value
      const rate = data?.participationRate
      return [
        { label: '报名人数', value: data ? data.enrollCount : '-', unit: '人' },
        { label: '参赛人数', value: data ? data.participantCount : '-', unit: '人' },
        { label: '参赛率', value: rate == null ? '-' : rate, unit: rate == null ? '' : '%' },
      ]
    })

    // 加载汇总与当前页
    const loadExams = async () => {
      const seq = ++requestSeq
      loading.value = true
      loadError.value = false
      try {
        const res = await getOverviewExamApi({ ...query })
        if (seq === requestSeq) summary.value = res
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        if (seq === requestSeq) {
          loadError.value = true
          summary.value = null
        }
      } finally {
        if (seq === requestSeq) loading.value = false
      }
    }

    // 切换时间段回到第一页
    const handleDaysChange = () => {
      query.pageNum = 1
      loadExams()
    }

    onMounted(loadExams)

    return {
      DAYS_OPTIONS: OVERVIEW_EXAM_DAYS_OPTIONS,
      query,
      loading,
      loadError,
      rows,
      total,
      currentLabel,
      summaryItems,
      loadExams,
      handleDaysChange,
      shortTime,
    }
  },
})
