<template>
  <div class="home-container">
    <div class="header">
      <div class="brand">
        <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
        <span class="title">比特OJ 在线代码评测系统</span>
      </div>
      <div class="user-area">
        <span class="welcome">欢迎您，{{ nickName }}</span>
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
        <p class="welcome-text">欢迎使用比特OJ，您已成功登录系统！</p>
      </el-card>
    </div>
  </div>
</template>

<script src="./HomeView.js"></script>
<style scoped lang="scss" src="./HomeView.scss"></style>
