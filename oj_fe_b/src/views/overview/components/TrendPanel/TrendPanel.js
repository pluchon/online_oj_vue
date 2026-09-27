// 提交趋势面板：切换近 7 / 14 / 30 天，单独请求，失败时保留上次的图
import { defineComponent, ref, computed, onMounted } from 'vue'
import { getOverviewTrendApi } from '@/api/overview'
import { OVERVIEW_TREND_DAYS_OPTIONS } from '@/constants'
import OjEmpty from '@/components/OjEmpty'
import TrendChart from '../TrendChart'

export default defineComponent({
  name: 'TrendPanel',
  components: {
    OjEmpty,
    TrendChart,
  },
  setup() {
    // 当前时间范围（天）
    const days = ref(OVERVIEW_TREND_DAYS_OPTIONS[0].value)

    // 每日统计
    const trend = ref([])

    // 加载状态（初始为加载中，数据回来前不显示空状态）
    const loading = ref(true)

    // 最近一次加载是否失败
    const loadError = ref(false)

    // 请求序号（快速切换时丢弃过期响应）
    let requestSeq = 0

    // 时间范围内是否有提交
    const hasSubmit = computed(() => trend.value.some((item) => item.submitCount > 0))

    // 当前时间范围的文案
    const currentLabel = computed(() => OVERVIEW_TREND_DAYS_OPTIONS.find((item) => item.value === days.value)?.label || '')

    // 加载趋势
    const loadTrend = async () => {
      const seq = ++requestSeq
      loading.value = true
      loadError.value = false
      try {
        const res = await getOverviewTrendApi(days.value)
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
      DAYS_OPTIONS: OVERVIEW_TREND_DAYS_OPTIONS,
      days,
      trend,
      loading,
      loadError,
      hasSubmit,
      currentLabel,
      loadTrend,
    }
  },
})
