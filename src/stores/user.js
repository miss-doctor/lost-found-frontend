import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, register, getUserInfo } from '../api/user.js'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  
  // 初始化用户信息
  const initUser = async () => {
    if (token.value) {
      try {
        // 使用token获取用户信息
        const res = await getUserInfo()
        userInfo.value = res.data
        // 更新localStorage中的用户信息
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      } catch (error) {
        // token无效，清除用户信息
        clearUser()
      }
    }
  }

  // 登录动作
  const userLogin = async (loginForm) => {
    const res = await login(loginForm)
    // 保存Token和用户信息
    token.value = res.data.token
    userInfo.value = res.data.userInfo
    // 持久化到本地存储
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return res
  }

  // 注册动作
  const userRegister = async (registerForm) => {
    const res = await register(registerForm)
    // 注册成功后保存token和用户信息
    if (res.code === 200) {
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
    return res
  }

  // 退出登录
  const logout = () => {
    clearUser()
  }

  // 清空用户信息
  const clearUser = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, userLogin, userRegister, logout, clearUser, initUser }
})