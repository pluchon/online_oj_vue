// 轻量级分栏 Markdown 编辑器逻辑
import { defineComponent, computed, ref } from 'vue'
import { marked } from 'marked'

// 配置 marked 解析选项
marked.setOptions({
  gfm: true,
  breaks: true,
})

export default defineComponent({
  name: 'MarkdownEditor',
  props: {
    // 绑定的 Markdown 文本内容
    modelValue: {
      type: String,
      default: '',
    },
    // 输入框占位提示
    placeholder: {
      type: String,
      default: '支持 Markdown 语法，左侧输入，右侧实时排版渲染预览...',
    },
    // 编辑器容器整体高度
    height: {
      type: String,
      default: '320px',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const textareaRef = ref(null)

    // 实时计算 Markdown 转换后的 HTML 内容
    const htmlContent = computed(() => {
      if (!props.modelValue || !props.modelValue.trim()) {
        return ''
      }
      try {
        return marked.parse(props.modelValue)
      } catch (e) {
        return props.modelValue
      }
    })

    // 输入内容双向绑定派发
    const handleInput = (e) => {
      emit('update:modelValue', e.target.value)
    }

    // 支持 Tab 键缩进 2 个空格
    const handleKeydown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = textareaRef.value
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        emit('update:modelValue', newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }

    return {
      textareaRef,
      htmlContent,
      handleInput,
      handleKeydown,
    }
  },
})
