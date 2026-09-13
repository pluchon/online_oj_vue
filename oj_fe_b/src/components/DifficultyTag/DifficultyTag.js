// 题目难度徽章展示组件
import { defineComponent, computed } from 'vue'
import { DIFFICULTY_OPTIONS } from '@/components/QuestionDifficultySelect'

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
    // 难度样式类名映射
    const difficultyClass = computed(() => {
      const val = Number(props.difficulty)
      const map = {
        1: 'difficulty-easy',
        2: 'difficulty-medium',
        3: 'difficulty-hard'
      }
      return map[val] || ''
    })

    // 难度展示文本
    const displayText = computed(() => {
      if (props.desc) {
        return props.desc
      }
      const val = Number(props.difficulty)
      const item = DIFFICULTY_OPTIONS.find((opt) => opt.value === val)
      return item ? item.label : '未知'
    })

    return {
      difficultyClass,
      displayText
    }
  }
})
