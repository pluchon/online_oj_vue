// 竞赛管理相关 API 接口
import request from '@/utils/request'
import { AI_REQUEST_TIMEOUT_MS } from '@/constants'

// 分页查询竞赛列表（支持标题与时间范围过滤）
export function getExamListApi(params = {}) {
  return request({
    url: '/system/exam',
    method: 'get',
    params
  })
}

// 新增竞赛基本信息（返回生成的竞赛ID）
export function addExamApi(data) {
  return request({
    url: '/system/exam',
    method: 'post',
    data
  })
}

// AI 帮建竞赛：根据描述、难度倾向与题目数量生成竞赛名称和题目（只返回结果，不保存）
export function generateExamPlanApi(data) {
  return request({
    url: '/system/exam/ai/plan',
    method: 'post',
    data,
    timeout: AI_REQUEST_TIMEOUT_MS
  })
}

// 获取竞赛详情
export function getExamDetailApi(examId) {
  return request({
    url: `/system/exam/${examId}`,
    method: 'get'
  })
}

// 编辑竞赛基本信息
export function editExamApi(data) {
  return request({
    url: `/system/exam/${data.examId}`,
    method: 'put',
    data
  })
}

// 删除竞赛
export function deleteExamApi(examId) {
  return request({
    url: `/system/exam/${examId}`,
    method: 'delete'
  })
}

// 发布竞赛
export function publishExamApi(examId) {
  return request({
    url: `/system/exam/${examId}/publish`,
    method: 'put'
  })
}

// 撤销发布竞赛
export function cancelPublishExamApi(examId) {
  return request({
    url: `/system/exam/${examId}/publish`,
    method: 'delete'
  })
}

// 绑定题目到竞赛
export function addExamQuestionApi(data) {
  return request({
    url: `/system/exam/${data.examId}/questions`,
    method: 'post',
    data: { questionIds: data.questionIds }
  })
}

// 查询竞赛关联题目列表
export function getExamQuestionListApi(examId) {
  return request({
    url: `/system/exam/${examId}/questions`,
    method: 'get'
  })
}

// 移除竞赛关联题目
export function deleteExamQuestionApi(examId, questionId) {
  return request({
    url: `/system/exam/${examId}/questions/${questionId}`,
    method: 'delete'
  })
}
