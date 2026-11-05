<template>
  <div class="item-list-container">
    <!-- 轮播图 -->
    <el-carousel :interval="5000" type="card" height="400px" class="carousel-container">
      <el-carousel-item v-for="item in carouselItems" :key="item.id">
        <div class="carousel-item">
          <img :src="item.image || 'https://via.placeholder.com/800x400?text=暂无图片'" :alt="item.name" class="carousel-image" />
          <div class="carousel-info">
            <h3>{{ item.name }}</h3>
            <p class="carousel-type">
              <el-tag :type="item.type === 'lost' ? 'danger' : 'success'">
                {{ item.type === 'lost' ? '失物' : '招领' }}
              </el-tag>
            </p>
            <p class="carousel-desc">{{ item.desc }}</p>
            <p class="carousel-meta">
              <span>发布人: {{ item.username }}</span>
              <span>发布时间: {{ formatTime(item.publishTime) }}</span>
            </p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <el-card class="content-card">
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入物品名称/描述关键词"
              clearable
              @clear="loadItemList"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button type="primary" @click="loadItemList">搜索</el-button>
            <el-button type="success" @click="showAddDialog">发布物品</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 物品列表 -->
      <el-table
        :data="itemList"
        v-loading="loading"
        border
        stripe
        style="width: 100%; margin-top: 20px"
        @row-click="handleRowClick"
      >
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
        <el-table-column prop="publishTime" label="发布时间" width="180" :formatter="formatTime" />
        <el-table-column prop="username" label="发布人" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToDetail(row.id)">查看</el-button>
            <el-button
              link
              type="warning"
              @click="showEditDialog(row)"
              v-if="row.userId === userInfo.id || userInfo.type === 'admin'"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(row.id)"
              v-if="row.userId === userInfo.id || userInfo.type === 'admin'"
            >
              删除
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
        @size-change="loadItemList"
        @current-change="loadItemList"
      />
    </el-card>

    <!-- 新增/编辑物品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑物品' : '发布物品'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="itemRules"
        label-width="80px"
      >
        <el-form-item label="物品名称" prop="name">
          <el-input v-model="itemForm.name" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="物品类型" prop="type">
          <el-select v-model="itemForm.type" placeholder="请选择物品类型">
            <el-option label="失物" value="lost" />
            <el-option label="招领" value="found" />
          </el-select>
        </el-form-item>
        <el-form-item label="物品描述" prop="desc">
          <el-input
            v-model="itemForm.desc"
            type="textarea"
            :rows="3"
            placeholder="请详细描述物品特征"
          />
        </el-form-item>
        <el-form-item label="丢失/捡拾时间" prop="time">
          <el-date-picker v-model="itemForm.time" type="datetime" placeholder="请选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="itemForm.location" placeholder="请输入丢失/捡拾地点" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="itemForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="物品图片">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :file-list="fileList"
            list-type="picture-card"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItem" :loading="submitLoading">
          {{ isEdit ? '保存' : '发布' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getItemList, addItem, updateItem, deleteItem } from '@/api/item'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const userInfo = userStore.userInfo

// 搜索参数
const searchKeyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)
const loading = ref(false)
const itemList = ref([])

// 轮播图数据
const carouselItems = computed(() => {
  // 只显示有图片的物品，最多显示5个
  return itemList.value.filter(item => item.image).slice(0, 5)
})

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const itemFormRef = ref(null)

// 物品表单
const itemForm = ref({
  name: '',
  type: '',
  desc: '',
  time: '',
  location: '',
  contactPhone: '',
  image: ''
})

// 表单校验规则
const itemRules = ref({
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择物品类型', trigger: 'change' }],
  desc: [{ required: true, message: '请输入物品描述', trigger: 'blur' }],
  time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 图片上传相关
const fileList = ref([])

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取物品列表
const loadItemList = async () => {
  loading.value = true
  try {
    const res = await getItemList({
      keyword: searchKeyword.value,
      page: page.value,
      size: size.value
    })
    itemList.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    ElMessage.error('获取物品列表失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  itemFormRef.value?.resetFields()
  itemForm.value = {
    name: '',
    type: '',
    desc: '',
    image: ''
  }
  fileList.value = []
  isEdit.value = false
  editId.value = null
}

// 显示新增对话框
const showAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  itemForm.value = {
    name: row.name,
    type: row.type,
    desc: row.desc,
    time: row.time || '',
    location: row.location || '',
    contactPhone: row.contactPhone || '',
    image: row.image
  }
  // 回显图片
  if (row.image) {
    fileList.value = [{ url: row.image }]
  }
  dialogVisible.value = true
}

// 提交物品（新增/编辑）
const submitItem = async () => {
  // 表单校验
  const valid = await itemFormRef.value.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      // 编辑物品
      await updateItem(editId.value, itemForm.value)
      ElMessage.success('编辑物品成功')
    } else {
      // 新增物品
      await addItem(itemForm.value)
      ElMessage.success('发布物品成功')
    }
    dialogVisible.value = false
    loadItemList()
  } catch (err) {
    ElMessage.error(isEdit.value ? '编辑物品失败' : '发布物品失败')
  } finally {
    submitLoading.value = false
  }
}

// 处理图片选择
const handleImageChange = (file) => {
  if (file.raw) {
    // 本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      itemForm.value.image = e.target.result
      fileList.value = [{ url: e.target.result }]
    }
    reader.readAsDataURL(file.raw)
  }
}

// 删除物品
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该物品吗？删除后将无法恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteItem(id)
    ElMessage.success('删除物品成功')
    loadItemList()
    // 通知统计页面刷新数据
    window.dispatchEvent(new CustomEvent('refreshStats'))
  } catch (err) {
    // 用户取消删除
  }
}

// 行点击事件
const handleRowClick = (row) => {
  goToDetail(row.id)
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/home/item/${id}`)
}

// 初始化加载列表
onMounted(() => {
  loadItemList()
})
</script>

<style scoped>
.item-list-container {
  padding: 0;
}

.carousel-container {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.carousel-item:hover .carousel-image {
  transform: scale(1.05);
}

.carousel-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  z-index: 10;
}

.carousel-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.carousel-type {
  margin: 0 0 10px 0;
}

.carousel-desc {
  margin: 0 0 15px 0;
  font-size: 14px;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.carousel-meta {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  justify-content: space-between;
}

.content-card {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-bar {
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-container {
    height: 300px;
  }
  
  .carousel-info h3 {
    font-size: 18px;
  }
  
  .carousel-desc {
    font-size: 12px;
  }
}
</style>