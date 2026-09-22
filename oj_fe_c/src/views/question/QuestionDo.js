// 沉浸式学者答题工作台业务交互逻辑
import { defineComponent, ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Loading,
  Sunny,
  Moon,
  FullScreen,
  RefreshLeft,
  MagicStick,
  CaretRight,
  Upload,
  Timer,
  Coin
} from '@element-plus/icons-vue'
import AppNavbar from '@/components/AppNavbar'
import CodeEditor from '@/components/CodeEditor'
import OjDialog from '@/components/OjDialog'
import AiTutorPanel from '@/components/AiTutorPanel'
import submitSuccessImage from '@/assets/images/c_submit_success_background.png'
import { setPageTitle } from '@/utils/title'
import { renderMarkdown } from '@/utils/markdown'
import { useUserStore } from '@/store/user'
import {
  DIFFICULTY_OPTIONS,
  SUBMIT_PASS,
  JUDGE_STATUS_TEXT,
  JUDGE_STATUS_AC,
  JUDGE_STATUS_WA,
  PROGRAM_TYPE_JAVA,
  EXAM_CONTEST_STATUS
} from '@/constants'
import {
  getQuestionDetailApi,
  getQuestionPreAndNextApi,
  getFirstQuestionApi,
  submitQuestionApi,
  getSubmitResultApi,
  runQuestionApi,
  getSubmitHistoryApi,
  getSimilarQuestionsApi
} from '@/api/question'
import { getExamDetailApi } from '@/api/exam'

// 提交记录每页条数
const HISTORY_PAGE_SIZE = 6

// 评测结果轮询间隔（毫秒）与最大次数
const POLL_INTERVAL = 500
const POLL_MAX_TIMES = 40

export default defineComponent({
  name: 'QuestionDo',
  components: {
    AppNavbar,
    CodeEditor,
    OjDialog,
    AiTutorPanel,
    ArrowLeft,
    ArrowRight,
    Loading,
    Sunny,
    Moon,
    FullScreen,
    RefreshLeft,
    MagicStick,
    CaretRight,
    Upload,
    Timer,
    Coin
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { isLogin } = useUserStore()

    // 页面状态标识
    const pageLoading = ref(false)
    const navLoading = ref(false)
    const submitting = ref(false)
    const runningCase = ref(false)

    // 题目数据与上下题导航ID
    const question = ref(null)
    const preQuestionId = ref(null)
    const nextQuestionId = ref(null)

    // 代码编辑器状态与浅色学者主题控制
    const userCode = ref('')
    const editorTheme = ref('vs')
    const isEditorFullscreen = ref(false)
    const codeEditorRef = ref(null)

    // 最近一次运行或提交的结果（mode: run | submit）
    const lastResult = ref(null)
    const activeResultCaseIndex = ref(0)

    // 计算属性：是否处于竞赛模式
    const isExamMode = computed(() => !!route.query.examId)
    const currentExamId = computed(() => (route.query.examId ? String(route.query.examId) : null))

    // 竞赛信息（竞赛模式下加载）
    const examInfo = ref(null)
    const examNow = ref(Date.now())
    let examTimer = null

    // 竞赛结束时间戳
    const examEndTime = computed(() => {
      const end = examInfo.value?.endTime
      return end ? new Date(end).getTime() : 0
    })

    // 是否为赛中模式（进行中且计入排名），否则为赛后练习
    const isContestMode = computed(() => {
      if (!isExamMode.value || !examInfo.value) return false
      return examEndTime.value > 0 && examNow.value <= examEndTime.value
    })

    // 距竞赛结束的倒计时文本
    const countdownText = computed(() => {
      const remain = Math.max(0, Math.floor((examEndTime.value - examNow.value) / 1000))
      const h = String(Math.floor(remain / 3600)).padStart(2, '0')
      const m = String(Math.floor((remain % 3600) / 60)).padStart(2, '0')
      const s = String(remain % 60).padStart(2, '0')
      return `${h}:${m}:${s}`
    })

    // 停止倒计时
    const stopExamTimer = () => {
      if (examTimer) {
        clearInterval(examTimer)
        examTimer = null
      }
    }

    // 加载竞赛信息并校验进入资格（未开赛、赛中未报名不可进入，以后端 contestStatus 为准）
    const loadExamInfo = async () => {
      if (!currentExamId.value) return true
      try {
        const data = await getExamDetailApi(currentExamId.value)
        examInfo.value = data
        if (data.contestStatus === EXAM_CONTEST_STATUS.NOT_STARTED) {
          ElMessage.warning('竞赛尚未开始')
          router.replace('/exam')
          return false
        }
        const ongoing = data.contestStatus === EXAM_CONTEST_STATUS.ONGOING
        if (ongoing && !data.isEnter) {
          ElMessage.warning('您未报名该竞赛')
          router.replace('/exam')
          return false
        }
        examNow.value = Date.now()
        stopExamTimer()
        if (ongoing) {
          examTimer = setInterval(() => {
            examNow.value = Date.now()
            if (examNow.value > examEndTime.value) {
              stopExamTimer()
              ElMessage.info('竞赛已结束，后续提交不再计入排名')
            }
          }, 1000)
        }
        return true
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        router.replace('/exam')
        return false
      }
    }

    // AI 辅导卡片是否展开，以及提交完成后用于刷新其快捷操作的计数
    const tutorOpen = ref(false)
    const tutorRefreshKey = ref(0)

    // 读取编辑器当前代码（供 AI 辅导作为上下文）
    const getUserCode = () => userCode.value

    // 展开或收起 AI 辅导（需登录）
    const toggleTutor = () => {
      if (tutorOpen.value) {
        tutorOpen.value = false
        return
      }
      if (!isLogin.value) {
        openConfirm({
          title: '需要登录',
          content: '登录后才能使用 AI 辅导。',
          confirmText: '去登录',
          action: goToLogin
        })
        return
      }
      tutorOpen.value = true
    }

    // 控制台当前激活Tab：'case'（测试用例）或 'result'（执行结果）
    const activeConsoleTab = ref('case')

    // 当前选中的测试用例索引
    const activeCaseIndex = ref(0)

    // 切换编辑器主题
    const toggleEditorTheme = () => {
      editorTheme.value = editorTheme.value === 'vs' ? 'vs-dark' : 'vs'
    }

    // 切换编辑器全屏
    const toggleEditorFullscreen = () => {
      isEditorFullscreen.value = !isEditorFullscreen.value
    }

    // 通用确认弹窗状态
    const confirmDialog = reactive({
      visible: false,
      title: '',
      content: '',
      confirmText: '确定',
      action: null
    })

    // 打开确认弹窗
    const openConfirm = ({ title, content, confirmText = '确定', action }) => {
      confirmDialog.title = title
      confirmDialog.content = content
      confirmDialog.confirmText = confirmText
      confirmDialog.action = action
      confirmDialog.visible = true
    }

    // 确认弹窗主操作
    const handleConfirmDialog = () => {
      const action = confirmDialog.action
      confirmDialog.visible = false
      if (action) action()
    }

    // 判断示例是否过长需独占整行
    const isLongExample = (item) => {
      const text = `${item.input || ''}${item.output || ''}`
      return text.length > 48 || text.includes('\n')
    }

    // 格式化当前代码
    const handleFormatCode = () => {
      codeEditorRef.value?.formatCode()
    }

    // 切换控制台选项卡
    const toggleConsoleTab = (tab) => {
      activeConsoleTab.value = tab
    }

    // 公开示例用例列表（后端只返回公开示例）
    const parsedTestCases = computed(() => {
      const list = question.value?.sampleCases || []
      return list.map((item, idx) => ({
        index: idx + 1,
        input: item.input || '',
        output: item.output || ''
      }))
    })

    // 当前选中的测试用例项
    const currentCase = computed(() => {
      if (!parsedTestCases.value.length) return null
      return parsedTestCases.value[activeCaseIndex.value] || parsedTestCases.value[0]
    })

    // 题目描述（截取"示例 / 提示"之前的部分，按 Markdown 渲染并过滤脚本）
    const formattedDescriptionHtml = computed(() => {
      const raw = question.value?.content || ''
      const exampleIdx = raw.search(/示例\s*[1一]|Example\s*1|提示[\s:：]/i)
      return renderMarkdown(exampleIdx > -1 ? raw.slice(0, exampleIdx).trim() : raw)
    })

    // 结构化提取示例卡片数据（优先从描述中解析，回退使用测试用例）
    const displayExamples = computed(() => {
      const raw = question.value?.content || ''
      const examples = []

      // 正则尝试匹配：示例 1、输入、输出、解释
      const regex = /示例\s*(\d+)[\s:：]*([\s\S]*?)(?=示例\s*\d+|提示|$)/gi
      let match
      while ((match = regex.exec(raw)) !== null) {
        const block = match[2]
        const inputMatch = block.match(/输入[\s:：]*([^\n\r]*)/)
        const outputMatch = block.match(/输出[\s:：]*([^\n\r]*)/)
        const explainMatch = block.match(/解释[\s:：]*([^\n\r]*)/)

        if (inputMatch || outputMatch) {
          examples.push({
            input: inputMatch ? inputMatch[1].trim() : '',
            output: outputMatch ? outputMatch[1].trim() : '',
            explain: explainMatch ? explainMatch[1].trim() : ''
          })
        }
      }

      // 若成功解析出示例卡片，直接返回
      if (examples.length > 0) {
        return examples.slice(0, 4)
      }

      // 否则将测试用例适配为示例卡片
      return parsedTestCases.value.slice(0, 4).map(c => ({
        input: c.input,
        output: c.output,
        explain: ''
      }))
    })

    // 提取或预置题目约束与提示信息
    const displayHints = computed(() => {
      const raw = question.value?.content || ''
      const hintIdx = raw.search(/提示[\s:：]/)
      if (hintIdx > -1) {
        const hintPart = raw.slice(hintIdx).replace(/提示[\s:：]/, '').trim()
        const lines = hintPart
          .split('\n')
          .map(l => l.replace(/^[•\-\*\d\.]\s*/, '').trim())
          .filter(Boolean)
        if (lines.length > 0) {
          return lines
        }
      }

      return []
    })

    // 难度文案
    const getDiffText = (difficulty) => DIFFICULTY_OPTIONS.find((item) => item.value === Number(difficulty))?.label || '未知'

    // 相似题推荐（登录且非竞赛模式时加载，失败时不显示）
    const similarQuestions = ref([])
    const loadSimilarQuestions = async (questionId) => {
      similarQuestions.value = []
      if (!isLogin.value || isExamMode.value || !questionId) return
      try {
        const list = await getSimilarQuestionsApi(questionId)
        similarQuestions.value = Array.isArray(list) ? list : []
      } catch (err) {
        similarQuestions.value = []
      }
    }

    // 加载指定题目详情与代码模板
    const loadQuestionDetail = async (questionId) => {
      if (!questionId) return
      pageLoading.value = true
      try {
        const data = await getQuestionDetailApi(questionId)
        question.value = data
        setPageTitle(data.title || '做题')
        userCode.value = data.defaultCode || ''
        lastResult.value = null
        activeConsoleTab.value = 'case'
        hasSubmitted.value = false
        historyList.value = []
        historyTotal.value = 0
        activeCaseIndex.value = 0
        loadSimilarQuestions(data.questionId)
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        pageLoading.value = false
      }
    }

    // 加载当前题目的上一题与下一题导航信息
    const loadPreAndNext = async (questionId, examId) => {
      if (!questionId) return
      navLoading.value = true
      try {
        const params = { questionId }
        if (examId) {
          params.examId = examId
        }
        const data = await getQuestionPreAndNextApi(params)
        preQuestionId.value = data.preQuestionId || null
        nextQuestionId.value = data.nextQuestionId || null
      } catch (err) {
        preQuestionId.value = null
        nextQuestionId.value = null
      } finally {
        navLoading.value = false
      }
    }

    // 切换题目执行逻辑
    const switchQuestion = async (targetQuestionId) => {
      if (!targetQuestionId) return
      const query = { ...route.query, questionId: targetQuestionId }
      await router.replace({ path: '/question/do', query })
      await loadQuestionDetail(targetQuestionId)
      await loadPreAndNext(targetQuestionId, currentExamId.value)
    }

    const handlePreQuestion = () => {
      if (preQuestionId.value) {
        switchQuestion(preQuestionId.value)
      }
    }

    const handleNextQuestion = () => {
      if (nextQuestionId.value) {
        switchQuestion(nextQuestionId.value)
      }
    }

    // 重置代码为初始默认模板
    const handleResetCode = () => {
      if (!question.value) return
      openConfirm({
        title: '重置代码',
        content: '当前编辑的代码将被初始模板覆盖。',
        confirmText: '重置',
        action: () => {
          userCode.value = question.value.defaultCode || ''
        }
      })
    }

    // 受保护操作前置校验：题目已加载、代码非空、已登录
    const ensureCanJudge = (actionText) => {
      if (!question.value || !question.value.questionId) {
        ElMessage.warning('题目尚未加载完成')
        return false
      }
      if (!userCode.value || !userCode.value.trim()) {
        ElMessage.warning('请先编写代码')
        return false
      }
      if (!isLogin.value) {
        openConfirm({
          title: '需要登录',
          content: `登录后才能${actionText}代码。`,
          confirmText: '去登录',
          action: goToLogin
        })
        return false
      }
      return true
    }

    // 运行公开示例用例
    const handleRun = async () => {
      if (!ensureCanJudge('运行')) return

      runningCase.value = true
      activeConsoleTab.value = 'result'
      try {
        const data = await runQuestionApi({
          questionId: question.value.questionId,
          userCode: userCode.value
        })
        lastResult.value = { mode: 'run', data }
        const firstFail = (data.caseResults || []).findIndex(c => !c.pass)
        activeResultCaseIndex.value = firstFail > -1 ? firstFail : 0
      } catch (err) {
        // 错误提示已由请求拦截器统一处理
      } finally {
        runningCase.value = false
      }
    }

    // 提交代码进行全部用例评测
    const handleSubmit = async () => {
      if (!ensureCanJudge('提交')) return

      submitting.value = true
      activeConsoleTab.value = 'result'
      try {
        let data = await submitQuestionApi({
          questionId: question.value.questionId,
          examId: isContestMode.value ? currentExamId.value : null,
          programType: PROGRAM_TYPE_JAVA,
          userCode: userCode.value
        })

        // 评测中时轮询结果
        let retries = POLL_MAX_TIMES
        while (data.pass === SUBMIT_PASS.JUDGING && data.submitId && retries-- > 0) {
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
          try {
            data = await getSubmitResultApi(data.submitId)
          } catch (pollErr) {
            // 忽略偶发抖动，继续轮询
          }
        }
        lastResult.value = { mode: 'submit', data }
        hasSubmitted.value = true
        tutorRefreshKey.value++
        loadHistory(1)
      } catch (err) {
        // 错误提示已由请求拦截器统一处理
      } finally {
        submitting.value = false
      }
    }

    // 当前结果数据
    const resultData = computed(() => lastResult.value?.data || null)

    // 当前结果是否仍在评测中
    const isJudging = computed(() => resultData.value?.pass === SUBMIT_PASS.JUDGING && !resultData.value?.status)

    // 判题结论文案
    const verdictText = computed(() => {
      if (!resultData.value) return ''
      if (isJudging.value) return '评测中'
      return JUDGE_STATUS_TEXT[resultData.value.status] || (resultData.value.pass === SUBMIT_PASS.PASS ? '通过' : '未通过')
    })

    // 判题结论样式
    const verdictClass = computed(() => {
      if (!resultData.value) return ''
      if (isJudging.value) return 'judging'
      return resultData.value.status === JUDGE_STATUS_AC ? 'pass' : 'fail'
    })

    // 运行结果中可展示的逐用例列表（编译错误等无输出时为空）
    const runCaseResults = computed(() => {
      if (lastResult.value?.mode !== 'run') return []
      const list = resultData.value?.caseResults || []
      const hasOutput = list.some(c => c.actualOutput !== null && c.actualOutput !== undefined)
      return hasOutput || resultData.value?.status === JUDGE_STATUS_WA ? list : []
    })

    // 本题提交记录（后端分页）
    const historyList = ref([])
    const historyTotal = ref(0)
    const historyPage = ref(1)
    const historyLoading = ref(false)
    const historyError = ref(false)

    // 本题是否已在当前页面提交过（提交后才展示提交记录页签）
    const hasSubmitted = ref(false)

    // 分页加载本人本题提交记录（未登录不请求）
    const loadHistory = async (page = historyPage.value) => {
      historyPage.value = page
      if (!isLogin.value || !question.value?.questionId) {
        historyList.value = []
        historyTotal.value = 0
        return
      }
      historyLoading.value = true
      historyError.value = false
      try {
        const data = await getSubmitHistoryApi({
          questionId: question.value.questionId,
          pageNum: page,
          pageSize: HISTORY_PAGE_SIZE
        })
        historyList.value = data?.rows || []
        historyTotal.value = data?.total || 0
      } catch (err) {
        historyError.value = true
        historyList.value = []
        historyTotal.value = 0
      } finally {
        historyLoading.value = false
      }
    }

    // 翻页
    const handleHistoryPage = (page) => {
      loadHistory(page)
    }

    // 提交记录的结论文案与样式
    const historyVerdict = (item) => {
      if (item.pass === SUBMIT_PASS.JUDGING && !item.status) return { text: '评测中', cls: 'judging' }
      const passed = item.status ? item.status === JUDGE_STATUS_AC : item.pass === SUBMIT_PASS.PASS
      return {
        text: JUDGE_STATUS_TEXT[item.status] || (passed ? '通过' : '未通过'),
        cls: passed ? 'pass' : 'fail'
      }
    }

    // 提交时间简写为 月-日 时:分
    const formatHistoryTime = (time) => (time ? String(time).slice(5, 16) : '')

    // 将历史提交的代码载回编辑器
    const handleLoadHistoryCode = (item) => {
      if (!item.userCode) return
      openConfirm({
        title: '载入代码',
        content: '当前编辑的代码将被这次提交的代码覆盖。',
        confirmText: '载入',
        action: () => {
          userCode.value = item.userCode
        }
      })
    }

    // 提交结果的逐用例进度格（1: 通过 0: 未通过 -: 未执行）
    const caseCells = computed(() => {
      if (lastResult.value?.mode !== 'submit' || isJudging.value) return []
      const states = resultData.value?.caseStates || ''
      const cls = { 1: 'pass', 0: 'fail', '-': 'skip' }
      return states.split('').map(c => cls[c] || 'skip')
    })

    // 当前选中的运行结果用例
    const activeRunCase = computed(() => runCaseResults.value[activeResultCaseIndex.value] || null)

    const handleBack = () => {
      if (isExamMode.value) {
        router.push('/exam')
      } else {
        router.push('/question')
      }
    }

    // 跳转登录并带回跳地址
    const goToLogin = () => {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    }

    // 页面初始化入口
    const initPage = async () => {
      let targetQId = route.query.questionId

      if (!targetQId && currentExamId.value) {
        pageLoading.value = true
        try {
          const firstId = await getFirstQuestionApi({ examId: currentExamId.value })
          if (firstId && firstId !== true) {
            targetQId = String(firstId)
            await router.replace({
              path: '/question/do',
              query: { ...route.query, questionId: targetQId }
            })
          }
        } catch (e) {
          // 错误提示已由请求拦截器统一给出，下方按无题目处理
        } finally {
          pageLoading.value = false
        }
      }

      if (targetQId) {
        await loadQuestionDetail(targetQId)
        await loadPreAndNext(targetQId, currentExamId.value)
      } else if (isExamMode.value) {
        // 竞赛未绑定题目时回到竞赛列表
        ElMessage.warning('该竞赛暂无题目')
        router.replace('/exam')
      } else {
        // 缺少题目ID时回到题库
        router.replace('/question')
      }
    }

    onMounted(async () => {
      if (!(await loadExamInfo())) return
      initPage()
    })

    onBeforeUnmount(() => {
      stopExamTimer()
    })

    watch(
      () => route.query.questionId,
      (newId, oldId) => {
        if (newId && newId !== oldId && question.value?.questionId !== newId) {
          loadQuestionDetail(newId)
          loadPreAndNext(newId, currentExamId.value)
        }
      }
    )

    return {
      isLogin,
      pageLoading,
      navLoading,
      submitting,
      runningCase,
      question,
      preQuestionId,
      nextQuestionId,
      userCode,
      confirmDialog,
      handleConfirmDialog,
      isLongExample,
      editorTheme,
      isEditorFullscreen,
      toggleEditorTheme,
      toggleEditorFullscreen,
      codeEditorRef,
      handleFormatCode,
      toggleConsoleTab,
      lastResult,
      resultData,
      isJudging,
      verdictText,
      verdictClass,
      runCaseResults,
      activeRunCase,
      activeResultCaseIndex,
      historyList,
      historyTotal,
      historyPage,
      historyLoading,
      historyError,
      historyPageSize: HISTORY_PAGE_SIZE,
      handleHistoryPage,
      hasSubmitted,
      submitSuccessImage,
      loadHistory,
      historyVerdict,
      formatHistoryTime,
      handleLoadHistoryCode,
      caseCells,
      examInfo,
      isContestMode,
      countdownText,
      isExamMode,
      getDiffText,
      handlePreQuestion,
      handleNextQuestion,
      handleResetCode,
      activeConsoleTab,
      activeCaseIndex,
      parsedTestCases,
      currentCase,
      formattedDescriptionHtml,
      displayExamples,
      displayHints,
      handleRun,
      handleSubmit,
      handleBack,
      tutorOpen,
      tutorRefreshKey,
      currentExamId,
      similarQuestions,
      switchQuestion,
      getUserCode,
      toggleTutor
    }
  }
})
