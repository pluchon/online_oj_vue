// 申诉展示：列表与详情弹窗共用的状态、结论文案与配色
import { APPEAL_STATUS, APPEAL_STATUS_OPTIONS, JUDGE_STATUS_OPTIONS } from '@/constants'

// 申诉状态的文案与配色（tone：pending / warn / pass / fail）
export function appealStatusOf(status) {
  return APPEAL_STATUS_OPTIONS.find((item) => item.value === status) || { label: '-', tone: 'muted' }
}

// 判题结论的文案与配色（tone：pass / fail / warn / muted）
export function judgeStatusOf(code) {
  return JUDGE_STATUS_OPTIONS.find((item) => item.value === code) || { label: '-', tone: 'muted' }
}

// 申诉是否已是终态（通过、不通过后不能再裁定）
export function isAppealFinal(status) {
  return status === APPEAL_STATUS.UPHELD || status === APPEAL_STATUS.REJECTED
}
