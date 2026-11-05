import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 导入页面组件
const Login = () => import('@/views/Login.vue')
const Home = () => import('@/views/Home.vue')
const ItemList = () => import('@/views/ItemList.vue')
const ItemDetail = () => import('@/views/ItemDetail.vue')
const UserCenter = () => import('@/views/UserCenter.vue')
const Stats = () => import('@/views/Stats.vue')
const AdminUsers = () => import('@/views/AdminUsers.vue')
const AdminPoints = () => import('@/views/AdminPoints.vue')
const AdminItems = () => import('@/views/AdminItems.vue')
const UserProfile = () => import('@/views/UserProfile.vue')
const Rankings = () => import('@/views/Rankings.vue')
const PointsExchange = () => import('@/views/PointsExchange.vue')

// 路由规则
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录 - 校园失物招领网'
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页 - 校园失物招领网',
      requireAuth: true // 需要登录
    },
    children: [
      {
        path: 'items',
        name: 'ItemList',
        component: ItemList,
        meta: {
          title: '物品列表 - 校园失物招领网'
        }
      },
      {
        path: 'item/:id',
        name: 'ItemDetail',
        component: ItemDetail,
        meta: {
          title: '物品详情 - 校园失物招领网'
        }
      },
      {
        path: 'user',
        name: 'UserCenter',
        component: UserCenter,
        meta: {
          title: '个人中心 - 校园失物招领网'
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats,
        meta: {
          title: '统计分析 - 校园失物招领网',
          requireAdmin: true
        }
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: {
          title: '用户管理 - 校园失物招领网',
          requireAdmin: true // 需要管理员权限
        }
      },
      {
        path: 'admin/points',
        name: 'AdminPoints',
        component: AdminPoints,
        meta: {
          title: '积分管理 - 校园失物招领网',
          requireAdmin: true // 需要管理员权限
        }
      },
      {
        path: 'admin/items',
        name: 'AdminItems',
        component: AdminItems,
        meta: {
          title: '物品审核 - 校园失物招领网',
          requireAdmin: true // 需要管理员权限
        }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: {
          title: '个人资料 - 校园失物招领网'
        }
      },
      {
        path: 'rankings',
        name: 'Rankings',
        component: Rankings,
        meta: {
          title: '排行榜 - 校园失物招领网'
        }
      },
      {
        path: 'exchange',
        name: 'PointsExchange',
        component: PointsExchange,
        meta: {
          title: '积分兑换 - 校园失物招领网'
        }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫：验证登录状态
router.beforeEach((to, from) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 验证是否需要登录
  if (to.meta.requireAuth) {
    const userStore = useUserStore()
    if (userStore.token) {
      // 验证是否需要管理员权限
      if (to.meta.requireAdmin) {
        if (userStore.userInfo.type === 'admin') {
          return true
        } else {
          // 普通用户无权访问管理员页面
          return from.fullPath || '/home/items'
        }
      }
      return true
    } else {
      return '/login'
    }
  } else {
    return true
  }
})

export default router