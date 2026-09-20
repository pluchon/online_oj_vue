// 题目新增与编辑抽屉组件业务逻辑
import { defineComponent, ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { addQuestionApi, editQuestionApi, getQuestionDetailApi } from '@/api/question'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import MarkdownEditor from '@/components/MarkdownEditor'
import CodeEditor from '@/components/CodeEditor'

export default defineComponent({
  name: 'QuestionDrawer',
  components: {
    QuestionDifficultySelect,
    MarkdownEditor,
    CodeEditor,
    Plus,
    Delete,
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

    // 监听代码标签页切换，触发布局自适应
    watch(activeCodeTab, () => {
      nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    })

    // 结构化测试用例列表
    const testCaseList = ref([
      { input: '', output: '' }
    ])

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
      mainFunc: 'public class Main {\n    public static void main(String[] args) {\n        // 系统自动评测入口\n    }\n}',
    })

    // 表单响应式数据
    const formData = reactive(getInitialFormData())

    // 抽屉动态标题
    const drawerTitle = computed(() => {
      return mode.value === 'add' ? '新增题目' : '编辑题目'
    })

    // 解析测试用例 JSON 字符串为对象列表
    const parseTestCases = (raw) => {
      if (!raw || typeof raw !== 'string') {
        return [{ input: '', output: '' }]
      }
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            input: typeof item.input === 'string' ? item.input : JSON.stringify(item.input ?? ''),
            output: typeof item.output === 'string' ? item.output : JSON.stringify(item.output ?? ''),
          }))
        }
      } catch (e) {
        // 兼容非 JSON 格式旧字符串
        return [{ input: raw, output: '' }]
      }
      return [{ input: '', output: '' }]
    }

    // 序列化测试用例对象列表为标准 JSON 字符串
    const serializeTestCases = () => {
      const validCases = testCaseList.value
        .map((item) => ({
          input: (item.input || '').trim(),
          output: (item.output || '').trim(),
        }))
        .filter((item) => item.input || item.output)

      return JSON.stringify(validCases)
    }

    // 添加一组空测试用例
    const handleAddTestCase = () => {
      testCaseList.value.push({ input: '', output: '' })
    }

    // 删除指定测试用例
    const handleRemoveTestCase = (index) => {
      if (testCaseList.value.length > 1) {
        testCaseList.value.splice(index, 1)
      }
    }

    // 表单各项校验规则
    const formRules = {
      title: [
        { required: true, message: '题目标题不能为空', trigger: 'blur' },
        { max: 50, message: '题目标题长度不能超过50个字符', trigger: 'blur' },
      ],
      difficulty: [
        { required: true, message: '请选择题目难度', trigger: 'change' },
      ],
      timeLimit: [
        { required: true, message: '时间限制不能为空', trigger: 'blur' },
      ],
      spaceLimit: [
        { required: true, message: '空间限制不能为空', trigger: 'blur' },
      ],
      content: [
        { required: true, message: '题目描述不能为空', trigger: 'blur' },
      ],
      defaultCode: [
        { required: true, message: '默认代码模板不能为空', trigger: 'blur' },
      ],
      mainFunc: [
        { required: true, message: 'Main函数不能为空', trigger: 'blur' },
      ],
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
        testCases: serializeTestCases(),
        defaultCode: (formData.defaultCode || '').trim(),
        mainFunc: (formData.mainFunc || '').trim(),
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
        const detailData = res?.data || res
        if (detailData && (detailData.questionId || res?.code === 1000)) {
          Object.assign(formData, detailData)
          testCaseList.value = parseTestCases(detailData.questionCase)
          recordSnapshot()
        } else {
          ElMessage.error(res?.msg || '获取题目详情失败')
        }
      } catch (err) {
        // 异常统一由全局拦截器提示
      } finally {
        detailLoading.value = false
      }
    }

    // 打开抽屉（支持 add / edit）
    const open = (type = 'add', questionId = null) => {
      visible.value = true
      mode.value = type
      activeCodeTab.value = 'defaultCode'

      if (type === 'add') {
        Object.assign(formData, getInitialFormData())
        testCaseList.value = [{ input: '', output: '' }]
        recordSnapshot()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      } else if (type === 'edit' && questionId) {
        Object.assign(formData, getInitialFormData())
        testCaseList.value = [{ input: '', output: '' }]
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

      // 校验测试用例非空
      const serializedCases = serializeTestCases()
      if (serializedCases === '[]') {
        ElMessage.warning('请至少填写一组有效的测试用例输入或输出')
        return
      }
      formData.questionCase = serializedCases

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
              mainFunc: formData.mainFunc,
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
              mainFunc: formData.mainFunc,
            }
            await editQuestionApi(editPayload)
            ElMessage.success('修改题目成功')
            visible.value = false
            emit('success', 'edit')
          }
        } catch (err) {
          // 异常拦截已处理
        } finally {
          submitting.value = false
        }
      })
    }

    // 关闭抽屉前的防呆确认
    const handleBeforeClose = (done) => {
      if (submitting.value) return
      if (!isFormDirty()) {
        done()
        return
      }
      ElMessageBox.confirm('当前修改尚未保存，确认关闭抽屉吗？', '提示', {
        confirmButtonText: '确定关闭',
        cancelButtonText: '继续编辑',
        type: 'warning',
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
      testCaseList,
      handleAddTestCase,
      handleRemoveTestCase,
      open,
      handleSubmit,
      handleBeforeClose,
      handleClose,
    }
  },
})
