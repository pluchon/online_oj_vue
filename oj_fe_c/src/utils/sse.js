// 基于 fetch 的 SSE 请求：POST 请求体 + 逐个回调服务端事件（EventSource 不支持 POST 与自定义请求头）
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import { SUCCESS_CODE, UNAUTHORIZED_CODE } from '@/constants'

// 与 Axios 实例一致的接口前缀
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/dev-api'

// 业务错误（携带后端错误码）
export class SseRequestError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

// 解析一段 SSE 文本块为 { event, data }
const parseBlock = (block) => {
  let event = 'message'
  const dataLines = []
  block.split('\n').forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''))
    }
  })
  return dataLines.length ? { event, data: dataLines.join('\n') } : null
}

// 发起 SSE 请求；校验失败等以 JSON 返回的错误会以 SseRequestError 抛出
export async function postEventStream(url, body, { onEvent, signal } = {}) {
  const token = getToken()
  const response = await fetch(BASE_URL + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Accept: 'text/event-stream, application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body),
    signal
  })

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('text/event-stream')) {
    let result = null
    try {
      result = await response.json()
    } catch (e) {
      // 非 JSON 响应按网络错误处理
    }
    if (result && result.code === UNAUTHORIZED_CODE) {
      useUserStore().resetUserAction()
    }
    if (result && result.code !== SUCCESS_CODE) {
      throw new SseRequestError(result.msg || '请求失败', result.code)
    }
    throw new SseRequestError(response.status >= 500 ? '服务繁忙，请稍后重试' : '网络请求异常，请稍后重试')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true }).replace(/\r/g, '')
    let index = buffer.indexOf('\n\n')
    while (index > -1) {
      const parsed = parseBlock(buffer.slice(0, index))
      buffer = buffer.slice(index + 2)
      if (parsed && onEvent) onEvent(parsed)
      index = buffer.indexOf('\n\n')
    }
  }
  const tail = parseBlock(buffer.trim())
  if (tail && onEvent) onEvent(tail)
}
