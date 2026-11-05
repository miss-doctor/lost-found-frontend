<template>
  <div class="item-detail-container">
    <el-card>
      <div style="margin-bottom: 20px; display: flex; gap: 10px">
        <el-button type="primary" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <el-button 
          type="danger" 
          @click="handleDeleteItem" 
          v-if="item.userId === userInfo.id || userInfo.type === 'admin'"
        >
          <el-icon><Delete /></el-icon> 删除物品
        </el-button>
      </div>

      <!-- 物品基本信息 -->
      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="物品名称" :span="2">
          {{ item.name }}
        </el-descriptions-item>
        <el-descriptions-item label="物品类型">
          <el-tag :type="item.type === 'lost' ? 'danger' : 'success'">
            {{ item.type === 'lost' ? '失物' : '招领' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">
          {{ item.publishTime }}
        </el-descriptions-item>
        <el-descriptions-item label="发布人">
          {{ item.username }}
        </el-descriptions-item>
        <el-descriptions-item label="丢失/捡拾时间">
          {{ item.time }}
        </el-descriptions-item>
        <el-descriptions-item label="地点">
          {{ item.location }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ item.contactPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(item.status)">
            {{ getStatusText(item.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物品描述" :span="2">
          {{ item.desc }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 物品图片 -->
      <div v-if="item.image" class="item-image">
        <el-image
          :src="item.image"
          :preview-src-list="[item.image]"
          fit="contain"
          style="width: 400px; height: 300px"
        />
      </div>
    </el-card>

    <!-- 留言区 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>留言区</span>
      </div>

      <!-- 发布留言 -->
      <el-form
        ref="commentFormRef"
        :model="commentForm"
        :rules="commentRules"
        style="margin-bottom: 20px"
      >
        <el-form-item prop="content">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="3"
            placeholder="请输入留言内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitComment" :loading="commentLoading">
            发布留言
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 留言列表 -->
      <el-timeline v-if="comments.length > 0">
        <el-timeline-item
          v-for="comment in comments"
          :key="comment.id"
          :timestamp="comment.createTime"
        >
          <el-card>
            <div class="comment-header">
              <span class="username">{{ comment.username }}</span>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteComment(comment.id)"
                v-if="comment.userId === userInfo.id"
              >
                删除
              </el-button>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <div v-else class="empty-comment">
        <el-empty description="暂无留言，快来抢沙发吧~" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { getItemDetail, deleteItem } from '@/api/item'
import { addComment, deleteComment, getComments } from '@/api/comment'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const userInfo = userStore.userInfo

// 物品信息
const item = ref({})
const comments = ref([])
const loading = ref(false)

// 留言表单
const commentFormRef = ref(null)
const commentForm = ref({
  content: ''
})
const commentRules = ref({
  content: [{ required: true, message: '请输入留言内容', trigger: 'blur' }]
})
const commentLoading = ref(false)

// 获取物品详情
const loadItemDetail = async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    // 获取物品详情
    const res = await getItemDetail(id)
    item.value = res.data
    
    // 获取评论列表
    const commentsRes = await getComments(id)
    // 检查返回的数据结构
    if (commentsRes.data && Array.isArray(commentsRes.data)) {
      comments.value = commentsRes.data
    } else if (commentsRes.data && commentsRes.data.data) {
      // 如果数据嵌套在 data.data 中
      comments.value = commentsRes.data.data
    } else {
      comments.value = []
    }
  } catch (err) {
    ElMessage.error('获取物品详情失败')
    router.push('/home/items')
  } finally {
    loading.value = false
  }
}

// 返回列表页
const goBack = () => {
  router.push('/home/items')
}

// 发布留言
const submitComment = async () => {
  // 表单校验
  const valid = await commentFormRef.value.validate()
  if (!valid) return

  commentLoading.value = true
  try {
    await addComment(route.params.id, {
      content: commentForm.value.content
    })
    ElMessage.success('留言发布成功')
    // 重置表单
    commentFormRef.value.resetFields()
    // 重新加载详情
    loadItemDetail()
  } catch (err) {
    ElMessage.error('留言发布失败')
  } finally {
    commentLoading.value = false
  }
}

// 删除留言
const handleDeleteComment = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该留言吗？',
      '提示',
      {
        type: 'warning'
      }
    )
    await deleteComment(id)
    ElMessage.success('留言删除成功')
    loadItemDetail()
  } catch (err) {
    // 用户取消删除
  }
}

// 删除物品
const handleDeleteItem = async () => {
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
    await deleteItem(item.value.id)
    ElMessage.success('删除物品成功')
    // 跳转到物品列表页
    router.push('/home/items')
  } catch (err) {
    // 用户取消删除
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
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

// 获取状态文本
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

// 初始化加载详情
onMounted(() => {
  loadItemDetail()
})
</script>

<style scoped>
.item-detail-container {
  padding: 0;
}

.item-image {
  margin: 20px 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.username {
  font-weight: bold;
  color: #1989fa;
}

.comment-content {
  line-height: 1.6;
}

.empty-comment {
  text-align: center;
  padding: 40px 0;
}
</style>