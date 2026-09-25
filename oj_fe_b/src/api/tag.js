// 题目标签相关 API 接口
import request from '@/utils/request'

// 查询全部标签（按分类排序，附使用题目数）
export function getTagListApi() {
  return request({
    url: '/system/tag',
    method: 'get'
  })
}

// 新增标签
export function addTagApi(data) {
  return request({
    url: '/system/tag',
    method: 'post',
    data
  })
}

// 修改标签名称与分类
export function editTagApi(tagId, data) {
  return request({
    url: `/system/tag/${tagId}`,
    method: 'put',
    data
  })
}

// 删除标签（同时从题目上移除）
export function deleteTagApi(tagId) {
  return request({
    url: `/system/tag/${tagId}`,
    method: 'delete'
  })
}
