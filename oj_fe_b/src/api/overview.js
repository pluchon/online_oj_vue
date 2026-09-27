// 数据概览相关 API 接口
import request from '@/utils/request'

// 查询数据概览（今日与近 7 天统计、难题榜）
export function getOverviewApi() {
  return request({
    url: '/system/overview',
    method: 'get'
  })
}

// 按时间范围查询提交趋势（range 见 OVERVIEW_TREND_RANGE_OPTIONS）
export function getOverviewTrendApi(range) {
  return request({
    url: '/system/overview/trend',
    method: 'get',
    params: { range }
  })
}

// 查询近 N 天内进行过的竞赛：汇总人数与分页列表
export function getOverviewExamApi(params) {
  return request({
    url: '/system/overview/exam',
    method: 'get',
    params
  })
}
