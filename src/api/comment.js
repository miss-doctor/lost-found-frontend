import request from '@/utils/request'

/**
 * 发布留言
 * @param {Number} itemId - 物品ID
 * @param {Object} data - 留言内容 { content }
 * @returns {Promise}
 */
export const addComment = (itemId, data) => {
  return request({
    url: `/items/${itemId}/comments`,
    method: 'post',
    data
  })
}

/**
 * 获取物品的留言列表
 * @param {Number} itemId - 物品ID
 * @returns {Promise}
 */

export const getComments = (itemId) => {
  return request({
    url: `/items/${itemId}/comments`,
    method: 'get'
  })
}


/**
 * 删除留言
 * @param {Number} id - 留言ID
 * @returns {Promise}
 */
export const deleteComment = (id) => {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}