// C端题目检索与列表相关 API
import request from '@/utils/request'

// 分页检索题目列表（支持关键字、难度、标签、做题状态与分页）
export function getQuestionListApi(params) {
  return request({
    url: '/friend/question',
    method: 'get',
    params
  })
}

// 查询全部题目标签（按分类排序，题库筛选用）
export function getQuestionTagsApi() {
  return request({
    url: '/friend/question/tags',
    method: 'get'
  })
}

// 题库总题数与当前用户已攻克、尝试中题数
export function getQuestionStatsApi() {
  return request({
    url: '/friend/question/stats',
    method: 'get'
  })
}

// 查询题目详情
export function getQuestionDetailApi(questionId) {
  return request({
    url: `/friend/question/${questionId}`,
    method: 'get'
  })
}

// 获取上一题与下一题导航（examId 可选，传入时按竞赛题目顺序）
export function getQuestionPreAndNextApi(params) {
  const { questionId, ...rest } = params
  return request({
    url: `/friend/question/${questionId}/neighbors`,
    method: 'get',
    params: rest
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
  const { questionId, ...body } = data
  return request({
    url: `/friend/question/${questionId}/submissions`,
    method: 'post',
    data: body
  })
}

// 运行公开示例用例（同步返回逐用例结果，编译与排队耗时较长）
export function runQuestionApi(data) {
  const { questionId, ...body } = data
  return request({
    url: `/friend/question/${questionId}/run`,
    method: 'post',
    data: body,
    timeout: 20000
  })
}

// 分页查询本人本题提交记录
export function getSubmitHistoryApi(params) {
  const { questionId, ...pageParams } = params
  return request({
    url: `/friend/question/${questionId}/submissions`,
    method: 'get',
    params: pageParams
  })
}

// 查询本人在本题保存的代码草稿（没有时返回空）
export function getCodeDraftApi(questionId) {
  return request({
    url: `/friend/question/${questionId}/draft`,
    method: 'get'
  })
}

// 保存本人在本题的代码草稿（跨设备，保存即覆盖）
export function saveCodeDraftApi(questionId, code) {
  return request({
    url: `/friend/question/${questionId}/draft`,
    method: 'put',
    data: { code }
  })
}

// 查询判题最新结果
export function getSubmitResultApi(submitId) {
  return request({
    url: `/friend/question/submissions/${submitId}`,
    method: 'get'
  })
}

// 相似题推荐（需登录，排除当前题与已通过的题）
export function getSimilarQuestionsApi(questionId) {
  return request({
    url: `/friend/question/${questionId}/similar`,
    method: 'get'
  })
}
