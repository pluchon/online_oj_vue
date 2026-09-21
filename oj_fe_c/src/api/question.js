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

// 获取上一题与下一题导航
export function getQuestionPreAndNextApi(params) {
  return request({
    url: '/friend/question/preAndNext',
    method: 'get',
    params
  })
}

// 获取首道题目ID
export function getFirstQuestionApi(params) {
  return request({
    url: '/friend/question/first',
    method: 'get',
    params
  })
}

// 提交代码进行评测（异步消息队列判题）
export function submitQuestionApi(data) {
  return request({
    url: '/friend/question/submit',
    method: 'post',
    data
  })
}

// 运行公开示例用例（同步返回逐用例结果，编译与排队耗时较长）
export function runQuestionApi(data) {
  return request({
    url: '/friend/question/run',
    method: 'post',
    data,
    timeout: 20000
  })
}

// 分页查询本人本题提交记录
export function getSubmitHistoryApi(params) {
  return request({
    url: '/friend/question/submit/history',
    method: 'get',
    params
  })
}

// 查询判题最新结果
export function getSubmitResultApi(submitId) {
  return request({
    url: '/friend/question/submit/result',
    method: 'get',
    params: { submitId }
  })
}


