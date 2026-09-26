// 提交详情弹窗逻辑（代码、逐用例结果、执行回显与首个未通过用例）
import { defineComponent, ref, computed } from 'vue'
import { getSubmitDetailApi } from '@/api/submit'
import { SUBMIT_PASS } from '@/constants'
import { isJudging, verdictLabel as toVerdictLabel, verdictClass as toVerdictClass } from '@/utils/submitVerdict'
import OjDialog from '@/components/OjDialog'
import OjEmpty from '@/components/OjEmpty'
import CodeEditor from '@/components/CodeEditor'

// 逐用例状态串字符含义（后端 caseStates：1 通过 0 未通过 - 未执行）
const CASE_STATE_TEXT = {
  1: '通过',
  0: '未通过',
  '-': '未执行'
}

// 逐用例状态对应样式
const CASE_STATE_CLASS = {
  1: 'pass',
  0: 'fail',
  '-': 'skipped'
}

export default defineComponent({
  name: 'SubmitDetailDialog',
  components: {
    OjDialog,
    OjEmpty,
    CodeEditor,
  },
  setup() {
    // 弹窗可见性
    const visible = ref(false)

    // 加载状态
    const loading = ref(false)

    // 加载是否失败
    const loadError = ref(false)

    // 提交详情
    const detail = ref(null)

    // 本次打开的请求序号（快速切换时丢弃过期响应）
    let requestSeq = 0

    // 是否评测中
    const judging = computed(() => isJudging(detail.value))

    // 结论文案与颜色
    const verdictLabel = computed(() => toVerdictLabel(detail.value))
    const verdictClass = computed(() => toVerdictClass(detail.value))

    // 逐用例状态拆成数组
    const caseStates = computed(() => (judging.value || !detail.value?.caseStates ? [] : detail.value.caseStates.split('')))

    // 是否展示首个未通过用例
    const hasFailCase = computed(() => !judging.value && detail.value?.pass === SUBMIT_PASS.NOT_PASS
      && (detail.value.failCaseInput != null || detail.value.failOutput != null))

    // 打开弹窗并加载详情
    const open = async (submitId) => {
      const seq = ++requestSeq
      visible.value = true
      loading.value = true
      loadError.value = false
      detail.value = null
      try {
        const res = await getSubmitDetailApi(submitId)
        if (seq !== requestSeq) return
        detail.value = res
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        if (seq === requestSeq) loadError.value = true
      } finally {
        if (seq === requestSeq) loading.value = false
      }
    }

    return {
      CASE_STATE_TEXT,
      CASE_STATE_CLASS,
      visible,
      loading,
      loadError,
      detail,
      judging,
      verdictLabel,
      verdictClass,
      caseStates,
      hasFailCase,
      open,
    }
  },
})
