import request from '@/utils/request'

/**
 * 获取物品列表
 * @param {Object} params - 查询参数 { keyword, page, size }
 * @returns {Promise}
 */
export const getItemList = (params) => {
  return request({
    url: '/items',
    method: 'get',
    params
  })
}

/**
 * 获取物品详情
 * @param {Number} id - 物品ID
 * @returns {Promise}
 */
export const getItemDetail = (id) => {
  return request({
    url: `/items/${id}`,
    method: 'get'
  })
}

/**
 * 发布物品
 * @param {Object} data - 物品信息 { name, type, desc, image }
 * @returns {Promise}
 */
export const addItem = (data) => {
  return request({
    url: '/items',
    method: 'post',
    data
  })
}

/**
 * 编辑物品
 * @param {Number} id - 物品ID
 * @param {Object} data - 物品信息 { name, type, desc, image }
 * @returns {Promise}
 */
export const updateItem = (id, data) => {
  return request({
    url: `/items/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除物品
 * @param {Number} id - 物品ID
 * @returns {Promise}
 */
export const deleteItem = (id) => {
  return request({
    url: `/items/${id}`,
    method: 'delete'
  })
}