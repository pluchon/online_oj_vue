// 提交结论展示：列表与详情弹窗共用的判断、文案与配色
import { JUDGE_STATUS_OPTIONS, SUBMIT_PASS } from '@/constants'

// 是否评测中
export function isJudging(submit) {
  return submit?.pass === SUBMIT_PASS.JUDGING
}

// 结论文案（评测中优先，其次按判题结论）
export function verdictLabel(submit) {
  if (!submit) return '-'
  if (isJudging(submit)) return '评测中'
  return JUDGE_STATUS_OPTIONS.find((item) => item.value === submit.judgeStatus)?.label || '-'
}

// 结论配色样式名（verdict-pass / fail / warn / muted / judging）
export function verdictClass(submit) {
  if (isJudging(submit)) return 'verdict-judging'
  const tone = JUDGE_STATUS_OPTIONS.find((item) => item.value === submit?.judgeStatus)?.tone
  return tone ? `verdict-${tone}` : 'verdict-muted'
}
