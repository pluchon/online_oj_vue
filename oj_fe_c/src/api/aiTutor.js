// AI 做题辅导相关 API 接口
import request from '@/utils/request'
import { postEventStream } from '@/utils/sse'

// 查询本题的辅导会话（历史消息、今日剩余次数与快捷操作所需的提交状态）
export function getAiTutorSessionApi(questionId) {
  return request({
    url: `/friend/ai/tutor/${questionId}`,
    method: 'get'
  })
}

// 提问并以 SSE 接收回复（delta 增量文本、done 结束、error 失败）
export function askAiTutorStreamApi(questionId, data, options) {
  return postEventStream(`/friend/ai/tutor/${questionId}/chat`, data, options)
}
