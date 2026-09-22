// AI 帮建竞赛弹窗：填好描述并选好难度倾向与题目数量后才调用模型，成功后关闭并交给父组件回填
import { defineComponent, ref, computed } from 'vue'
import OjDialog from '@/components/OjDialog'
import { generateExamPlanApi } from '@/api/exam'
import { EXAM_AI_TENDENCY_OPTIONS, EXAM_AI_COUNT_OPTIONS } from '@/constants'

export default defineComponent({
  name: 'ExamAiPlanDialog',
  components: {
    OjDialog,
  },
  emits: ['generated'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 竞赛描述
    const description = ref('')

    // 难度倾向
    const tendency = ref(null)

    // 题目数量档位
    const countLevel = ref(null)

    // 生成中状态
    const generating = ref(false)

    // 描述与两个选项都填好后才允许生成
    const ready = computed(() => Boolean(description.value.trim()) && tendency.value !== null && countLevel.value !== null)

    // 打开弹窗（保留上次填写的内容，便于微调后重新生成）
    const open = () => {
      visible.value = true
    }

    // 请求生成，成功后关闭弹窗并交给父组件回填
    const handleGenerate = async () => {
      if (!ready.value || generating.value) return
      generating.value = true
      try {
        const plan = await generateExamPlanApi({
          description: description.value.trim(),
          tendency: tendency.value,
          countLevel: countLevel.value,
        })
        visible.value = false
        emit('generated', plan)
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        generating.value = false
      }
    }

    return {
      visible,
      description,
      tendency,
      countLevel,
      generating,
      ready,
      tendencyOptions: EXAM_AI_TENDENCY_OPTIONS,
      countOptions: EXAM_AI_COUNT_OPTIONS,
      open,
      handleGenerate,
    }
  },
})
