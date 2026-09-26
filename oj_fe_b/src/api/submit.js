// 提交记录管理相关 API 接口
import request from '@/utils/request'

// 分页查询提交记录（按题目、用户昵称、判题结论、来源筛选）
export function getSubmitListApi(params = {}) {
  return request({
    url: '/system/submit',
    method: 'get',
    params
  })
}

// 查询提交详情（含代码与首个未通过用例）
export function getSubmitDetailApi(submitId) {
  return request({
    url: `/system/submit/${submitId}`,
    method: 'get'
  })
}

// 预览按题重判的影响范围
export function getRejudgePreviewApi(questionId) {
  return request({
    url: `/system/submit/rejudge/${questionId}`,
    method: 'get'
  })
}

// 按题重判，返回本次投递判题的条数
export function rejudgeQuestionApi(questionId) {
  return request({
    url: `/system/submit/rejudge/${questionId}`,
    method: 'post'
  })
}
