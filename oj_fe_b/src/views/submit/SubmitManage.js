// 提交管理业务逻辑（查看学员提交、按题重判）
import { defineComponent, ref, reactive, h, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, RefreshRight } from '@element-plus/icons-vue'
import { getSubmitListApi, getRejudgePreviewApi, rejudgeQuestionApi } from '@/api/submit'
import { getQuestionListApi } from '@/api/question'
import { getExamListApi } from '@/api/exam'
import {
  JUDGE_STATUS_OPTIONS,
  SUBMIT_PASS,
  SUBMIT_SOURCE_PRACTICE,
  PAGE_SIZE,
} from '@/constants'
import Pagination from '@/components/Pagination'
import OjEmpty from '@/components/OjEmpty'
import SubmitDetailDialog from './components/SubmitDetailDialog'

// 结论筛选里「评测中」选项的取值（其余选项为判题结论编码）
const VERDICT_JUDGING = 'judging'

// 远程搜索下拉每次取回的条数
const REMOTE_OPTION_SIZE = 20

export default defineComponent({
  name: 'SubmitManage',
  components: {
    Search,
    Refresh,
    RefreshRight,
    Pagination,
    OjEmpty,
    SubmitDetailDialog,
  },
  setup() {
    // 表格加载状态
    const loading = ref(false)

    // 最近一次加载是否失败（区分空数据与加载失败）
    const loadError = ref(false)

    // 提交记录列表
    const submitList = ref([])

    // 数据总条数
    const total = ref(0)

    // 当前列表实际使用的题目筛选（重判按它进行）
    const appliedQuestionId = ref('')

    // 重判进行中（预览与投递期间禁用按钮）
    const rejudging = ref(false)

    // 题目与竞赛下拉选项
    const questionOptions = ref([])
    const questionSearching = ref(false)
    const examOptions = ref([])
    const examSearching = ref(false)

    // 详情弹窗引用
    const detailDialogRef = ref(null)

    // 查询条件（verdict 与 source 在请求前转换为后端参数）
    const queryParams = reactive({
      questionId: '',
      nickName: '',
      verdict: '',
      source: '',
      pageNum: 1,
      pageSize: PAGE_SIZE,
    })

    // 把界面筛选条件转换为接口参数
    const buildParams = () => {
      const params = {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
      }
      if (queryParams.questionId) {
        params.questionId = queryParams.questionId
      }
      if (queryParams.nickName && queryParams.nickName.trim()) {
        params.nickName = queryParams.nickName.trim()
      }
      if (queryParams.verdict === VERDICT_JUDGING) {
        params.judging = true
      } else if (queryParams.verdict !== '' && queryParams.verdict != null) {
        params.judgeStatus = queryParams.verdict
      }
      if (queryParams.source === SUBMIT_SOURCE_PRACTICE) {
        params.practiceOnly = true
      } else if (queryParams.source) {
        params.examId = queryParams.source
      }
      return params
    }

    // 加载提交记录分页列表
    const loadSubmitList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const res = await getSubmitListApi(buildParams())
        submitList.value = res.rows
        total.value = res.total
        appliedQuestionId.value = queryParams.questionId || ''
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        submitList.value = []
        total.value = 0
        appliedQuestionId.value = ''
      } finally {
        loading.value = false
      }
    }

    // 保留已选中的选项，避免远程搜索换了一批结果后下拉框只显示ID
    const keepSelected = (list, oldList, key, selectedValue) => {
      if (!selectedValue || list.some((item) => item[key] === selectedValue)) return list
      const selected = oldList.find((item) => item[key] === selectedValue)
      return selected ? [selected, ...list] : list
    }

    // 按标题远程搜索题目
    const searchQuestions = async (keyword) => {
      questionSearching.value = true
      try {
        const params = { pageNum: 1, pageSize: REMOTE_OPTION_SIZE }
        if (keyword && keyword.trim()) {
          params.title = keyword.trim()
        }
        const res = await getQuestionListApi(params)
        const list = res.rows.map((item) => ({ questionId: item.questionId, title: item.title }))
        questionOptions.value = keepSelected(list, questionOptions.value, 'questionId', queryParams.questionId)
      } catch (err) {
        questionOptions.value = []
      } finally {
        questionSearching.value = false
      }
    }

    // 按标题远程搜索竞赛
    const searchExams = async (keyword) => {
      examSearching.value = true
      try {
        const params = { pageNum: 1, pageSize: REMOTE_OPTION_SIZE }
        if (keyword && keyword.trim()) {
          params.title = keyword.trim()
        }
        const res = await getExamListApi(params)
        const list = res.rows.map((item) => ({ examId: item.examId, title: item.title }))
        examOptions.value = keepSelected(list, examOptions.value, 'examId', queryParams.source)
      } catch (err) {
        examOptions.value = []
      } finally {
        examSearching.value = false
      }
    }

    // 首次展开来源下拉时加载最近的竞赛
    const handleSourceVisible = (visible) => {
      if (visible && !examOptions.value.length && !examSearching.value) {
        searchExams('')
      }
    }

    // 搜索
    const handleSearch = () => {
      queryParams.pageNum = 1
      loadSubmitList()
    }

    // 重置筛选条件
    const handleReset = () => {
      queryParams.questionId = ''
      queryParams.nickName = ''
      queryParams.verdict = ''
      queryParams.source = ''
      queryParams.pageNum = 1
      loadSubmitList()
    }

    // 是否评测中
    const isJudging = (row) => row.pass === SUBMIT_PASS.JUDGING

    // 结论文案
    const verdictLabel = (row) => {
      if (isJudging(row)) return '评测中'
      return JUDGE_STATUS_OPTIONS.find((item) => item.value === row.judgeStatus)?.label || '-'
    }

    // 结论颜色
    const verdictClass = (row) => {
      if (isJudging(row)) return 'verdict-judging'
      const tone = JUDGE_STATUS_OPTIONS.find((item) => item.value === row.judgeStatus)?.tone
      return tone ? `verdict-${tone}` : 'verdict-muted'
    }

    // 打开提交详情
    const openDetail = (row) => {
      detailDialogRef.value?.open(row.submitId)
    }

    // 组装重判确认框内容：会重判多少条、涉及哪些竞赛、跳过哪些
    const buildRejudgeMessage = (title, preview) => {
      const lines = [
        h('p', { class: 'rejudge-line' }, [
          '将按当前用例重判「',
          h('strong', title),
          `」的 ${preview.rejudgeCount} 条提交：`,
        ]),
        h('ul', { class: 'rejudge-list' }, [
          h('li', `练习提交 ${preview.practiceCount} 条`),
          ...preview.exams.map((exam) => h('li', `竞赛「${exam.title}」${exam.count} 条（${exam.finished ? '已结束、待结算' : '进行中'}）`)),
        ]),
      ]
      const skipped = []
      if (preview.settledCount > 0) {
        skipped.push(`已结算竞赛里的 ${preview.settledCount} 条（排名已公布，保持不变）`)
      }
      if (preview.judgingCount > 0) {
        skipped.push(`正在评测的 ${preview.judgingCount} 条`)
      }
      if (skipped.length) {
        lines.push(h('p', { class: 'rejudge-line rejudge-skip' }, `跳过：${skipped.join('；')}。`))
      }
      lines.push(h('p', { class: 'rejudge-line rejudge-tip' }, '重判期间这些提交显示为评测中，学员的做题状态和未结算竞赛的成绩会按新结论更新。'))
      return h('div', { class: 'rejudge-confirm' }, lines)
    }

    // 按题重判：先预览影响范围，确认后投递，投递期间确认按钮保持加载
    const handleRejudge = async () => {
      const questionId = appliedQuestionId.value
      if (!questionId || rejudging.value) return
      rejudging.value = true
      let preview
      try {
        preview = await getRejudgePreviewApi(questionId)
      } catch (err) {
        rejudging.value = false
        return
      }
      const title = questionOptions.value.find((item) => item.questionId === questionId)?.title
        || submitList.value[0]?.questionTitle
        || '该题'
      if (!preview.rejudgeCount) {
        rejudging.value = false
        ElMessage.info(preview.judgingCount > 0 ? '这道题的提交都在评测中，稍后再试' : '这道题没有可重判的提交')
        return
      }
      try {
        await ElMessageBox.confirm(buildRejudgeMessage(title, preview), '重判确认', {
          confirmButtonText: '确定重判',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'rejudge-message-box',
          beforeClose: async (action, instance, done) => {
            if (action !== 'confirm') {
              done()
              return
            }
            instance.confirmButtonLoading = true
            instance.showCancelButton = false
            try {
              const queued = await rejudgeQuestionApi(questionId)
              ElMessage.success(`已重新投递 ${queued} 条提交，结论出来后点搜索即可看到`)
              loadSubmitList()
            } catch (err) {
              // 错误提示已由请求拦截器统一给出；部分已投递的提交会正常判完
              loadSubmitList()
            } finally {
              instance.confirmButtonLoading = false
              done()
            }
          },
        })
      } catch (err) {
        // 取消重判
      } finally {
        rejudging.value = false
      }
    }

    onMounted(() => {
      loadSubmitList()
      searchQuestions('')
    })

    return {
      VERDICT_JUDGING,
      SUBMIT_SOURCE_PRACTICE,
      JUDGE_STATUS_OPTIONS,
      loading,
      loadError,
      submitList,
      total,
      queryParams,
      appliedQuestionId,
      rejudging,
      questionOptions,
      questionSearching,
      examOptions,
      examSearching,
      detailDialogRef,
      loadSubmitList,
      searchQuestions,
      searchExams,
      handleSourceVisible,
      handleSearch,
      handleReset,
      isJudging,
      verdictLabel,
      verdictClass,
      openDetail,
      handleRejudge,
    }
  },
})
