<template>
  <el-container style="height: 100%">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">校园失物招领</h1>
      </div>
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        :background-color="'#667eea'"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleMenuSelect"
      >
        <el-menu-item index="1">
          <el-icon><Menu /></el-icon>
          <template #title>物品列表</template>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon><User /></el-icon>
          <template #title>个人中心</template>
        </el-menu-item>
        <el-menu-item index="3" v-if="isAdmin">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>统计分析</template>
        </el-menu-item>
        <el-menu-item index="4" v-if="isAdmin">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="5" v-if="isAdmin">
            <el-icon><Coin /></el-icon>
            <template #title>积分管理</template>
          </el-menu-item>
          <el-menu-item index="6" v-if="isAdmin">
            <el-icon><Check /></el-icon>
            <template #title>物品审核</template>
          </el-menu-item>
          <el-menu-item index="7">
            <el-icon><Present /></el-icon>
            <template #title>积分兑换</template>
          </el-menu-item>
          <el-menu-item index="8">
            <el-icon><Top /></el-icon>
            <template #title>排行榜</template>
          </el-menu-item>

      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="40" :src="userAvatar"></el-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToUserCenter">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Menu, User, DataAnalysis, ArrowDown, UserFilled, Coin, Top, Check, Present } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const userInfo = userStore.userInfo

// 计算属性：判断是否为管理员（从localStorage读取，确保刷新时也能正确显示）
const isAdmin = computed(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      return JSON.parse(storedUserInfo).type === 'admin'
    } catch (e) {
      return false
    }
  }
  return userInfo.type === 'admin'
})

// 页面标题
const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/items')) return '物品列表'
  if (path.includes('/user')) return '个人中心'
  if (path.includes('/stats')) return '统计分析'
  if (path.includes('/item/')) return '物品详情'
  return '校园失物招领'
})

// 用户头像
const userAvatar = computed(() => {
  // 生成基于用户名的默认头像
  const firstChar = userInfo.username?.charAt(0) || '用'
  return `https://ui-avatars.com/api/?name=${firstChar}&background=667eea&color=fff`
})

// 菜单选择事件
const handleMenuSelect = (index) => {
  switch (index) {
    case '1':
      router.push('/home/items')
      break
    case '2':
      router.push('/home/profile')
      break
    case '3':
      router.push('/home/stats')
      break
    case '4':
      router.push('/home/admin/users')
      break
    case '5':
          router.push('/home/admin/points')
          break
        case '6':
          router.push('/home/admin/items')
          break
        case '7':
          router.push('/home/exchange')
          break
        case '8':
          router.push('/home/rankings')
          break
  }
}

// 跳转到个人中心
const goToUserCenter = () => {
  router.push('/home/profile')
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.el-menu-vertical-demo {
  flex: 1;
  border-right: none;
}

.main-container {
  background-color: #f5f7fa;
}

.header {
  background-color: white;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #666;
}

.content {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-container {
    flex-direction: column;
  }
  
  .el-aside {
    width: 100% !important;
    height: auto !important;
  }
  
  .el-menu-vertical-demo {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .el-menu-item {
    min-width: 100px;
  }
  
  .header {
    padding: 0 15px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .content {
    padding: 10px;
  }
  
  .sidebar-header {
    padding: 10px;
  }
  
  .logo {
    font-size: 16px;
  }
}
</style>