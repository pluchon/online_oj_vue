// C端竞赛相关 API
import request from '@/utils/request'

/**
 * 分页查询竞赛列表（type 为 0 未完赛、1 历史竞赛，不传为全部）
 * @param {Object} params - { pageNum, pageSize, type, title, startTime, endTime }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getExamListApi(params) {
  return request({
    url: '/friend/exam',
    method: 'get',
    params
  })
}

/**
 * 竞赛报名
 * @param {Object} data - { examId }
 * @returns {Promise}
 */
export function enrollExamApi(data) {
  return request({
    url: `/friend/exam/${data.examId}/enrollment`,
    method: 'post'
  })
}

/**
 * 分页查询当前用户已报名的竞赛列表
 * @param {Object} params - { pageNum, pageSize }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getMyExamListApi(params) {
  return request({
    url: '/friend/exam/mine',
    method: 'get',
    params
  })
}

/**
 * 查询指定竞赛详情
 * @param {Object} params - { examId }
 * @returns {Promise}
 */
export function getExamDetailApi(params) {
  return request({
    url: `/friend/exam/${params.examId}`,
    method: 'get'
  })
}

/**
 * 分页查询指定竞赛的选手排名榜单（竞赛结束后公布）
 * @param {Object} params - { examId, pageNum, pageSize }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getExamRankListApi(params) {
  const { examId, ...pageParams } = params
  return request({
    url: `/friend/exam/${examId}/rank`,
    method: 'get',
    params: pageParams
  })
}
