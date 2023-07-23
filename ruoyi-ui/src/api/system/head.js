import request from '@/utils/request'

// 查询导航栏管理列表
export function listHead(query) {
  return request({
    url: '/system/head/list',
    method: 'get',
    params: query
  })
}

// 查询导航栏管理详细
export function getHead(headId) {
  return request({
    url: '/system/head/' + headId,
    method: 'get'
  })
}

// 新增导航栏管理
export function addHead(data) {
  return request({
    url: '/system/head',
    method: 'post',
    data: data
  })
}

// 修改导航栏管理
export function updateHead(data) {
  return request({
    url: '/system/head',
    method: 'put',
    data: data
  })
}

// 删除导航栏管理
export function delHead(headId) {
  return request({
    url: '/system/head/' + headId,
    method: 'delete'
  })
}
