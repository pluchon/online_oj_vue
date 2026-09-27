// 数据概览相关 API 接口
import request from '@/utils/request'

// 查询数据概览（今日与近 7 天统计、每日趋势、难题榜、最近竞赛）
export function getOverviewApi() {
  return request({
    url: '/system/overview',
    method: 'get'
  })
}
