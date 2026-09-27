// 数据概览业务逻辑（统计口径见 D-016、D-019；进入页面即重新加载，不提供手动刷新）
import { defineComponent, ref, computed, onMounted } from 'vue'
import { QuestionFilled, MagicStick } from '@element-plus/icons-vue'
import { getOverviewApi } from '@/api/overview'
import { DIFFICULTY_OPTIONS } from '@/constants'
import OjEmpty from '@/components/OjEmpty'
import TrendPanel from './components/TrendPanel'
import ExamPanel from './components/ExamPanel'
import HardAnalysisDialog from './components/HardAnalysisDialog'

// 通过率文案（没有已出结论的提交时显示 -）
function formatRate(rate) {
  return rate == null ? '-' : `${rate}%`
}

// 难度标签样式
function difficultyClass(difficulty) {
  return DIFFICULTY_OPTIONS.find((item) => item.value === difficulty)?.tagClass || ''
}

export default defineComponent({
  name: 'Overview',
  components: {
    QuestionFilled,
    MagicStick,
    OjEmpty,
    TrendPanel,
    ExamPanel,
    HardAnalysisDialog,
  },
  setup() {
    // 加载状态（初始为加载中，数据回来前不显示空状态）
    const loading = ref(true)

    // 最近一次加载是否失败
    const loadError = ref(false)

    // 概览数据
    const overview = ref(null)

    // 难题榜
    const hardQuestions = computed(() => overview.value?.hardQuestions || [])

    // 统计卡片（未加载或加载失败时显示 -）
    const statCards = computed(() => {
      const today = overview.value?.today
      const week = overview.value?.week
      return [
        { label: '今日提交', value: today ? today.submitCount : '-', unit: '次' },
        { label: '今日活跃用户', value: today ? today.activeUsers : '-', unit: '人' },
        { label: '近 7 天提交', value: week ? week.submitCount : '-', unit: '次' },
        { label: '近 7 天活跃用户', value: week ? week.activeUsers : '-', unit: '人' },
      ]
    })

    // 加载概览
    const loadOverview = async () => {
      loading.value = true
      loadError.value = false
      try {
        overview.value = await getOverviewApi()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
      } finally {
        loading.value = false
      }
    }

    // 难题分析弹窗
    const analysisRef = ref(null)

    // 打开难题分析
    const openAnalysis = () => {
      analysisRef.value?.open()
    }

    onMounted(loadOverview)

    return {
      loading,
      loadError,
      hardQuestions,
      statCards,
      formatRate,
      difficultyClass,
      analysisRef,
      openAnalysis,
    }
  },
})
