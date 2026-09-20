// 沉浸式题目答题工作台业务交互逻辑
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Document,
  Check,
  Monitor,
  Loading
} from '@element-plus/icons-vue'
import CodeEditor from '@/components/CodeEditor'
import { getToken } from '@/utils/auth'
import {
  getQuestionDetailApi,
  getQuestionPreAndNextApi,
  getFirstQuestionApi,
  submitQuestionApi,
  getSubmitResultApi
} from '@/api/question'

export default {
  name: 'QuestionDo',
  components: {
    CodeEditor,
    ArrowLeft,
    ArrowRight,
    Document,
    Check,
    Monitor,
    Loading
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 页面状态标识
    const pageLoading = ref(false)
    const navLoading = ref(false)
    const submitting = ref(false)

    // 题目数据与上下题导航ID
    const question = ref(null)
    const preQuestionId = ref(null)
    const nextQuestionId = ref(null)

    // 代码编辑器状态
    const userCode = ref('')
    const currentLanguage = ref('java')

    // 评测提交结果
    const submitResult = ref(null)

    // 竞赛元数据
    const examTitle = ref('')

    // 计算属性：是否处于竞赛模式
    const isExamMode = computed(() => !!route.query.examId)
    const currentExamId = computed(() => (route.query.examId ? String(route.query.examId) : null))

    // 控制台当前激活Tab：'case'（测试用例）或 'result'（执行结果）
    const activeConsoleTab = ref('case')

    // 当前选中的测试用例索引
    const activeCaseIndex = ref(0)

    // 解析后的测试用例列表
    const parsedTestCases = computed(() => {
      const raw = question.value?.questionCase
      if (!raw) return []
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => ({
            index: idx + 1,
            input: typeof item === 'object' && item !== null ? (item.input ?? JSON.stringify(item)) : String(item),
            output: typeof item === 'object' && item !== null ? (item.output ?? '') : ''
          }))
        }
        return [{ index: 1, input: String(raw), output: '' }]
      } catch (e) {
        return [{ index: 1, input: String(raw), output: '' }]
      }
    })

    // 当前选中的测试用例项
    const currentCase = computed(() => {
      if (!parsedTestCases.value.length) return null
      return parsedTestCases.value[activeCaseIndex.value] || parsedTestCases.value[0]
    })

    // 难度文本映射辅助函数
    const getDiffText = (difficulty) => {
      const map = { 1: '简单', 2: '中等', 3: '困难' }
      return map[difficulty] || '未知'
    }

    // 加载指定题目详情与代码模板
    const loadQuestionDetail = async (questionId) => {
      if (!questionId) return
      pageLoading.value = true
      try {
        const res = await getQuestionDetailApi(questionId)
        const data = res && res.data ? res.data : res
        if (data && (data.questionId || data.title)) {
          question.value = data
          // 首次填充题目的默认代码模板
          userCode.value = data.defaultCode || ''
          submitResult.value = null
          activeCaseIndex.value = 0
        } else {
          ElMessage.error((res && res.msg) || '获取题目详情失败')
        }
      } catch (err) {
        ElMessage.error('加载题目失败，请稍后重试')
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
        const res = await getQuestionPreAndNextApi(params)
        const data = res && res.data ? res.data : res
        if (data && typeof data === 'object') {
          preQuestionId.value = data.preQuestionId || null
          nextQuestionId.value = data.nextQuestionId || null
        } else {
          preQuestionId.value = null
          nextQuestionId.value = null
        }
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
      // 更新 URL 参数保持刷新一致性
      const query = { ...route.query, questionId: targetQuestionId }
      await router.replace({ path: '/question/do', query })
      // 重新拉取题面与导航数据
      await loadQuestionDetail(targetQuestionId)
      await loadPreAndNext(targetQuestionId, currentExamId.value)
    }

    // 上一题点击
    const handlePreQuestion = () => {
      if (preQuestionId.value) {
        switchQuestion(preQuestionId.value)
      }
    }

    // 下一题点击
    const handleNextQuestion = () => {
      if (nextQuestionId.value) {
        switchQuestion(nextQuestionId.value)
      }
    }

    // 重置代码为初始默认模板
    const handleResetCode = () => {
      if (!question.value) return
      ElMessageBox.confirm(
        '确定要恢复为题目的初始默认代码模板吗？当前编辑的内容将被覆盖。',
        '重置代码提示',
        {
          confirmButtonText: '确定重置',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        userCode.value = question.value.defaultCode || ''
        ElMessage.success('代码模板已重置')
      }).catch(() => {})
    }

    // 提交代码评测（MOCK评测）
    const handleSubmit = async () => {
      if (!question.value || !question.value.questionId) {
        ElMessage.warning('题目尚未加载完成')
        return
      }
      if (!userCode.value || !userCode.value.trim()) {
        ElMessage.warning('请先编写代码再提交！')
        return
      }

      // 受保护操作：UI前置检查登录态
      if (!getToken()) {
        ElMessageBox.confirm(
          '提交代码评测需要登录账号，是否立即前往登录？',
          '提示',
          {
            confirmButtonText: '前往登录',
            cancelButtonText: '稍后再说',
            type: 'warning'
          }
        ).then(() => {
          router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
        }).catch(() => {})
        return
      }

      submitting.value = true
      activeConsoleTab.value = 'result'
      try {
        // 语言类型枚举：0: java, 1: cpp
        const progType = currentLanguage.value === 'cpp' || currentLanguage.value === 'c' ? 1 : 0
        const payload = {
          questionId: question.value.questionId,
          examId: currentExamId.value || null,
          programType: progType,
          userCode: userCode.value
        }

        const res = await submitQuestionApi(payload)
        const resultData = res && res.data ? res.data : res
        if (resultData && (resultData.submitId || resultData.pass !== undefined)) {
          submitResult.value = resultData

          // 若后端处于评测中 (pass === 2)，启动智能微轮询获取最终结果（最长15秒，每400ms轮询一次）
          if (resultData.pass === 2 && resultData.submitId) {
            let maxRetries = 35
            while (maxRetries-- > 0 && submitResult.value.pass === 2) {
              await new Promise(resolve => setTimeout(resolve, 400))
              try {
                const pollRes = await getSubmitResultApi(resultData.submitId)
                const pollData = pollRes && pollRes.data ? pollRes.data : pollRes
                if (pollData && pollData.pass !== undefined) {
                  submitResult.value = pollData
                  if (pollData.pass !== 2) {
                    break
                  }
                }
              } catch (pollErr) {
                // 网络偶发抖动继续重试
              }
            }
          }

          if (submitResult.value.pass === 1) {
            ElMessage.success('恭喜，评测通过！')
          } else if (submitResult.value.pass === 0) {
            ElMessage.warning('评测未通过，请检查代码逻辑')
          } else {
            ElMessage.info('代码评测仍在后台容器队列中执行，可稍后刷新查看')
          }
        } else {
          ElMessage.error((res && res.msg) || '提交评测失败')
        }
      } catch (err) {
        ElMessage.error(err.message || '代码提交失败，请检查是否已登录')
      } finally {
        submitting.value = false
      }
    }

    // 返回导航
    const handleBack = () => {
      if (isExamMode.value) {
        router.push('/exam')
      } else {
        router.push('/question')
      }
    }

    // 页面初始化入口
    const initPage = async () => {
      let targetQId = route.query.questionId

      // 若处于竞赛模式且未指定 questionId，通过首题接口获取第一题
      if (!targetQId && currentExamId.value) {
        pageLoading.value = true
        try {
          const firstRes = await getFirstQuestionApi({ examId: currentExamId.value })
          const firstData = firstRes && firstRes.data !== undefined ? firstRes.data : firstRes
          if (firstData) {
            targetQId = String(firstData)
            // 写入 URL
            await router.replace({
              path: '/question/do',
              query: { ...route.query, questionId: targetQId }
            })
          }
        } catch (e) {
          // 忽略容错
        } finally {
          pageLoading.value = false
        }
      }

      if (targetQId) {
        await loadQuestionDetail(targetQId)
        await loadPreAndNext(targetQId, currentExamId.value)
      } else {
        ElMessage.warning('缺少题目ID参数')
      }
    }

    onMounted(() => {
      initPage()
    })

    // 监听路由参数变动（处理浏览器前进后退）
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
      pageLoading,
      navLoading,
      submitting,
      question,
      preQuestionId,
      nextQuestionId,
      userCode,
      currentLanguage,
      submitResult,
      examTitle,
      isExamMode,
      getDiffText,
      handlePreQuestion,
      handleNextQuestion,
      handleResetCode,
      activeConsoleTab,
      activeCaseIndex,
      parsedTestCases,
      currentCase,
      handleSubmit,
      handleBack
    }
  }
}
