// 提交申诉相关 API 接口
import request from '@/utils/request'
import { APPEAL_REVIEW_TIMEOUT_MS } from '@/constants'

// 今日 AI 初审与申诉剩余次数
export function getAppealQuotaApi() {
  return request({
    url: '/friend/appeal/quota',
    method: 'get'
  })
}

// 对一条未通过的提交发起 AI 初审（AI 认为可能判错时才能正式申诉）
export function reviewAppealApi(submitId) {
  return request({
    url: `/friend/appeal/review/${submitId}`,
    method: 'post',
    timeout: APPEAL_REVIEW_TIMEOUT_MS
  })
}

// 初审放行后提交正式申诉
export function createAppealApi(data) {
  return request({
    url: '/friend/appeal',
    method: 'post',
    data
  })
}
