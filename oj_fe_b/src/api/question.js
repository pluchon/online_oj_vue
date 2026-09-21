// 题目管理相关 API 接口
import request from '@/utils/request'

// 分页查询题目列表（支持难度与标题搜索过滤）
export function getQuestionListApi(params = {}) {
  return request({
    url: '/system/question',
    method: 'get',
    params
  })
}

// 新增题目接口
export function addQuestionApi(data) {
  return request({
    url: '/system/question',
    method: 'post',
    data
  })
}

// 获取题目详情接口
export function getQuestionDetailApi(questionId) {
  return request({
    url: `/system/question/${questionId}`,
    method: 'get'
  })
}

// 编辑题目接口
export function editQuestionApi(data) {
  return request({
    url: `/system/question/${data.questionId}`,
    method: 'put',
    data
  })
}

// 删除题目接口
export function deleteQuestionApi(questionId) {
  return request({
    url: `/system/question/${questionId}`,
    method: 'delete'
  })
}
