// 题目难度徽章展示组件
import { defineComponent, computed } from 'vue'
import { DIFFICULTY_OPTIONS } from '@/constants'

export default defineComponent({
  name: 'DifficultyTag',
  props: {
    // 难度数值（1: 简单, 2: 中等, 3: 困难）
    difficulty: {
      type: [Number, String],
      required: true
    },
    // 可选的外部传入描述文案（若无则自动从字典解析）
    desc: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    // 当前难度对应的字典项
    const option = computed(() => DIFFICULTY_OPTIONS.find((opt) => opt.value === Number(props.difficulty)))

    // 难度样式类名
    const difficultyClass = computed(() => option.value?.tagClass || '')

    // 难度展示文本（优先使用后端返回的描述）
    const displayText = computed(() => props.desc || option.value?.label || '未知')

    return {
      difficultyClass,
      displayText
    }
  }
})
