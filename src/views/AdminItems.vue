<template>
  <div class="admin-items-container">
    <el-card class="items-card">
      <template #header>
        <div class="items-header">
          <h2>物品审核</h2>
        </div>
      </template>
      
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="请输入物品名称或描述" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态">
                <el-option label="全部" value="" />
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="loadItems">查询</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-table
        :data="itemsList"
        v-loading="loading"
        border
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="物品名称" width="180" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'lost' ? 'danger' : 'success'">
              {{ row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="发布者" width="120" />
        <el-table-column prop="desc" label="描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" :formatter="formatTime" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewItem(row.id)">查看</el-button>
            <el-button 
              link 
              type="success" 
              @click="approveItem(row)" 
              v-if="row.status === 'pending'"
            >
              通过
            </el-button>
            <el-button 
              link 
              type="danger" 
              @click="rejectItem(row)" 
              v-if="row.status === 'pending'"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="loadItems"
        @current-change="loadItems"
      />
    </el-card>
    
    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="400px"
    >
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef">
        <el-form-item label="拒绝原因" prop="reason">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const itemsList = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const searchForm = reactive({
  keyword: '',
  status: 'pending'
})

const rejectDialogVisible = ref(false)
const rejectForm = reactive({ reason: '' })
const rejectFormRef = ref(null)
const currentItem = ref(null)

const rejectRules = {
  reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
}

const getTagType = (status) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知'
  }
}

const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const loadItems = async () => {
  loading.value = true
  try {
    const response = await request.get('/items', {
      params: {
        keyword: searchForm.keyword,
        status: searchForm.status,
        page: page.value,
        size: size.value
      }
    })
    itemsList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取物品列表失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  searchForm.keyword = ''
  searchForm.status = 'pending'
  loadItems()
}

const viewItem = (id) => {
  router.push(`/home/item/${id}`)
}

const approveItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要通过该物品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    await request.put(`/admin/items/${item.id}/status`, {
      status: 'approved'
    })
    ElMessage.success('审核通过成功')
    loadItems()
  } catch (error) {
    // 用户取消操作
  }
}

const rejectItem = (item) => {
  currentItem.value = item
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const submitReject = async () => {
  if (!rejectFormRef.value) return
  const valid = await rejectFormRef.value.validate()
  if (!valid) return
  
  try {
    await request.put(`/admin/items/${currentItem.value.id}/status`, {
      status: 'rejected',
      reason: rejectForm.reason
    })
    ElMessage.success('拒绝成功')
    rejectDialogVisible.value = false
    loadItems()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.admin-items-container {
  padding: 20px;
}

.items-card {
  max-width: 1000px;
  margin: 0 auto;
}

.items-header {
  text-align: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}
</style>