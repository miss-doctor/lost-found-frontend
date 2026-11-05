<template>
  <div class="user-profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="profile-header">
          <h2>个人中心</h2>
        </div>
      </template>
      
      <div class="profile-info">
        <div class="basic-info">
          <el-avatar :size="80" :src="userAvatar">
            {{ userInfo.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <div class="info-details">
            <h3>{{ userInfo.username }}</h3>
            <div v-if="!isEditing" class="info-item">
              <span class="info-label">真实姓名：</span>
              <span class="info-value">{{ userInfo.realName || '未设置' }}</span>
            </div>
            <div v-if="!isEditing" class="info-item">
              <span class="info-label">手机号码：</span>
              <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div v-if="!isEditing" class="info-item">
              <span class="info-label">注册时间：</span>
              <span class="info-value">{{ formatDate(userInfo.createTime) }}</span>
            </div>
            <el-button v-if="!isEditing" type="primary" @click="startEditing" size="small">
              编辑信息
            </el-button>
          </div>
        </div>
        
        <div v-if="isEditing" class="edit-section">
          <h4>完善个人信息</h4>
          <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px" class="edit-form">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="editForm.phone" placeholder="请输入手机号码" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email" placeholder="请输入邮箱" type="email" />
            </el-form-item>
            <el-form-item label="学院" prop="college">
              <el-input v-model="editForm.college" placeholder="请输入学院" />
            </el-form-item>
            <el-form-item label="专业" prop="major">
              <el-input v-model="editForm.major" placeholder="请输入专业" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveInfo">保存修改</el-button>
              <el-button @click="cancelEditing">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="stats-info">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.points || 0 }}</div>
                <div class="stat-label">积分</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.level || 1 }}</div>
                <div class="stat-label">等级</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.creditScore || 100 }}</div>
                <div class="stat-label">信用分</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="honor-badges" v-if="userInfo.honorBadges && userInfo.honorBadges.length > 0">
          <h4>荣誉标识</h4>
          <div class="badges-container">
            <el-tag v-for="(badge, index) in userInfo.honorBadges" :key="index" size="small" type="success">
              {{ badge }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <div class="activity-section">
        <h4>积分记录</h4>
        <el-table :data="activities" style="width: 100%">
          <el-table-column prop="timestamp" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="points" label="积分变动">
            <template #default="{ row }">
              <span :class="row.points > 0 ? 'points-positive' : 'points-negative'">
                {{ row.points > 0 ? '+' : '' }}{{ row.points }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因"></el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

const userStore = useUserStore();
const userInfo = ref({});
const activities = ref([]);
const isEditing = ref(false);
const editForm = ref({});
const editFormRef = ref(null);

const userAvatar = computed(() => {
  const firstChar = userInfo.value.username?.charAt(0) || '用';
  return `https://ui-avatars.com/api/?name=${firstChar}&background=667eea&color=fff`;
});

const editRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const fetchUserInfo = async () => {
  try {
    const response = await request.get('/user/info');
    if (response.code === 200) {
      userInfo.value = response.data;
    }
  } catch (error) {
    console.error('获取用户信息失败', error);
  }
};

const startEditing = () => {
  isEditing.value = true;
  // 复制当前用户信息到编辑表单
  editForm.value = {
    realName: userInfo.value.realName || '',
    phone: userInfo.value.phone || '',
    email: userInfo.value.email || '',
    college: userInfo.value.college || '',
    major: userInfo.value.major || ''
  };
};

const cancelEditing = () => {
  isEditing.value = false;
};

const saveInfo = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await request.put('/user/info', editForm.value);
        if (response.code === 200) {
          ElMessage.success('信息更新成功');
          isEditing.value = false;
          // 重新获取用户信息
          fetchUserInfo();
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        ElMessage.error('更新信息失败');
      }
    }
  });
};

const fetchActivities = async () => {
  if (userStore.user?.id) {
    try {
      const response = await request.get(`/users/${userStore.user.id}/activities`);
      if (response.code === 200) {
        activities.value = response.data;
      }
    } catch (error) {
      console.error('获取积分记录失败', error);
    }
  }
};

onMounted(() => {
  fetchUserInfo();
  fetchActivities();
});
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
}

.profile-info {
  margin-bottom: 30px;
}

.basic-info {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.info-details {
  margin-left: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-details h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #606266;
  font-size: 14px;
  min-width: 80px;
}

.info-value {
  color: #303133;
  font-size: 14px;
}

.edit-section {
  margin-top: 30px;
  padding: 25px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.edit-section h4 {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.edit-form {
  max-width: 600px;
}

.edit-form .el-form-item {
  margin-bottom: 15px;
}

.stats-info {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.honor-badges {
  margin-top: 20px;
}

.honor-badges h4 {
  margin-bottom: 10px;
  font-size: 16px;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.activity-section {
  margin-top: 30px;
}

.activity-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
}

.points-positive {
  color: #67c23a;
  font-weight: bold;
}

.points-negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>