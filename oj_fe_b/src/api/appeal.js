// 申诉管理相关 API 接口
import request from '@/utils/request'

// 分页查询申诉（按用户ID、题目名称、最近天数筛选，按申诉时间倒序）
export function getAppealListApi(params = {}) {
  return request({
    url: '/system/appeal',
    method: 'get',
    params
  })
}

// 查询申诉详情（申诉理由、AI 初审分析、代码与逐用例结果）
export function getAppealDetailApi(appealId) {
  return request({
    url: `/system/appeal/${appealId}`,
    method: 'get'
  })
}

// 裁定申诉（1 存疑、2 通过、3 不通过）
export function handleAppealApi(appealId, status) {
  return request({
    url: `/system/appeal/${appealId}/handle`,
    method: 'put',
    data: { status }
  })
}
