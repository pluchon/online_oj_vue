// 轻量级分栏 Markdown 编辑器逻辑
import { defineComponent, computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { renderMarkdownBlocks } from '@/utils/markdown'

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
    const previewRef = ref(null)
    const mirrorRef = ref(null)

    // 实时计算 Markdown 转换后的 HTML 内容（经 DOMPurify 过滤脚本；按块渲染并带源文本行号）
    const htmlContent = computed(() => renderMarkdownBlocks(props.modelValue))

    // 左右滚动对齐的锚点：编辑区滚动位置 editorY 对应预览区滚动位置 previewY
    let anchors = []

    // 量出锚点：镜像层逐行复刻输入框内容得到每个块起始行在左侧的位置，预览区直接取块的位置
    const measureAnchors = () => {
      const textarea = textareaRef.value
      const preview = previewRef.value
      const mirror = mirrorRef.value
      if (!textarea || !preview || !mirror) return
      const style = getComputedStyle(textarea)
      Object.assign(mirror.style, {
        width: `${textarea.clientWidth}px`,
        font: style.font,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        padding: style.padding
      })
      const fragment = document.createDocumentFragment()
      for (const text of textarea.value.split('\n')) {
        const lineEl = document.createElement('div')
        // 空行放一个零宽空格，保证它占一行高度
        lineEl.textContent = text || '​'
        fragment.appendChild(lineEl)
      }
      mirror.replaceChildren(fragment)

      const paddingTop = parseFloat(style.paddingTop) || 0
      const points = [{ editorY: 0, previewY: 0 }]
      preview.querySelectorAll('.md-block[data-line]').forEach((block) => {
        const lineEl = mirror.children[Number(block.dataset.line)]
        if (!lineEl) return
        points.push({ editorY: lineEl.offsetTop - paddingTop, previewY: block.offsetTop })
      })
      points.push({
        editorY: textarea.scrollHeight - textarea.clientHeight,
        previewY: preview.scrollHeight - preview.clientHeight
      })
      // 只保留两侧都递增的点，避免插值时来回跳
      anchors = points.filter((point, index) => index === 0
        || (point.editorY > points[index - 1].editorY && point.previewY >= points[index - 1].previewY))
    }

    // 左侧滚动时按锚点插值，把预览区滚到对应位置
    const syncPreviewScroll = () => {
      const textarea = textareaRef.value
      const preview = previewRef.value
      if (!textarea || !preview || anchors.length < 2) return
      const top = textarea.scrollTop
      let index = 0
      while (index < anchors.length - 2 && anchors[index + 1].editorY <= top) {
        index++
      }
      const from = anchors[index]
      const to = anchors[index + 1]
      const span = to.editorY - from.editorY
      const ratio = span > 0 ? Math.min(Math.max((top - from.editorY) / span, 0), 1) : 0
      preview.scrollTop = from.previewY + ratio * (to.previewY - from.previewY)
    }

    // 内容变化后等预览渲染完再重新测量
    const remeasure = () => {
      nextTick(() => {
        measureAnchors()
        syncPreviewScroll()
      })
    }
    watch(() => props.modelValue, remeasure)

    // 尺寸变化（抽屉展开、窗口缩放）时重新测量
    let resizeObserver = null
    onMounted(() => {
      remeasure()
      if (window.ResizeObserver && textareaRef.value) {
        resizeObserver = new ResizeObserver(remeasure)
        resizeObserver.observe(textareaRef.value)
      }
    })
    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      resizeObserver = null
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
      previewRef,
      mirrorRef,
      htmlContent,
      syncPreviewScroll,
      handleInput,
      handleKeydown,
    }
  },
})
