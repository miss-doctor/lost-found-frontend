import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建Axios
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器：添加Token
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理结果
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 成功响应（code=200）
    if (res.code === 200) {
      return res
    }
    // 其他状态码提示错误
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(res)
  },
  (error) => {
    // 处理401未授权
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      ElMessageBox.confirm(
        '登录状态已失效，请重新登录',
        '提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 清空用户信息并跳转到登录页
        userStore.clearUser()
        router.push('/login')
      })
    }
    // 其他错误提示
    ElMessage.error(error.response?.data?.msg || '网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default request