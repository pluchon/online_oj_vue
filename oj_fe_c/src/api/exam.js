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
