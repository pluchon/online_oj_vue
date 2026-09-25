// 题目新增与编辑抽屉组件业务逻辑
import { defineComponent, ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, MagicStick, Loading } from '@element-plus/icons-vue'
import {
  addQuestionApi,
  editQuestionApi,
  getQuestionDetailApi,
  generateQuestionSolutionApi,
  generateQuestionEditorialApi
} from '@/api/question'
import { CASE_TYPE } from '@/constants'
import QuestionDifficultySelect from '@/components/QuestionDifficultySelect'
import QuestionTagSelect from '@/components/QuestionTagSelect'
import MarkdownEditor from '@/components/MarkdownEditor'
import CodeEditor from '@/components/CodeEditor'
import AiGlowBorder from '@/components/AiGlowBorder'
import QuestionAiDraftDialog from '../QuestionAiDraftDialog'
import QuestionAiCaseDialog from '../QuestionAiCaseDialog'

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

// 单题最多用例组数（与后端 QuestionAddDTO 校验一致）
const MAX_CASES = 50

// 题解最大长度（与后端 QuestionAddDTO 校验一致）
const MAX_EDITORIAL_LENGTH = 10000

// 生成一组空用例
const createCase = (isSample = CASE_TYPE.SAMPLE) => ({
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
    QuestionTagSelect,
    MarkdownEditor,
    CodeEditor,
    AiGlowBorder,
    QuestionAiDraftDialog,
    QuestionAiCaseDialog,
    Plus,
    Delete,
    MagicStick,
    Loading,
  },
  props: {
    // 标签选项（由题目管理页加载后传入）
    tagOptions: {
      type: Array,
      default: () => []
    },
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
    const testCaseList = ref([createCase()])

    // AI 弹窗引用
    const draftDialogRef = ref(null)
    const caseDialogRef = ref(null)

    // AI 解法示例（只在本次编辑中保留，不保存；生成用例时作为标程）
    const aiSolution = ref('')
    const solutionLoading = ref(false)

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
      tagIds: [],
      editorial: '',
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
        return [createCase()]
      }
      return cases.map(item => ({
        displayInput: item.displayInput || '',
        displayOutput: item.displayOutput || '',
        judgeInput: item.judgeInput || '',
        judgeOutput: item.judgeOutput || '',
        isSample: item.isSample === CASE_TYPE.SAMPLE ? CASE_TYPE.SAMPLE : CASE_TYPE.HIDDEN
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
      if (testCaseList.value.length >= MAX_CASES) {
        ElMessage.warning(`每道题最多配置 ${MAX_CASES} 组用例`)
        return
      }
      testCaseList.value.push(createCase(CASE_TYPE.HIDDEN))
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
        { max: 1000, message: '题目描述长度不能超过1000个字符', trigger: 'blur' },
      ],
      defaultCode: [
        { required: true, message: '默认代码模板不能为空', trigger: 'blur' },
        { max: 500, message: '默认代码模板长度不能超过500个字符', trigger: 'blur' },
      ],
      mainFunc: [
        { required: true, message: 'Main函数不能为空', trigger: 'blur' },
        { max: 5000, message: 'Main函数长度不能超过5000个字符', trigger: 'blur' },
      ],
      editorial: [
        { max: MAX_EDITORIAL_LENGTH, message: `题解长度不能超过${MAX_EDITORIAL_LENGTH}个字符`, trigger: 'blur' },
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
        tagIds: [...(formData.tagIds || [])],
        editorial: (formData.editorial || '').trim(),
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

    // 根据题目ID获取详情并回显（加载失败时关闭抽屉，避免在空表单上误保存）
    const fetchDetail = async (questionId) => {
      detailLoading.value = true
      try {
        const detail = await getQuestionDetailApi(questionId)
        Object.keys(getInitialFormData()).forEach((key) => {
          if (detail[key] !== undefined && detail[key] !== null) {
            formData[key] = detail[key]
          }
        })
        testCaseList.value = toEditableCases(detail.cases)
        formData.tagIds = (detail.tags || []).map(tag => tag.tagId)
        recordSnapshot()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        visible.value = false
      } finally {
        detailLoading.value = false
      }
    }

    // 打开抽屉（支持 add / edit）
    const open = (type = 'add', questionId = null) => {
      visible.value = true
      mode.value = type
      activeCodeTab.value = 'defaultCode'

      Object.assign(formData, getInitialFormData())
      testCaseList.value = [createCase()]
      aiSolution.value = ''
      recordSnapshot()
      nextTick(() => {
        formRef.value?.clearValidate()
      })
      if (type === 'edit' && questionId) {
        fetchDetail(questionId)
      }
    }

    // 打开 AI 题面草稿弹窗
    const openDraftDialog = () => {
      draftDialogRef.value?.open()
    }

    // 用 AI 草稿回填表单（标题或描述已有内容时先确认覆盖）
    const applyDraft = async (draft) => {
      if ((formData.title || '').trim() || (formData.content || '').trim()) {
        try {
          await ElMessageBox.confirm('将用 AI 草稿覆盖当前的标题、描述、限制、代码模板与标签，确认吗？', '提示', {
            confirmButtonText: '覆盖',
            cancelButtonText: '取消',
            type: 'warning',
          })
        } catch (err) {
          return
        }
      }
      const draftKeys = ['title', 'difficulty', 'timeLimit', 'spaceLimit', 'content', 'defaultCode', 'mainFunc']
      draftKeys.forEach((key) => {
        if (draft[key] !== undefined && draft[key] !== null && draft[key] !== '') {
          formData[key] = draft[key]
        }
      })
      // 建议标签只保留当前仍存在的标签
      const suggestedTagIds = (draft.tagIds || [])
        .filter(tagId => props.tagOptions.some(tag => tag.tagId === tagId))
      if (suggestedTagIds.length) {
        formData.tagIds = suggestedTagIds
      }
      nextTick(() => {
        formRef.value?.clearValidate()
      })
      ElMessage.success('草稿已填入表单，请检查后再保存')
    }

    // 检查 AI 所需的表单字段，缺失时提示并返回 false
    const ensureAiFields = (fields) => {
      const missing = fields.find(([key]) => !(formData[key] || '').trim())
      if (missing) {
        ElMessage.warning(`请先填写${missing[1]}`)
        return false
      }
      return true
    }

    // 解法示例需要的字段
    const SOLUTION_FIELDS = [
      ['title', '题目标题'],
      ['content', '题目描述'],
      ['defaultCode', '默认代码模板'],
    ]

    // 生成用例还需要 Main 函数
    const CASE_FIELDS = [...SOLUTION_FIELDS, ['mainFunc', 'Main 评测函数']]

    // 生成 AI 解法示例并切换到对应标签页
    const generateSolution = async () => {
      if (!ensureAiFields(SOLUTION_FIELDS)) return
      solutionLoading.value = true
      try {
        const result = await generateQuestionSolutionApi({
          title: formData.title.trim(),
          content: formData.content,
          defaultCode: formData.defaultCode,
        })
        rememberSolution(result.code)
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        solutionLoading.value = false
      }
    }

    // 记住解法示例并展示
    const rememberSolution = (code) => {
      if (!code) return
      aiSolution.value = code
      activeCodeTab.value = 'aiSolution'
    }

    // AI 题解生成中
    const editorialLoading = ref(false)

    // 生成 AI 题解草稿：已有题解时先确认覆盖；有 AI 解法示例时作为参考解法
    const generateEditorial = async () => {
      if (!ensureAiFields(SOLUTION_FIELDS)) return
      if ((formData.editorial || '').trim()) {
        try {
          await ElMessageBox.confirm('将用 AI 草稿覆盖当前的题解，确认吗？', '提示', {
            confirmButtonText: '覆盖',
            cancelButtonText: '取消',
            type: 'warning',
          })
        } catch (err) {
          return
        }
      }
      editorialLoading.value = true
      try {
        const result = await generateQuestionEditorialApi({
          title: formData.title.trim(),
          content: formData.content,
          defaultCode: formData.defaultCode,
          referenceCode: aiSolution.value || null,
        })
        if (result?.content) {
          formData.editorial = result.content
          ElMessage.success('题解草稿已填入，请检查后随题目一起保存')
        }
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        editorialLoading.value = false
      }
    }

    // 打开 AI 生成用例弹窗（需先有标题、描述、代码模板与 Main 函数；已有解法示例时作为标程）
    const openCaseDialog = () => {
      if (!ensureAiFields(CASE_FIELDS)) return
      const existingInputs = testCaseList.value
        .map(item => (item.judgeInput || '').trim())
        .filter(Boolean)
      caseDialogRef.value?.open({
        title: formData.title.trim(),
        content: formData.content,
        defaultCode: formData.defaultCode,
        mainFunc: formData.mainFunc,
        timeLimit: formData.timeLimit,
        spaceLimit: formData.spaceLimit,
        standardCode: aiSolution.value || null,
        existingInputs,
      }, MAX_CASES - testCaseList.value.length)
    }

    // 把 AI 生成的用例加入列表（只有一组空白用例时直接替换它）
    const appendAiCases = (cases) => {
      const onlyBlank = testCaseList.value.length === 1
        && !['displayInput', 'displayOutput', 'judgeInput', 'judgeOutput']
          .some(key => (testCaseList.value[0][key] || '').trim())
      const base = onlyBlank ? [] : testCaseList.value
      const room = MAX_CASES - base.length
      const added = cases.slice(0, room)
      testCaseList.value = [...base, ...added]
      if (added.length < cases.length) {
        ElMessage.warning(`已达 ${MAX_CASES} 组上限，只加入了 ${added.length} 组`)
      } else {
        ElMessage.success('已加入')
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
      if (!testCaseList.value.some(item => item.isSample === CASE_TYPE.SAMPLE)) {
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
              tagIds: formData.tagIds,
              editorial: formData.editorial,
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
              tagIds: formData.tagIds,
              editorial: formData.editorial,
            }
            await editQuestionApi(editPayload)
            ElMessage.success('修改题目成功')
            visible.value = false
            emit('success', 'edit')
          }
        } catch (err) {
          // 错误提示已由请求拦截器统一给出
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
      draftDialogRef,
      caseDialogRef,
      aiSolution,
      solutionLoading,
      MAX_CASES,
      CASE_TYPE,
      handleAddTestCase,
      handleRemoveTestCase,
      openDraftDialog,
      applyDraft,
      openCaseDialog,
      appendAiCases,
      generateSolution,
      rememberSolution,
      editorialLoading,
      generateEditorial,
      open,
      handleSubmit,
      handleBeforeClose,
      handleClose,
    }
  },
})
