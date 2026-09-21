// C端站内消息中心相关 API 封装
import request from '@/utils/request'

// 分页查询当前登录用户的站内消息列表
export function getMessageListApi(params) {
  return request({
    url: '/friend/message',
    method: 'get',
    params
  })
}

// 获取当前登录用户的未读消息总数
export function getUnreadCountApi() {
  return request({
    url: '/friend/message/unread-count',
    method: 'get'
  })
}

// 标记指定消息为已读状态
export function readMessageApi(messageId) {
  return request({
    url: `/friend/message/${messageId}/read`,
    method: 'put'
  })
}

// 一键将所有未读消息置为已读
export function readAllMessagesApi() {
  return request({
    url: '/friend/message/read/all',
    method: 'put'
  })
}
