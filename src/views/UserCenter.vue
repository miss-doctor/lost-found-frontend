<template>
  <div class="user-center-container">
    <el-card>
      <div class="user-info-header">
        <h3>个人信息</h3>
      </div>

      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUserInfo" :loading="loading">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的发布 -->
    <el-card style="margin-top: 20px">
      <div class="user-info-header">
        <h3>我的发布</h3>
      </div>

      <el-table
        :data="myItems"
        v-loading="itemsLoading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="物品名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'lost' ? 'danger' : 'success'">
              {{ row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToDetail(row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { updateUserInfo } from '@/api/user'
import { getItemList } from '@/api/item'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const itemsLoading = ref(false)

// 用户表单
const userFormRef = ref(null)
const userForm = ref({
  username: '',
  realName: '',
  phone: ''
})

// 表单校验规则
const userRules = ref({
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 我的发布列表
const myItems = ref([])

// 初始化用户信息
const initUserInfo = () => {
  const userInfo = userStore.userInfo
  userForm.value = {
    username: userInfo.username || '',
    realName: userInfo.realName || '',
    phone: userInfo.phone || ''
  }
}

// 获取我的发布列表
const loadMyItems = async () => {
  itemsLoading.value = true
  try {
    const res = await getItemList({
      page: 1,
      size: 100,
      keyword: ''
    })
    // 筛选当前用户发布的物品
    myItems.value = res.data.list.filter(item => item.userId === userStore.userInfo.id)
  } catch (err) {
    ElMessage.error('获取发布列表失败')
  } finally {
    itemsLoading.value = false
  }
}

// 保存用户信息
const submitUserInfo = async () => {
  const valid = await userFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await updateUserInfo({
      realName: userForm.value.realName,
      phone: userForm.value.phone
    })
    ElMessage.success('修改个人信息成功')
    // 更新store中的用户信息
    userStore.userInfo.realName = userForm.value.realName
    userStore.userInfo.phone = userForm.value.phone
    localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
  } catch (err) {
    ElMessage.error('修改个人信息失败')
  } finally {
    loading.value = false
  }
}

// 跳转到物品详情
const goToDetail = (id) => {
  router.push(`/home/item/${id}`)
}

// 初始化
onMounted(() => {
  initUserInfo()
  loadMyItems()
})
</script>

<style scoped>
.user-center-container {
  padding: 0;
}

.user-info-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 10px;
}

.user-info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}
</style>