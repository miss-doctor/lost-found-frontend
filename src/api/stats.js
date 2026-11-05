import request from '@/utils/request'

/**
 * 获取失主统计数据
 * @returns {Promise}
 */
export const getLostStats = () => {
  return request({
    url: '/stats/lost',
    method: 'get'
  })
}

/**
 * 获取拾主统计数据
 * @returns {Promise}
 */
export const getFoundStats = () => {
  return request({
    url: '/stats/found',
    method: 'get'
  })
}