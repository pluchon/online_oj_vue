// 题目难度通用选择器逻辑
import { defineComponent, computed } from 'vue'

// 题目难度枚举字典定义
export const DIFFICULTY_OPTIONS = [
  { value: 1, label: '简单', tagClass: 'difficulty-easy' },
  { value: 2, label: '中等', tagClass: 'difficulty-medium' },
  { value: 3, label: '困难', tagClass: 'difficulty-hard' }
]

export default defineComponent({
  name: 'QuestionDifficultySelect',
  props: {
    // 绑定值（1: 简单, 2: 中等, 3: 困难，null: 全部）
    modelValue: {
      type: [Number, String, null],
      default: null
    },
    // 是否包含"全部难度"选项（用于列表筛选栏，表单录入通常设为 false）
    includeAll: {
      type: Boolean,
      default: false
    },
    // "全部"选项的显示文本
    allLabel: {
      type: String,
      default: '全部难度'
    },
    // 占位提示文案
    placeholder: {
      type: String,
      default: ''
    },
    // 是否支持清空
    clearable: {
      type: Boolean,
      default: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 尺寸大小 (large | default | small)
    size: {
      type: String,
      default: 'default'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // 归一化清洗值：'ALL'、空字符串、false、undefined、null 均转换为 null 供外部筛选传参
    const normalizeValue = (val) => {
      if (val === 'ALL' || val === '' || val === false || val === undefined || val === null) {
        return null
      }
      return Number(val)
    }

    // 内部 select 渲染绑定值：在包含“全部难度”时，null/空 映射为 'ALL' 匹配选项，确保文字必定完整显示
    const selectValue = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
        return props.includeAll ? 'ALL' : ''
      }
      return props.modelValue
    })

    // 占位符计算：默认展示全部难度
    const displayPlaceholder = computed(() => {
      if (props.placeholder) return props.placeholder
      return props.includeAll ? props.allLabel : '请选择难度'
    })

    // 值变更触发
    const handleUpdateValue = (val) => {
      emit('update:modelValue', normalizeValue(val))
    }

    // 选项改变触发
    const handleChange = (val) => {
      emit('change', normalizeValue(val))
    }

    return {
      difficultyOptions: DIFFICULTY_OPTIONS,
      selectValue,
      displayPlaceholder,
      handleUpdateValue,
      handleChange
    }
  }
})
