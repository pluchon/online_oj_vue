// 数据概览业务逻辑（统计口径见 D-016）
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { getOverviewApi } from '@/api/overview'
import OjEmpty from '@/components/OjEmpty'
import TrendChart from './components/TrendChart'

// 通过率文案（没有已出结论的提交时显示 -）
function formatRate(rate) {
  return rate == null ? '-' : `${rate}%`
}

// 当前时间（时:分:秒）
function nowTime() {
  return new Date().toTimeString().slice(0, 8)
}

export default defineComponent({
  name: 'Overview',
  components: {
    Refresh,
    OjEmpty,
    TrendChart,
  },
  setup() {
    const router = useRouter()

    // 加载状态
    const loading = ref(false)

    // 最近一次加载是否失败
    const loadError = ref(false)

    // 概览数据
    const overview = ref(null)

    // 最近一次成功加载的时间
    const updatedAt = ref('')

    // 最近竞赛
    const exam = computed(() => overview.value?.latestExam || null)

    // 统计卡片
    const statCards = computed(() => {
      const { today, week } = overview.value
      return [
        { label: '今日提交', value: today.submitCount, sub: `通过 ${today.passCount} · 通过率 ${formatRate(today.passRate)}` },
        { label: '今日活跃用户', value: today.activeUsers, sub: '今天交过代码的人数' },
        { label: '近 7 天提交', value: week.submitCount, sub: `通过 ${week.passCount} · 通过率 ${formatRate(week.passRate)}` },
        { label: '近 7 天活跃用户', value: week.activeUsers, sub: '近 7 天交过代码的人数' },
      ]
    })

    // 参赛率：实际参赛 ÷ 报名
    const participationRate = computed(() => {
      if (!exam.value || !exam.value.enrollCount) return '-'
      return `${Math.round((exam.value.participantCount * 100) / exam.value.enrollCount)}%`
    })

    // 加载概览（失败时保留上次的数据）
    const loadOverview = async () => {
      loading.value = true
      loadError.value = false
      try {
        overview.value = await getOverviewApi()
        updatedAt.value = nowTime()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
      } finally {
        loading.value = false
      }
    }

    // 跳到申诉管理，按这道题的名称筛选
    const viewAppeals = (item) => {
      router.push({ path: '/system/appeal', query: { title: item.title } })
    }

    onMounted(loadOverview)

    return {
      loading,
      loadError,
      overview,
      updatedAt,
      exam,
      statCards,
      participationRate,
      loadOverview,
      viewAppeals,
      formatRate,
    }
  },
})
