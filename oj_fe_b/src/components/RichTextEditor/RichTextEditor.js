// 富文本编辑器组件逻辑实现
import { shallowRef, onBeforeUnmount, computed, watch, defineComponent } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

export default defineComponent({
  name: 'RichTextEditor',
  components: {
    Editor,
    Toolbar
  },
  props: {
    // 绑定内容（HTML 字符串）
    modelValue: {
      type: String,
      default: ''
    },
    // 占位提示文案
    placeholder: {
      type: String,
      default: '请输入题目详细描述内容...'
    },
    // 是否禁用编辑
    disabled: {
      type: Boolean,
      default: false
    },
    // 编辑区域高度
    height: {
      type: String,
      default: '320px'
    },
    // 最小高度
    minHeight: {
      type: String,
      default: '200px'
    },
    // 编辑器模式（default 或 simple）
    mode: {
      type: String,
      default: 'default'
    }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus'],
  setup(props, { emit }) {
    // 编辑器实例引用（必须使用 shallowRef）
    const editorRef = shallowRef(null)
    let isDestroying = false

    // 工具栏配置：排除无用的音视频插入与全屏按钮，聚焦技术题目文本编辑
    const toolbarConfig = computed(() => {
      return {
        excludeKeys: [
          'fullScreen',
          'insertVideo',
          'uploadVideo',
          'group-video'
        ]
      }
    })

    // 编辑器核心配置
    const editorConfig = computed(() => {
      return {
        placeholder: props.placeholder,
        readOnly: props.disabled,
        MENU_CONF: {}
      }
    })

    // 编辑器初始化创建回调
    const handleCreated = (editor) => {
      editorRef.value = editor
      if (props.modelValue) {
        editor.setHtml(props.modelValue)
      }
      if (props.disabled) {
        editor.disable()
      }
    }

    // 编辑内容变更回调
    const handleChange = (editor) => {
      if (isDestroying) return
      let html = editor.getHtml()
      // 过滤空段落默认值
      if (html === '<p><br></p>') {
        html = ''
      }
      emit('update:modelValue', html)
      emit('change', html)
    }

    // 监听外部 modelValue 数据变更同步更新视图
    watch(
      () => props.modelValue,
      (newVal) => {
        const editor = editorRef.value
        if (!editor || isDestroying) return
        const currentHtml = editor.getHtml()
        const targetHtml = newVal || ''
        if (currentHtml !== targetHtml) {
          editor.setHtml(targetHtml)
        }
      }
    )

    // 监听禁用状态动态切换
    watch(
      () => props.disabled,
      (newVal) => {
        const editor = editorRef.value
        if (!editor || isDestroying) return
        if (newVal) {
          editor.disable()
        } else {
          editor.enable()
        }
      }
    )

    // 组件卸载前安全释放编辑器实例，杜绝内存泄漏
    onBeforeUnmount(() => {
      isDestroying = true
      if (editorRef.value) {
        editorRef.value.destroy()
        editorRef.value = null
      }
    })

    return {
      editorRef,
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleChange
    }
  }
})
