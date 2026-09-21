<template>
  <div class="home-container">
    <div class="header">
      <div class="brand">
        <span class="title">墨衡</span>
      </div>
      <div class="user-area">
        <span class="welcome">{{ nickName }}</span>
        <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <div class="main-content">
      <el-card class="welcome-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>用户中心</span>
          </div>
        </template>
        <p class="welcome-text">已成功登录系统</p>
      </el-card>
    </div>
  </div>
</template>

<script src="./HomeView.js"></script>
<style scoped lang="scss" src="./HomeView.scss"></style>
