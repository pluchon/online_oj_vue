// 题目难度通用选择器逻辑
import { defineComponent } from 'vue'

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
      default: '请选择题目难度'
    },
    // 是否支持清空
    clearable: {
      type: Boolean,
      default: true
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
    // 针对 Element Plus 选择器类型陷阱进行严格归一化清洗：
    // 若点击清空按钮或选项缺失 value 产生空字符串、false、undefined 时，一律统一清洗为 null，防止向后端传递错误类型
    const normalizeValue = (val) => {
      if (val === '' || val === false || val === undefined) {
        return null
      }
      return val
    }

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
      handleUpdateValue,
      handleChange
    }
  }
})
