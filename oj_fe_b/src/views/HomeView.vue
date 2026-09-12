<template>
  <div class="home-view">
    <div class="welcome-card">
      <h2>比特OJ 后台管理系统</h2>
      <p class="welcome-text">欢迎您，管理员 <span>{{ nickName || '管理员' }}</span></p>
      <div class="actions">
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script src="./HomeView.js"></script>
<style scoped lang="scss" src="./HomeView.scss"></style>
