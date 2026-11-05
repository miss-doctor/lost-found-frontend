<template>
  <div class="admin-users-container">
    <el-card class="admin-card">
      <div class="card-header">
        <h2>用户管理</h2>
        <el-button type="primary" @click="handleAddUser" class="add-btn">
          <el-icon><Plus /></el-icon> 添加用户
        </el-button>
      </div>

      <el-table
        :data="users"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="phone" label="手机号码" width="150" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="college" label="学院" width="120" />
        <el-table-column prop="major" label="专业" width="120" />
        <el-table-column prop="class" label="班级" width="100" />
        <el-table-column prop="type" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'admin' ? 'warning' : 'primary'">
              {{ row.type === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditUser(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteUser(row.id)" v-if="row.id !== 1">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="userForm.studentId" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" type="email" />
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-input v-model="userForm.college" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="userForm.major" />
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-input v-model="userForm.class" />
        </el-form-item>
        <el-form-item label="用户类型" prop="type">
          <el-select v-model="userForm.type">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUser" :loading="submitLoading">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUsers, updateUser, deleteUser, addUser } from '@/api/admin'

const loading = ref(false)
const submitLoading = ref(false)
const users = ref([])

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const userFormRef = ref(null)
const userForm = ref({
  id: '',
  username: '',
  password: '',
  realName: '',
  phone: '',
  studentId: '',
  email: '',
  college: '',
  major: '',
  class: '',
  type: 'user'
})

// 表单校验规则
const userRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  class: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  type: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
})

// 获取用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res.data
  } catch (err) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  userFormRef.value?.resetFields()
  userForm.value = {
    id: '',
    username: '',
    password: '',
    realName: '',
    phone: '',
    studentId: '',
    email: '',
    college: '',
    major: '',
    class: '',
    type: 'user'
  }
  isEdit.value = false
}

// 显示添加用户对话框
const handleAddUser = () => {
  resetForm()
  dialogVisible.value = true
}

// 显示编辑用户对话框
const handleEditUser = (row) => {
  resetForm()
  isEdit.value = true
  userForm.value = {
    ...row
  }
  dialogVisible.value = true
}

// 提交用户（添加/编辑）
const submitUser = async () => {
  const valid = await userFormRef.value.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      // 编辑用户
      await updateUser(userForm.value.id, userForm.value)
      ElMessage.success('编辑用户成功')
    } else {
      // 添加用户
      await addUser(userForm.value)
      ElMessage.success('添加用户成功')
    }
    dialogVisible.value = false
    loadUsers()
  } catch (err) {
    ElMessage.error(isEdit.value ? '编辑用户失败' : '添加用户失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除用户
const handleDeleteUser = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该用户吗？删除后将无法恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteUser(id)
    ElMessage.success('删除用户成功')
    loadUsers()
  } catch (err) {
    // 用户取消删除
  }
}

// 初始化
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users-container {
  padding: 0;
}

.admin-card {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e6e6;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>