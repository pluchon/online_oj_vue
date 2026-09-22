// AI 题面草稿弹窗：输入一句话描述，生成后交给父组件回填表单
import { defineComponent, ref } from 'vue'
import { ElMessage } from 'element-plus'
import OjDialog from '@/components/OjDialog'
import { generateQuestionDraftApi } from '@/api/question'

export default defineComponent({
  name: 'QuestionAiDraftDialog',
  components: {
    OjDialog,
  },
  emits: ['generated'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 一句话描述
    const description = ref('')

    // 生成中状态
    const generating = ref(false)

    // 打开弹窗
    const open = () => {
      visible.value = true
    }

    // 请求生成题面草稿，成功后关闭弹窗并交给父组件回填
    const handleGenerate = async () => {
      const text = description.value.trim()
      if (!text) {
        ElMessage.warning('请先输入题目描述')
        return
      }
      generating.value = true
      try {
        const draft = await generateQuestionDraftApi({ description: text })
        visible.value = false
        emit('generated', draft)
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        generating.value = false
      }
    }

    return {
      visible,
      description,
      generating,
      open,
      handleGenerate,
    }
  },
})
