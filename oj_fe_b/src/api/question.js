// 题目管理相关 API 接口
import request from '@/utils/request'
import { AI_REQUEST_TIMEOUT_MS } from '@/constants'

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

// AI 根据一句话描述生成题面草稿（只回填表单，不保存）
export function generateQuestionDraftApi(data) {
  return request({
    url: '/system/question/ai/draft',
    method: 'post',
    data,
    timeout: AI_REQUEST_TIMEOUT_MS
  })
}

// AI 生成测试用例预览（预期输出由标程在判题沙箱中运行得到，不保存）
export function generateQuestionCasesApi(data) {
  return request({
    url: '/system/question/ai/cases',
    method: 'post',
    data,
    timeout: AI_REQUEST_TIMEOUT_MS
  })
}

// 删除题目接口
export function deleteQuestionApi(questionId) {
  return request({
    url: `/system/question/${questionId}`,
    method: 'delete'
  })
}
