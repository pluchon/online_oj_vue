// AI 生成用例弹窗：填写标程后生成预览，勾选的用例交给父组件加入用例列表
import { defineComponent, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import OjDialog from '@/components/OjDialog'
import CodeEditor from '@/components/CodeEditor'
import { generateQuestionCasesApi } from '@/api/question'
import { AI_CASE_MAX_PER_BATCH } from '@/constants'

// 默认生成组数
const DEFAULT_COUNT = 5

export default defineComponent({
  name: 'QuestionAiCaseDialog',
  components: {
    OjDialog,
    CodeEditor,
  },
  props: {
    // 标程（由父组件保存，抽屉内多次打开时保留）
    standardCode: {
      type: String,
      default: '',
    },
  },
  emits: ['update:standardCode', 'confirm'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 生成中状态
    const generating = ref(false)

    // 生成组数与本次可生成的上限
    const count = ref(DEFAULT_COUNT)
    const maxCount = ref(AI_CASE_MAX_PER_BATCH)

    // 打开时由父组件提供的题目上下文
    let questionContext = null

    // 预览用例（带勾选状态）与丢弃组数
    const previewCases = ref([])
    const droppedCount = ref(0)

    // 标程双向绑定
    const standardCodeModel = computed({
      get: () => props.standardCode,
      set: (value) => emit('update:standardCode', value),
    })

    // 已勾选的组数
    const selectedCount = computed(() => previewCases.value.filter(item => item.checked).length)

    // 打开弹窗：context 为当前表单的题目信息，remaining 为还能加入的用例组数
    const open = (context, remaining) => {
      questionContext = context
      maxCount.value = Math.max(1, Math.min(AI_CASE_MAX_PER_BATCH, remaining))
      count.value = Math.min(DEFAULT_COUNT, maxCount.value)
      previewCases.value = []
      droppedCount.value = 0
      visible.value = true
    }

    // 请求生成用例预览
    const handleGenerate = async () => {
      if (!(props.standardCode || '').trim()) {
        ElMessage.warning('请先填写标程')
        return
      }
      generating.value = true
      try {
        const result = await generateQuestionCasesApi({
          ...questionContext,
          standardCode: props.standardCode,
          count: count.value,
        })
        previewCases.value = (result.cases || []).map(item => ({ ...item, checked: true }))
        droppedCount.value = result.droppedCount || 0
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        generating.value = false
      }
    }

    // 主按钮：未生成时发起生成，已有预览时把勾选的用例交给父组件
    const handleConfirm = () => {
      if (!previewCases.value.length) {
        handleGenerate()
        return
      }
      const selected = previewCases.value.filter(item => item.checked)
      if (!selected.length) {
        ElMessage.warning('请至少勾选一组用例')
        return
      }
      emit('confirm', selected.map(({ checked, intent, ...rest }) => rest))
      visible.value = false
    }

    return {
      visible,
      generating,
      count,
      maxCount,
      previewCases,
      droppedCount,
      standardCodeModel,
      selectedCount,
      open,
      handleGenerate,
      handleConfirm,
    }
  },
})
