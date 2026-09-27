// 赛后复盘弹窗：打开时读已存的复盘，还没有（或提交结果变了）就直接生成；可手动重新生成（每场 3 次），生成中弹窗边框流光
import { defineComponent, ref, computed } from 'vue'
import { Loading, Tickets, RefreshRight } from '@element-plus/icons-vue'
import OjDialog from '@/components/OjDialog'
import { getExamReviewApi, generateExamReviewApi, regenerateExamReviewApi } from '@/api/exam'
import { DIFFICULTY_OPTIONS } from '@/constants'

// 难度标签样式
function difficultyClass(difficulty) {
  return DIFFICULTY_OPTIONS.find((item) => item.value === difficulty)?.tagClass || ''
}

// 本题结果的序号配色：绿色已通过、红色未通过、黄色未提交
function statusOf(item) {
  if (item.passed) return 'is-pass'
  return item.submitCount > 0 ? 'is-fail' : 'is-unsubmitted'
}

// 本题结果文字（序号上的悬停提示）
function statusLabel(item) {
  if (item.passed) return '已通过'
  return item.submitCount > 0 ? '未通过' : '未提交'
}

// 百分比文案（没人提交时显示 -）
function formatRate(rate) {
  return rate == null ? '-' : `${rate}%`
}

// 生成时间只显示到分钟（yyyy-MM-dd HH:mm:ss → MM-dd HH:mm）
function formatTime(time) {
  return time ? time.slice(5, 16) : '-'
}

export default defineComponent({
  name: 'ExamReviewDialog',
  components: {
    OjDialog,
    Loading,
    Tickets,
    RefreshRight,
  },
  setup() {
    // 弹窗可见性
    const visible = ref(false)

    // 当前竞赛ID
    const examId = ref(null)

    // 读取已存复盘中
    const loading = ref(false)

    // 生成中
    const generating = ref(false)

    // 最近一次生成是否失败（区分加载失败与生成失败的提示）
    const failed = ref(false)

    // 复盘内容
    const review = ref(null)

    // 竞赛名称（弹窗标题用，打开时就有，不等复盘加载）
    const examTitle = ref('')

    // 重新生成确认框
    const confirmVisible = ref(false)

    // 未通过与未提交的题数
    const counts = computed(() => {
      const questions = review.value?.questions || []
      return {
        failed: questions.filter((item) => !item.passed && item.submitCount > 0).length,
        unsubmitted: questions.filter((item) => !item.submitCount).length,
      }
    })

    // 生成复盘
    const generate = async () => {
      const id = examId.value
      generating.value = true
      failed.value = false
      try {
        const result = await generateExamReviewApi(id)
        if (id === examId.value) {
          review.value = result
        }
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        failed.value = true
      } finally {
        generating.value = false
      }
    }

    // 重新生成：成功后替换，失败时保留原复盘
    const regenerate = async () => {
      if (generating.value) return
      const id = examId.value
      generating.value = true
      try {
        const result = await regenerateExamReviewApi(id)
        if (id === examId.value) {
          review.value = result
        }
      } catch (err) {
        // 错误提示（含次数用完）已由请求拦截器统一给出
      } finally {
        generating.value = false
      }
    }

    // 确认后关闭确认框再重新生成（通用弹窗不会在确认时自动关闭）
    const handleRegenerateConfirm = () => {
      confirmVisible.value = false
      regenerate()
    }

    // 读取已存的复盘，没有就生成（data 为空时请求封装会返回 true，只把对象当作结果）
    const reload = async () => {
      const id = examId.value
      loading.value = true
      failed.value = false
      let latest = null
      try {
        latest = await getExamReviewApi(id)
      } catch (err) {
        loading.value = false
        return
      }
      loading.value = false
      if (id !== examId.value) return
      if (latest && typeof latest === 'object') {
        review.value = latest
      } else {
        generate()
      }
    }

    // 打开指定竞赛的复盘（正在生成时只打开，不重复请求）
    const open = (exam) => {
      visible.value = true
      if (generating.value && exam.examId === examId.value) return
      if (exam.examId !== examId.value) {
        review.value = null
      }
      examId.value = exam.examId
      examTitle.value = exam.title
      reload()
    }

    return {
      visible,
      loading,
      generating,
      failed,
      review,
      examTitle,
      confirmVisible,
      counts,
      open,
      reload,
      handleRegenerateConfirm,
      difficultyClass,
      statusOf,
      statusLabel,
      formatRate,
      formatTime,
    }
  },
})
