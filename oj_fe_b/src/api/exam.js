// 竞赛管理相关 API 接口
import request from '@/utils/request'

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
