// 提交趋势面板：切换时间范围单独请求，失败时保留上次的图；没有提交的点画在 0 上，不显示空状态
import { defineComponent, ref, onMounted } from 'vue'
import { getOverviewTrendApi } from '@/api/overview'
import { OVERVIEW_TREND_RANGE_OPTIONS } from '@/constants'
import OjEmpty from '@/components/OjEmpty'
import TrendChart from '../TrendChart'

export default defineComponent({
  name: 'TrendPanel',
  components: {
    OjEmpty,
    TrendChart,
  },
  setup() {
    // 当前时间范围
    const range = ref(OVERVIEW_TREND_RANGE_OPTIONS[0].value)

    // 趋势中的各个点
    const trend = ref([])

    // 加载状态（初始为加载中）
    const loading = ref(true)

    // 最近一次加载是否失败
    const loadError = ref(false)

    // 请求序号（快速切换时丢弃过期响应）
    let requestSeq = 0

    // 加载趋势
    const loadTrend = async () => {
      const seq = ++requestSeq
      loading.value = true
      loadError.value = false
      try {
        const res = await getOverviewTrendApi(range.value)
        if (seq === requestSeq) trend.value = res || []
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        if (seq === requestSeq) loadError.value = true
      } finally {
        if (seq === requestSeq) loading.value = false
      }
    }

    onMounted(loadTrend)

    return {
      RANGE_OPTIONS: OVERVIEW_TREND_RANGE_OPTIONS,
      range,
      trend,
      loading,
      loadError,
      loadTrend,
    }
  },
})
