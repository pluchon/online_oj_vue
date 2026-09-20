// 编译器代码块组件逻辑实现
import { ref, shallowRef, computed, watch, defineComponent } from 'vue'
import * as monaco from 'monaco-editor'
import { VueMonacoEditor, loader } from '@guolao/vue-monaco-editor'

// 配置使用本地安装的 monaco-editor 依赖，保障离线与内网稳定运行
loader.config({ monaco })

export default defineComponent({
  name: 'CodeEditor',
  components: {
    VueMonacoEditor
  },
  props: {
    // 双向绑定代码文本
    modelValue: {
      type: String,
      default: ''
    },
    // 当前代码语言（java, cpp, c, python, go 等）
    language: {
      type: String,
      default: 'java'
    },
    // 主题（vs 或 vs-dark）
    theme: {
      type: String,
      default: 'vs'
    },
    // 容器标题（如：代码）
    title: {
      type: String,
      default: ''
    },
    // 编辑器区域高度
    height: {
      type: String,
      default: '360px'
    },
    // 是否只读
    readOnly: {
      type: Boolean,
      default: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否启用代码缩略地图
    minimap: {
      type: Boolean,
      default: false
    },
    // Monaco 原生自定义配置项覆盖
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'update:language', 'change'],
  setup(props, { emit }) {
    // 编辑器实例引用与 monaco 全局对象引用
    const editorRef = shallowRef(null)
    const monacoRef = shallowRef(null)

    // 当前语言与主题响应式状态
    const currentLanguage = ref(props.language)
    const currentTheme = ref(props.theme)

    // 支持的语言列表选项
    const languageOptions = [
      { label: 'Java', value: 'java' },
      { label: 'C++', value: 'cpp' },
      { label: 'C', value: 'c' },
      { label: 'Python', value: 'python' },
      { label: 'Go', value: 'go' }
    ]

    // Monaco 编辑器核心配置项合并
    const mergedOptions = computed(() => {
      return {
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "Consolas, 'Courier New', Courier, monospace",
        lineNumbers: 'on',
        minimap: { enabled: props.minimap },
        readOnly: props.disabled || props.readOnly,
        scrollBeyondLastLine: false,
        tabSize: 4,
        cursorBlinking: 'smooth',
        renderWhitespace: 'selection',
        contextmenu: true,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8
        },
        ...props.options
      }
    })

    // 编辑器挂载完成回调
    const handleEditorMount = (editor, monacoInstance) => {
      editorRef.value = editor
      monacoRef.value = monacoInstance
    }

    // 代码内容变动回调
    const handleValueChange = (val) => {
      const formattedVal = val == null ? '' : val
      emit('update:modelValue', formattedVal)
      emit('change', formattedVal)
    }

    // 语言变动回调
    const handleLanguageChange = (newLang) => {
      currentLanguage.value = newLang
      emit('update:language', newLang)
    }

    // 主题快捷切换（明/暗）
    const toggleTheme = () => {
      currentTheme.value = currentTheme.value === 'vs-dark' ? 'vs' : 'vs-dark'
    }

    // 格式化代码执行
    const handleFormatCode = () => {
      if (editorRef.value) {
        editorRef.value.getAction('editor.action.formatDocument')?.run()
      }
    }

    // 监听外部传入语言同步
    watch(
      () => props.language,
      (newLang) => {
        if (newLang && newLang !== currentLanguage.value) {
          currentLanguage.value = newLang
        }
      }
    )

    // 监听外部传入主题同步
    watch(
      () => props.theme,
      (newTheme) => {
        if (newTheme && newTheme !== currentTheme.value) {
          currentTheme.value = newTheme
        }
      }
    )

    return {
      currentLanguage,
      currentTheme,
      languageOptions,
      mergedOptions,
      handleEditorMount,
      handleValueChange,
      handleLanguageChange,
      toggleTheme,
      handleFormatCode
    }
  }
})
