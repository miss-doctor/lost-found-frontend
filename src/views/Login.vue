<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <h1 class="login-title">校园失物招领</h1>
        <p class="login-subtitle">让每一件失物都能找到回家的路</p>
        <div class="login-features">
          <div class="feature-item">
            <el-icon class="feature-icon"><Search /></el-icon>
            <span>快速发布失物信息</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Bell /></el-icon>
            <span>及时接收招领通知</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Check /></el-icon>
            <span>安全可靠的平台</span>
          </div>
        </div>
      </div>
      <div class="login-right">
        <el-card class="login-card">
          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="登录" name="login">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                label-width="80px"
                class="login-form"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="loginForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item label="用户类型" prop="userType">
                  <el-select v-model="loginForm.userType" placeholder="请选择用户类型" class="user-type-select">
                    <el-option label="普通用户" value="user" />
                    <el-option label="管理员" value="admin" />
                  </el-select>
                </el-form-item>
                <el-form-item class="login-buttons">
                  <el-button type="primary" @click="handleLogin" :loading="loading" class="login-btn">登录</el-button>
                  <el-button @click="resetForm" class="reset-btn">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="注册" name="register">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                label-width="80px"
                class="register-form"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="registerForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
                </el-form-item>
                <el-form-item label="真实姓名" prop="realName">
                  <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="registerForm.phone" placeholder="请输入手机号码" />
                </el-form-item>
                <el-form-item label="用户类型" prop="userType">
                  <el-select v-model="registerForm.userType" placeholder="请选择用户类型" class="user-type-select">
                    <el-option label="普通用户" value="user" />
                    <el-option label="管理员" value="admin" />
                  </el-select>
                </el-form-item>
                <el-form-item class="register-buttons">
                  <el-button type="primary" @click="handleRegister" :loading="registerLoading" class="register-btn">注册</el-button>
                  <el-button @click="resetRegisterForm" class="reset-btn">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Search, Bell, Check } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loading = ref(false)
const registerLoading = ref(false)
const activeTab = ref('login')

const loginForm = reactive({
  username: '',
  password: '',
  userType: 'user'
})

const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  userType: 'user'
})

const registerRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
})

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await userStore.userLogin(loginForm)
    ElMessage.success('登录成功')
    // 根据用户类型跳转到不同页面
    if (userStore.userInfo.type === 'admin') {
      router.push('/home/admin/users')
    } else {
      router.push('/home/items')
    }
  } catch (err) {
    ElMessage.error('登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const valid = await registerFormRef.value.validate()
  if (!valid) return

  registerLoading.value = true
  try {
    await userStore.userRegister(registerForm)
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'login'
    registerFormRef.value.resetFields()
  } catch (err) {
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    registerLoading.value = false
  }
}

const resetForm = () => {
  loginFormRef.value.resetFields()
}

const resetRegisterForm = () => {
  registerFormRef.value.resetFields()
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-wrapper {
  width: 900px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden;
}

.login-left {
  flex: 1;
  padding: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.login-subtitle {
  font-size: 16px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.login-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
}

.feature-icon {
  font-size: 20px;
  color: #ffd04b;
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 350px;
  border: none;
  box-shadow: none;
}

.login-tabs {
  width: 100%;
}

.login-form,
.register-form {
  margin-top: 30px;
}

.user-type-select {
  width: 100%;
}

.login-buttons,
.register-buttons {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}

.login-btn,
.register-btn {
  flex: 1;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover,
.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.reset-btn {
  flex: 1;
  height: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-wrapper {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
  
  .login-left {
    padding: 40px;
    text-align: center;
  }
  
  .login-right {
    padding: 30px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-features {
    align-items: center;
  }
}
</style>