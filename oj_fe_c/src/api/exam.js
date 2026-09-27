// C 端竞赛相关接口
import request from '@/utils/request'
import { EXAM_REVIEW_TIMEOUT_MS } from '@/constants'

// 分页查询竞赛列表（type：0 未完赛、1 历史竞赛，不传为全部）
export function getExamListApi(params) {
  return request({
    url: '/friend/exam',
    method: 'get',
    params
  })
}

// 分页查询当前用户已报名的竞赛
export function getMyExamListApi(params) {
  return request({
    url: '/friend/exam/mine',
    method: 'get',
    params
  })
}

// 竞赛状态统计（mine 为 true 时只统计已报名的竞赛；不受列表筛选影响）
export function getExamStatsApi(mine) {
  return request({
    url: '/friend/exam/stats',
    method: 'get',
    params: { mine }
  })
}

// 查询竞赛详情
export function getExamDetailApi(examId) {
  return request({
    url: `/friend/exam/${examId}`,
    method: 'get'
  })
}

// 报名竞赛
export function enrollExamApi(examId) {
  return request({
    url: `/friend/exam/${examId}/enrollment`,
    method: 'post'
  })
}

// 分页查询竞赛排名（竞赛结束后公布）
export function getExamRankListApi(params) {
  const { examId, ...pageParams } = params
  return request({
    url: `/friend/exam/${examId}/rank`,
    method: 'get',
    params: pageParams
  })
}

// 查询本人这场的赛后复盘（还没生成或已失效时为空）
export function getExamReviewApi(examId) {
  return request({
    url: `/friend/exam/${examId}/review`,
    method: 'get'
  })
}

// 生成本人这场的赛后复盘（调用 AI，耗时较长）
export function generateExamReviewApi(examId) {
  return request({
    url: `/friend/exam/${examId}/review`,
    method: 'post',
    timeout: EXAM_REVIEW_TIMEOUT_MS
  })
}

// 重新生成本人这场的赛后复盘（每场最多 3 次）
export function regenerateExamReviewApi(examId) {
  return request({
    url: `/friend/exam/${examId}/review/regeneration`,
    method: 'post',
    timeout: EXAM_REVIEW_TIMEOUT_MS
  })
}
