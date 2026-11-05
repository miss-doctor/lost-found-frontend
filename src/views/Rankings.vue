<template>
  <div class="rankings-container">
    <el-card class="rankings-card">
      <template #header>
        <div class="rankings-header">
          <h2>用户排行榜</h2>
        </div>
      </template>
      
      <el-table :data="rankings" style="width: 100%">
        <el-table-column label="排名" width="80">
          <template #default="{ $index }">
            <div class="rank-number">
              <span v-if="$index === 0" class="rank-first">{{ $index + 1 }}</span>
              <span v-else-if="$index === 1" class="rank-second">{{ $index + 1 }}</span>
              <span v-else-if="$index === 2" class="rank-third">{{ $index + 1 }}</span>
              <span v-else>{{ $index + 1 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="180"></el-table-column>
        <el-table-column prop="points" label="积分" width="100"></el-table-column>
        <el-table-column prop="level" label="等级" width="100"></el-table-column>
        <el-table-column prop="creditScore" label="信用分" width="100"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request';

const rankings = ref([]);

const fetchRankings = async () => {
  try {
    const response = await request.get('/rankings');
    if (response.code === 200) {
      rankings.value = response.data;
    }
  } catch (error) {
    console.error('获取排行榜失败', error);
  }
};

onMounted(() => {
  fetchRankings();
});
</script>

<style scoped>
.rankings-container {
  padding: 20px;
}

.rankings-card {
  max-width: 800px;
  margin: 0 auto;
}

.rankings-header {
  text-align: center;
}

.rank-number {
  text-align: center;
  font-weight: bold;
}

.rank-first {
  color: #f56c6c;
  font-size: 18px;
}

.rank-second {
  color: #e6a23c;
  font-size: 16px;
}

.rank-third {
  color: #67c23a;
  font-size: 16px;
}
</style>