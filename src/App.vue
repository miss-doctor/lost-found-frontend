<template>
  <!-- 路由出口：所有页面都会渲染到这个位置 -->
  <router-view /> 
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(async () => {
  // 初始化用户信息
  await userStore.initUser()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background-color: #f5f5f5;
}
</style>