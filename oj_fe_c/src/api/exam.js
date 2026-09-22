// C 端竞赛相关接口
import request from '@/utils/request'

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
