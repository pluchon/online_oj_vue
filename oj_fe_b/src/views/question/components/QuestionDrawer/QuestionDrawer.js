// 题目新增与编辑抽屉组件业务逻辑
import { defineComponent, ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { addQuestionApi, editQuestionApi, getQuestionDetailApi } from '@/api/question'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import MarkdownEditor from '@/components/MarkdownEditor'
import CodeEditor from '@/components/CodeEditor'

// 新题默认代码模板（用户只需实现方法）
const DEFAULT_CODE = 'public int solve(int n) {\n    // 请在此处编写你的代码\n    return 0;\n}'

// 新题默认评测主函数：首行读取用例数，之后每个用例读取一行输入并输出一行结果
const DEFAULT_MAIN_FUNC = [
  'public static void main(String[] args) throws IOException {',
  '    BufferedReader in = new BufferedReader(new InputStreamReader(System.in));',
  '    int t = Integer.parseInt(in.readLine().trim());',
  '    Main m = new Main();',
  '    for (int i = 0; i < t; i++) {',
  '        int n = Integer.parseInt(in.readLine().trim());',
  '        System.out.println(m.solve(n));',
  '    }',
  '}'
].join('\n')

// 生成一组空用例（isSample：1 公开示例，0 隐藏用例）
const createCase = (isSample = 1) => ({
  displayInput: '',
  displayOutput: '',
  judgeInput: '',
  judgeOutput: '',
  isSample
})

// 用例四个字段是否都已填写
const isCaseComplete = (item) => ['displayInput', 'displayOutput', 'judgeInput', 'judgeOutput']
  .every(key => (item[key] || '').trim())

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

    // 测试用例列表
    const testCaseList = ref([createCase(1)])

    // 表单默认初始值
    const getInitialFormData = () => ({
      questionId: null,
      title: '',
      difficulty: 1,
      timeLimit: 1000,
      spaceLimit: 128,
      content: '',
      defaultCode: DEFAULT_CODE,
      mainFunc: DEFAULT_MAIN_FUNC,
    })

    // 表单响应式数据
    const formData = reactive(getInitialFormData())

    // 抽屉动态标题
    const drawerTitle = computed(() => {
      return mode.value === 'add' ? '新增题目' : '编辑题目'
    })

    // 将详情接口返回的用例转为编辑列表
    const toEditableCases = (cases) => {
      if (!Array.isArray(cases) || cases.length === 0) {
        return [createCase(1)]
      }
      return cases.map(item => ({
        displayInput: item.displayInput || '',
        displayOutput: item.displayOutput || '',
        judgeInput: item.judgeInput || '',
        judgeOutput: item.judgeOutput || '',
        isSample: item.isSample === 1 ? 1 : 0
      }))
    }

    // 组装提交用的用例列表（去除首尾空白）
    const buildCasesPayload = () => testCaseList.value.map(item => ({
      displayInput: item.displayInput.trim(),
      displayOutput: item.displayOutput.trim(),
      judgeInput: item.judgeInput.trim(),
      judgeOutput: item.judgeOutput.trim(),
      isSample: item.isSample
    }))

    // 添加一组空测试用例（首组之后默认为隐藏用例）
    const handleAddTestCase = () => {
      testCaseList.value.push(createCase(0))
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
        testCases: JSON.stringify(testCaseList.value),
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
          testCaseList.value = toEditableCases(detailData.cases)
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
        testCaseList.value = [createCase(1)]
        recordSnapshot()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      } else if (type === 'edit' && questionId) {
        Object.assign(formData, getInitialFormData())
        testCaseList.value = [createCase(1)]
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

      // 校验测试用例：每组四项必填，且至少一组公开示例
      const incompleteIndex = testCaseList.value.findIndex(item => !isCaseComplete(item))
      if (incompleteIndex !== -1) {
        ElMessage.warning(`用例 #${incompleteIndex + 1} 的展示与判题输入输出需全部填写`)
        return
      }
      if (!testCaseList.value.some(item => item.isSample === 1)) {
        ElMessage.warning('请至少设置一组公开示例')
        return
      }
      const cases = buildCasesPayload()

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
              cases,
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
              cases,
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
