<template>
  <div class="stats-container">
    <el-card class="stats-card">
      <div class="card-header">
        <h2>数据统计分析</h2>
        <el-button type="primary" @click="refreshStats" :loading="refreshing">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
      </div>
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="失主统计" name="lost">
          <el-table
            :data="lostStats"
            v-loading="loading"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="username" label="失主" width="180" />
            <el-table-column prop="count" label="发布失物数量">
              <template #default="{ row }">
                <el-tag type="danger" effect="dark">{{ row.count }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="占比" width="180">
              <template #default="{ row }">
                <div class="progress-container">
                  <el-progress 
                    :percentage="calculatePercentage(row.count, totalLost)" 
                    :color="getProgressColor(row.count, totalLost)"
                    :stroke-width="10"
                    :format="() => ''"
                  />
                  <span class="percentage-text">{{ calculatePercentage(row.count, totalLost) }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="拾主统计" name="found">
          <el-table
            :data="foundStats"
            v-loading="loading"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="username" label="拾主" width="180" />
            <el-table-column prop="count" label="发布招领数量">
              <template #default="{ row }">
                <el-tag type="success" effect="dark">{{ row.count }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="占比" width="180">
              <template #default="{ row }">
                <div class="progress-container">
                  <el-progress 
                    :percentage="calculatePercentage(row.count, totalFound)" 
                    :color="getProgressColor(row.count, totalFound)"
                    :stroke-width="10"
                    :format="() => ''"
                  />
                  <span class="percentage-text">{{ calculatePercentage(row.count, totalFound) }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getLostStats, getFoundStats } from '@/api/stats'

// 激活的标签
const activeTab = ref('lost')
const loading = ref(false)
const refreshing = ref(false)

// 统计数据
const lostStats = ref([])
const foundStats = ref([])

// 计算总数量
const totalLost = computed(() => {
  return lostStats.value.reduce((sum, item) => sum + item.count, 0)
})

const totalFound = computed(() => {
  return foundStats.value.reduce((sum, item) => sum + item.count, 0)
})

// 计算百分比
const calculatePercentage = (count, total) => {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

// 获取进度条颜色
const getProgressColor = (count, total) => {
  const percentage = calculatePercentage(count, total)
  if (percentage >= 50) return '#F56C6C'
  if (percentage >= 30) return '#E6A23C'
  return '#67C23A'
}

// 加载失主统计
const loadLostStats = async () => {
  loading.value = true
  try {
    const res = await getLostStats()
    lostStats.value = res.data
  } catch (err) {
    ElMessage.error('获取失主统计失败')
  } finally {
    loading.value = false
  }
}

// 加载拾主统计
const loadFoundStats = async () => {
  loading.value = true
  try {
    const res = await getFoundStats()
    foundStats.value = res.data
  } catch (err) {
    ElMessage.error('获取拾主统计失败')
  } finally {
    loading.value = false
  }
}

// 刷新统计数据
const refreshStats = async () => {
  refreshing.value = true
  try {
    if (activeTab.value === 'lost') {
      await loadLostStats()
    } else {
      await loadFoundStats()
    }
    ElMessage.success('数据刷新成功')
  } catch (err) {
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 监听标签切换
watch(activeTab, (val) => {
  if (val === 'lost') {
    loadLostStats()
  } else {
    loadFoundStats()
  }
})

// 初始化
onMounted(() => {
  loadLostStats()
  // 每30秒自动刷新数据
  setInterval(() => {
    if (activeTab.value === 'lost') {
      loadLostStats()
    } else {
      loadFoundStats()
    }
  }, 30000)
  
  // 监听删除物品事件，自动刷新统计数据
  window.addEventListener('refreshStats', () => {
    if (activeTab.value === 'lost') {
      loadLostStats()
    } else {
      loadFoundStats()
    }
  })
})
</script>

<style scoped>
.stats-container {
  padding: 0;
}

.stats-card {
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

.progress-container {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.percentage-text {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 12px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .progress-container {
    height: 50px;
  }
}
</style>