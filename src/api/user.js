import request from '@/utils/request'

/**
 * 登录接口
 * @param {Object} data - 登录参数 { username, password }
 * @returns {Promise}
 */
export const login = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

/**
 * 修改用户信息
 * @param {Object} data - 用户信息 { realName, phone }
 * @returns {Promise}
 */
export const updateUserInfo = (data) => {
  return request({
    url: '/user/info',
    method: 'put',
    data
  })
}

/**
 * 注册接口
 * @param {Object} data - 注册参数 { username, password }
 * @returns {Promise}
 */
export const register = (data) => {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}