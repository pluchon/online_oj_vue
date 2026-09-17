// C端题目检索与列表相关 API
import request from '@/utils/request'

// 分页检索题目列表（支持关键字、难度与分页）
export function getQuestionListApi(params) {
  return request({
    url: '/friend/question/list',
    method: 'get',
    params
  })
}

// 查询题目详情
export function getQuestionDetailApi(questionId) {
  return request({
    url: '/friend/question/detail',
    method: 'get',
    params: { questionId }
  })
}

// 同步MySQL题目至ES索引
export function syncQuestionsApi() {
  return request({
    url: '/friend/question/sync',
    method: 'post'
  })
}
