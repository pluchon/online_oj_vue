// AI 生成用例弹窗：打开即生成（组数由 AI 决定），预览勾选后交给父组件加入用例列表
import { defineComponent, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import OjDialog from '@/components/OjDialog'
import { generateQuestionCasesApi } from '@/api/question'

export default defineComponent({
  name: 'QuestionAiCaseDialog',
  components: {
    OjDialog,
    Loading,
  },
  emits: ['confirm', 'solution'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 生成中与失败状态
    const generating = ref(false)
    const loadError = ref(false)

    // 打开时由父组件提供的题目上下文（可带已生成的解法作为标程）
    let questionContext = null

    // 本次最多可加入的组数
    let remaining = 0

    // 预览用例（带勾选状态）与丢弃组数
    const previewCases = ref([])
    const droppedCount = ref(0)

    // 已勾选的组数
    const selectedCount = computed(() => previewCases.value.filter(item => item.checked).length)

    // 请求生成用例预览
    const handleGenerate = async () => {
      generating.value = true
      loadError.value = false
      previewCases.value = []
      try {
        const result = await generateQuestionCasesApi(questionContext)
        previewCases.value = (result.cases || []).map((item, index) => ({ ...item, checked: index < remaining }))
        droppedCount.value = result.droppedCount || 0
        if (result.standardCode && !questionContext.standardCode) {
          // 记住本次使用的解法，重新生成与解法示例共用同一份
          questionContext.standardCode = result.standardCode
          emit('solution', result.standardCode)
        }
      } catch (err) {
        loadError.value = true
      } finally {
        generating.value = false
      }
    }

    // 打开弹窗并立即生成：context 为当前表单的题目信息，room 为还能加入的用例组数
    const open = (context, room) => {
      questionContext = { ...context }
      remaining = room
      droppedCount.value = 0
      visible.value = true
      handleGenerate()
    }

    // 把勾选的用例交给父组件
    const handleConfirm = () => {
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
      loadError,
      previewCases,
      droppedCount,
      selectedCount,
      open,
      handleGenerate,
      handleConfirm,
    }
  },
})
