// 题目新增与编辑抽屉组件逻辑实现
import { defineComponent, ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addQuestionApi, editQuestionApi, getQuestionDetailApi } from '@/api/question'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import RichTextEditor from '@/components/RichTextEditor'
import CodeEditor from '@/components/CodeEditor'

export default defineComponent({
  name: 'QuestionDrawer',
  components: {
    QuestionDifficultySelect,
    RichTextEditor,
    CodeEditor
  },
  emits: ['success'],
  setup(props, { emit }) {
    // 抽屉可见性
    const visible = ref(false)

    // 表单引用
    const formRef = ref(null)

    // 操作模式（add 或 edit）
    const mode = ref('add')

    // 加载详情与提交状态
    const detailLoading = ref(false)
    const submitting = ref(false)

    // 当前激活的代码标签页
    const activeCodeTab = ref('defaultCode')

    // 表单默认初始值
    const getInitialFormData = () => ({
      questionId: null,
      title: '',
      difficulty: 1,
      timeLimit: 1000,
      spaceLimit: 128,
      content: '',
      questionCase: '',
      defaultCode: 'public class Solution {\n    // 请在此处编写核心解题逻辑\n}',
      mainFunc: 'public class Main {\n    public static void main(String[] args) {\n        // 系统自动评测入口\n    }\n}'
    })

    // 表单响应式数据
    const formData = reactive(getInitialFormData())

    // 抽屉动态标题
    const drawerTitle = computed(() => {
      return mode.value === 'add' ? '新增题目' : '编辑题目'
    })

    // 自定义富文本内容校验规则
    const validateContent = (rule, value, callback) => {
      const pureText = (value || '').replace(/<[^>]+>/g, '').trim()
      if (!pureText && !value?.includes('<img')) {
        callback(new Error('题目描述内容不能为空'))
      } else {
        callback()
      }
    }

    // 表单各项校验规则约束
    const formRules = {
      title: [
        { required: true, message: '题目标题不能为空', trigger: 'blur' },
        { max: 50, message: '题目标题长度不能超过50个字符', trigger: 'blur' }
      ],
      difficulty: [
        { required: true, message: '请选择题目难度', trigger: 'change' }
      ],
      timeLimit: [
        { required: true, message: '时间限制不能为空', trigger: 'blur' }
      ],
      spaceLimit: [
        { required: true, message: '空间限制不能为空', trigger: 'blur' }
      ],
      content: [
        { required: true, validator: validateContent, trigger: 'blur' }
      ],
      questionCase: [
        { required: true, message: '题目用例不能为空', trigger: 'blur' },
        { max: 1000, message: '题目用例长度不能超过1000个字符', trigger: 'blur' }
      ],
      defaultCode: [
        { required: true, message: '默认代码模板不能为空', trigger: 'blur' }
      ],
      mainFunc: [
        { required: true, message: 'Main函数不能为空', trigger: 'blur' }
      ]
    }

    // 初始表单内容快照，用于对比判断内容是否发生修改
    let originSnapshot = ''

    // 提取表单关键字段生成序列化快照
    const getFormDataSnapshot = () => {
      return JSON.stringify({
        title: (formData.title || '').trim(),
        difficulty: Number(formData.difficulty || 1),
        timeLimit: Number(formData.timeLimit || 1000),
        spaceLimit: Number(formData.spaceLimit || 128),
        content: (formData.content || '').trim(),
        questionCase: (formData.questionCase || '').trim(),
        defaultCode: (formData.defaultCode || '').trim(),
        mainFunc: (formData.mainFunc || '').trim()
      })
    }

    // 记录初始基准快照
    const recordSnapshot = () => {
      originSnapshot = getFormDataSnapshot()
    }

    // 判断表单内容是否被改动过
    const isFormDirty = () => {
      return getFormDataSnapshot() !== originSnapshot
    }

    // 根据题目ID获取详情并回显
    const fetchDetail = async (questionId) => {
      detailLoading.value = true
      try {
        const res = await getQuestionDetailApi(questionId)
        // 兼容 request.js 自动脱壳返回 res.data 与未脱壳两种结构
        const detailData = res?.data || res
        if (detailData && (detailData.questionId || res?.code === 1000)) {
          Object.assign(formData, detailData)
          // 回显成功后记录基准快照
          recordSnapshot()
        } else {
          ElMessage.error(res?.msg || '获取题目详情失败')
        }
      } catch (err) {
        // request.js 拦截器已处理错误提示
      } finally {
        detailLoading.value = false
      }
    }

    // 打开抽屉暴露方法（支持 add / edit）
    const open = (type = 'add', questionId = null) => {
      visible.value = true
      mode.value = type
      activeCodeTab.value = 'defaultCode'

      if (type === 'add') {
        Object.assign(formData, getInitialFormData())
        recordSnapshot()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      } else if (type === 'edit' && questionId) {
        Object.assign(formData, getInitialFormData())
        recordSnapshot()
        fetchDetail(questionId)
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }

    // 保存提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async (valid) => {
        if (!valid) return
        submitting.value = true
        try {
          if (mode.value === 'add') {
            const addPayload = {
              title: formData.title.trim(),
              difficulty: formData.difficulty,
              timeLimit: formData.timeLimit,
              spaceLimit: formData.spaceLimit,
              content: formData.content,
              questionCase: formData.questionCase,
              defaultCode: formData.defaultCode,
              mainFunc: formData.mainFunc
            }
            await addQuestionApi(addPayload)
            ElMessage.success('新增题目成功')
            visible.value = false
            emit('success', 'add')
          } else {
            const editPayload = {
              questionId: formData.questionId,
              title: formData.title.trim(),
              difficulty: formData.difficulty,
              timeLimit: formData.timeLimit,
              spaceLimit: formData.spaceLimit,
              content: formData.content,
              questionCase: formData.questionCase,
              defaultCode: formData.defaultCode,
              mainFunc: formData.mainFunc
            }
            await editQuestionApi(editPayload)
            ElMessage.success('修改题目成功')
            visible.value = false
            emit('success', 'edit')
          }
        } catch (err) {
          // request.js 响应拦截器已自动弹出错误信息（如：资源已存在）
        } finally {
          submitting.value = false
        }
      })
    }

    // 关闭抽屉前的防呆防丢失确认（内容未修改则直接关闭，不弹窗询问）
    const handleBeforeClose = (done) => {
      if (submitting.value) return
      // 如果内容未发生改变，直接放行关闭，无需询问
      if (!isFormDirty()) {
        done()
        return
      }
      ElMessageBox.confirm('当前修改尚未保存，确认关闭抽屉吗？', '提示', {
        confirmButtonText: '确定关闭',
        cancelButtonText: '继续编辑',
        type: 'warning'
      })
        .then(() => {
          done()
        })
        .catch(() => {})
    }

    // 手动点击取消关闭
    const handleClose = () => {
      handleBeforeClose(() => {
        visible.value = false
      })
    }

    return {
      visible,
      formRef,
      mode,
      drawerTitle,
      detailLoading,
      submitting,
      activeCodeTab,
      formData,
      formRules,
      open,
      handleSubmit,
      handleBeforeClose,
      handleClose
    }
  }
})
