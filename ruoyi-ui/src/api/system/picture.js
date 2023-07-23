import request from '@/utils/request'

// 查询图片管理列表
export function listPicture(query) {
  return request({
    url: '/system/picture/list',
    method: 'get',
    params: query
  })
}

// 查询图片管理详细
export function getPicture(picId) {
  return request({
    url: '/system/picture/' + picId,
    method: 'get'
  })
}

// 新增图片管理
export function addPicture(data) {
  return request({
    url: '/system/picture',
    method: 'post',
    data: data
  })
}

// 修改图片管理
export function updatePicture(data) {
  return request({
    url: '/system/picture',
    method: 'put',
    data: data
  })
}

// 删除图片管理
export function delPicture(picId) {
  return request({
    url: '/system/picture/' + picId,
    method: 'delete'
  })
}
