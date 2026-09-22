// 题目详情预览：与 C 端做题页的题面展示一致（标题、难度与限制、描述、示例、提示）
import { defineComponent, ref, computed } from 'vue'
import { Timer, Coin } from '@element-plus/icons-vue'
import OjDialog from '@/components/OjDialog'
import OjEmpty from '@/components/OjEmpty'
import DifficultyTag from '@/components/DifficultyTag'
import { getQuestionDetailApi } from '@/api/question'
import { renderMarkdown } from '@/utils/markdown'
import { extractDescription, extractExamples, extractHints, isLongExample } from '@/utils/questionContent'

// 公开示例的标记值（与后端 isSample 一致）
const SAMPLE_FLAG = 1

export default defineComponent({
  name: 'QuestionPreview',
  components: {
    OjDialog,
    OjEmpty,
    DifficultyTag,
    Timer,
    Coin,
  },
  setup() {
    // 弹窗可见性
    const visible = ref(false)

    // 加载状态
    const loading = ref(false)

    // 加载是否失败
    const loadFailed = ref(false)

    // 当前题目ID
    const questionId = ref(null)

    // 题目详情
    const question = ref(null)

    // 公开示例用例（隐藏用例不展示，与 C 端一致）
    const sampleCases = computed(() => (question.value?.cases || [])
      .filter((item) => item.isSample === SAMPLE_FLAG)
      .map((item) => ({ input: item.displayInput, output: item.displayOutput })))

    // 描述正文
    const descriptionHtml = computed(() => renderMarkdown(extractDescription(question.value?.content)))

    // 示例
    const examples = computed(() => extractExamples(question.value?.content, sampleCases.value))

    // 提示
    const hints = computed(() => extractHints(question.value?.content))

    // 加载题目详情
    const loadDetail = async () => {
      loading.value = true
      loadFailed.value = false
      try {
        question.value = await getQuestionDetailApi(questionId.value)
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadFailed.value = true
      } finally {
        loading.value = false
      }
    }

    // 打开并加载指定题目
    const open = (id) => {
      if (!id) return
      questionId.value = id
      question.value = null
      visible.value = true
      loadDetail()
    }

    return {
      visible,
      loading,
      loadFailed,
      question,
      descriptionHtml,
      examples,
      hints,
      isLongExample,
      loadDetail,
      open,
    }
  },
})
