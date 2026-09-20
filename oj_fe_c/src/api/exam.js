// C端竞赛相关 API
import request from '@/utils/request'

/**
 * 分页查询竞赛列表（通用）
 * @param {Object} params - { pageNum, pageSize, type, title, startTime, endTime }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getExamListApi(params) {
  return request({
    url: '/friend/exam/list',
    method: 'get',
    params
  })
}

/**
 * 分页查询未完赛竞赛列表
 * @param {Object} params - { pageNum, pageSize, title, startTime, endTime }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getUnfinishExamListApi(params) {
  return request({
    url: '/friend/exam/unfinish/list',
    method: 'get',
    params
  })
}

/**
 * 分页查询历史竞赛列表
 * @param {Object} params - { pageNum, pageSize, title, startTime, endTime }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getHistoryExamListApi(params) {
  return request({
    url: '/friend/exam/history/list',
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
    url: '/friend/exam/enroll',
    method: 'post',
    data
  })
}

/**
 * 分页查询当前用户已报名的竞赛列表
 * @param {Object} params - { pageNum, pageSize }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getMyExamListApi(params) {
  return request({
    url: '/friend/exam/my/list',
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
    url: '/friend/exam/detail',
    method: 'get',
    params
  })
}

/**
 * 分页查询指定竞赛的选手排名榜单
 * @param {Object} params - { examId, pageNum, pageSize }
 * @returns {Promise} { rows: Array, total: Number }
 */
export function getExamRankListApi(params) {
  return request({
    url: '/friend/exam/rank/list',
    method: 'get',
    params
  })
}

/**
 * 获取当前登录用户在指定竞赛中的成绩与排名
 * @param {Object} params - { examId }
 * @returns {Promise}
 */
export function getMyExamRankApi(params) {
  return request({
    url: '/friend/exam/rank/my',
    method: 'get',
    params
  })
}

