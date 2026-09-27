// 难题分析弹窗：打开时读上一次的结果，从未分析过就直接开始分析；「重新分析」覆盖结果，分析中弹窗边框流光
import { defineComponent, ref } from 'vue'
import { WarningFilled, Aim, Histogram } from '@element-plus/icons-vue'
import OjDialog from '@/components/OjDialog'
import OjEmpty from '@/components/OjEmpty'
import TagPassPie from '../TagPassPie'
import { getHardAnalysisApi, analyzeHardQuestionsApi } from '@/api/overview'
import { DIFFICULTY_OPTIONS } from '@/constants'

// 判题结论分布的配色（按占比从高到低依次取用）
const VERDICT_COLORS = ['#a8382b', '#b37424', '#8b6e3c', '#6b5f52', '#a39584', '#c9bba8']

// 难度标签样式
function difficultyClass(difficulty) {
  return DIFFICULTY_OPTIONS.find((item) => item.value === difficulty)?.tagClass || ''
}

// 百分比文案（没有数据时显示 -）
function formatRate(rate) {
  return rate == null ? '-' : `${rate}%`
}

// 判题结论配色
function verdictColor(index) {
  return VERDICT_COLORS[index % VERDICT_COLORS.length]
}

// 判题结论标签：文字用结论色，底色取同色的浅色
function verdictChipStyle(index) {
  const color = verdictColor(index)
  return { color, backgroundColor: `${color}1f` }
}

// 生成时间只显示到分钟（yyyy-MM-dd HH:mm:ss → MM-dd HH:mm）
function formatTime(time) {
  return time ? time.slice(5, 16) : '-'
}

export default defineComponent({
  name: 'HardAnalysisDialog',
  components: {
    OjDialog,
    OjEmpty,
    TagPassPie,
    WarningFilled,
    Aim,
    Histogram,
  },
  setup() {
    // 弹窗可见性
    const visible = ref(false)

    // 读取上一次结果中
    const loading = ref(false)

    // 读取上一次结果是否失败
    const loadError = ref(false)

    // 分析中（关掉弹窗也继续，结果回来后再打开可见）
    const analyzing = ref(false)

    // 当前显示的分析结果（为空表示还没有可显示的结果）
    const result = ref(null)

    // 重新分析：成功后替换结果，失败时保留原结果
    const analyze = async () => {
      if (analyzing.value) return
      analyzing.value = true
      try {
        result.value = await analyzeHardQuestionsApi()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        analyzing.value = false
      }
    }

    // 读取上一次的结果，从未分析过就直接开始分析
    const loadLatest = async () => {
      loading.value = true
      loadError.value = false
      try {
        // 从未分析过时 data 为空，请求封装会把它换成 true，只把对象当作结果
        const latest = await getHardAnalysisApi()
        if (latest && typeof latest === 'object') {
          result.value = latest
        }
      } catch (err) {
        loadError.value = true
      } finally {
        loading.value = false
      }
      if (!loadError.value && !result.value) {
        analyze()
      }
    }

    // 打开弹窗（分析进行中时只打开，不重复请求）
    const open = () => {
      visible.value = true
      if (!analyzing.value) {
        loadLatest()
      }
    }

    return {
      visible,
      loading,
      loadError,
      analyzing,
      result,
      open,
      analyze,
      difficultyClass,
      formatRate,
      verdictColor,
      verdictChipStyle,
      formatTime,
    }
  },
})
