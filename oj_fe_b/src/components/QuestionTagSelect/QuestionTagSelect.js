// 题目标签选择器：左侧选分类，右侧选该分类下的标签（选项由父组件传入）
import { defineComponent, ref, computed, watch } from 'vue'
import { TAG_CATEGORY_OPTIONS, MAX_QUESTION_TAGS } from '@/constants'

// "全部"选项的内部取值（对外统一为 null）
const ALL = 'ALL'

export default defineComponent({
  name: 'QuestionTagSelect',
  props: {
    // 绑定值：单选为标签ID（null 表示全部标签），多选为标签ID数组
    modelValue: {
      type: [String, Array, null],
      default: null
    },
    // 标签分类（v-model:category，null 表示全部分类；筛选栏需要把分类作为查询条件时绑定）
    category: {
      type: [Number, null],
      default: null
    },
    // 标签选项（后端标签列表）
    options: {
      type: Array,
      default: () => []
    },
    // 是否多选（题目表单用）
    multiple: {
      type: Boolean,
      default: false
    },
    // 多选时最多可选数量
    multipleLimit: {
      type: Number,
      default: MAX_QUESTION_TAGS
    },
    // 选项是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:category', 'change'],
  setup(props, { emit }) {
    // 当前分类（父组件未绑定时由组件自己维护）
    const innerCategory = ref(props.category)
    watch(() => props.category, (val) => {
      innerCategory.value = val
    })

    // 分类下拉的内部取值
    const categoryValue = computed(() => innerCategory.value ?? ALL)

    // 标签下拉的内部取值
    const tagValue = computed(() => {
      if (props.multiple) return props.modelValue || []
      return props.modelValue || ALL
    })

    // 当前分类下的标签
    const visibleTags = computed(() => {
      if (innerCategory.value === null) return props.options
      return props.options.filter(tag => tag.category === innerCategory.value)
    })

    // 全部分类时按分类分组，空分类不展示
    const groupedTags = computed(() => TAG_CATEGORY_OPTIONS
      .map(category => ({
        value: category.value,
        label: category.label,
        tags: props.options.filter(tag => tag.category === category.value)
      }))
      .filter(group => group.tags.length > 0))

    // 多选时已选数量
    const selectedCount = computed(() => (props.multiple ? (props.modelValue || []).length : 0))

    // 标签下拉的占位文案
    const tagPlaceholder = computed(() => (props.multiple ? '可选' : '全部标签'))

    // 按ID取标签名称（已删除的标签显示为ID）
    const tagNameOf = (tagId) => props.options.find(tag => tag.tagId === tagId)?.tagName || tagId

    // 切换分类：单选时若已选标签不属于新分类则清空
    const handleCategoryChange = (val) => {
      const category = val === ALL ? null : val
      innerCategory.value = category
      emit('update:category', category)
      if (!props.multiple && props.modelValue) {
        const current = props.options.find(tag => tag.tagId === props.modelValue)
        if (category !== null && current?.category !== category) {
          emit('update:modelValue', null)
        }
      }
      emit('change')
    }

    // 切换标签
    const handleTagChange = (val) => {
      const value = props.multiple ? (val || []) : (val === ALL || !val ? null : val)
      emit('update:modelValue', value)
      emit('change')
    }

    return {
      ALL,
      categoryOptions: TAG_CATEGORY_OPTIONS,
      categoryValue,
      tagValue,
      visibleTags,
      groupedTags,
      selectedCount,
      tagPlaceholder,
      tagNameOf,
      handleCategoryChange,
      handleTagChange
    }
  }
})
