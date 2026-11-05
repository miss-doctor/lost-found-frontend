<template>
  <div class="admin-points-container">
    <el-card class="points-card">
      <template #header>
        <div class="points-header">
          <h2>积分管理</h2>
        </div>
      </template>
      
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="用户名">
              <el-input v-model="searchForm.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用户ID">
              <el-input v-model="searchForm.userId" placeholder="请输入用户ID" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="searchUser">搜索</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <div v-if="userInfo" class="user-info-card">
        <h3>用户信息</h3>
        <el-descriptions :column="3">
          <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ userInfo.realName || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="积分">{{ userInfo.points || 0 }}</el-descriptions-item>
          <el-descriptions-item label="等级">{{ userInfo.level || 1 }}</el-descriptions-item>
          <el-descriptions-item label="信用分">{{ userInfo.creditScore || 100 }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="penalty-section">
          <h4>积分扣除</h4>
          <el-form :model="penaltyForm" :rules="penaltyRules" ref="penaltyFormRef" class="penalty-form">
            <el-form-item label="扣除积分" prop="points">
              <el-input v-model.number="penaltyForm.points" placeholder="请输入扣除积分" type="number" />
            </el-form-item>
            <el-form-item label="扣除原因" prop="reason">
              <el-input v-model="penaltyForm.reason" placeholder="请输入扣除原因" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePenalty">确认扣除</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <div v-else class="no-user">
        <el-empty description="请搜索用户" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

const searchForm = reactive({
  username: '',
  userId: ''
});

const penaltyForm = reactive({
  points: 0,
  reason: ''
});

const penaltyRules = {
  points: [
    { required: true, message: '请输入扣除积分', trigger: 'blur' },
    { type: 'number', min: 1, message: '扣除积分必须大于0', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入扣除原因', trigger: 'blur' }
  ]
};

const userInfo = ref(null);
const penaltyFormRef = ref(null);

const searchUser = async () => {
  try {
    // 这里简化处理，实际应该调用后端API搜索用户
    // 暂时使用模拟数据
    userInfo.value = {
      id: 1,
      username: searchForm.username || 'admin',
      realName: '管理员',
      points: 100,
      level: 2,
      creditScore: 95
    };
  } catch (error) {
    ElMessage.error('搜索用户失败');
  }
};

const resetForm = () => {
  searchForm.username = '';
  searchForm.userId = '';
  userInfo.value = null;
};

const handlePenalty = async () => {
  if (!penaltyFormRef.value) return;
  await penaltyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await request.post(`/admin/users/${userInfo.value.id}/penalty`, {
          points: penaltyForm.points,
          reason: penaltyForm.reason
        });
        if (response.code === 200) {
          ElMessage.success('扣除积分成功');
          // 刷新用户信息
          searchUser();
          // 重置表单
          penaltyForm.points = 0;
          penaltyForm.reason = '';
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        ElMessage.error('扣除积分失败');
      }
    }
  });
};
</script>

<style scoped>
.admin-points-container {
  padding: 20px;
}

.points-card {
  max-width: 800px;
  margin: 0 auto;
}

.points-header {
  text-align: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.user-info-card {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.user-info-card h3 {
  margin-bottom: 15px;
  font-size: 16px;
}

.penalty-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.penalty-section h4 {
  margin-bottom: 15px;
  font-size: 14px;
}

.penalty-form {
  margin-top: 10px;
}

.no-user {
  padding: 50px 0;
  text-align: center;
}
</style>