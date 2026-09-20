<template>
  <el-container class="layout-container">
    <!-- 左侧古籍编目风格侧边栏 -->
    <el-aside width="220px" class="layout-aside">
      <!-- 品牌标识区域 -->
      <div class="aside-brand">
        <h1 class="brand-title">墨衡</h1>
        <div class="brand-en">M O H E N G</div>
        <div class="brand-oj">ONLINE JUDGE</div>
      </div>

      <!-- 导航菜单（纯净图标+文字，去除多余编号） -->
      <div class="aside-menu-wrapper">
        <el-menu
          :default-active="activeMenu"
          class="el-menu"
          :router="true"
        >
          <el-menu-item index="/system/user">
            <el-icon class="menu-icon"><User /></el-icon>
            <span class="menu-text">用户管理</span>
          </el-menu-item>

          <el-menu-item index="/system/question">
            <el-icon class="menu-icon"><Document /></el-icon>
            <span class="menu-text">题目管理</span>
          </el-menu-item>

          <el-menu-item index="/system/exam">
            <el-icon class="menu-icon"><Trophy /></el-icon>
            <span class="menu-text">竞赛管理</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>

    <!-- 右侧主体容器 -->
    <el-container class="layout-main-wrapper">
      <!-- 顶部 Header 栏 -->
      <el-header class="layout-header">
        <!-- 居中典雅星符标语 -->
        <div class="header-center-motto">
          <span class="motto-star">✦</span>
          <span class="motto-text">以算法丈量世界 · 用代码书写答案</span>
          <span class="motto-star">✦</span>
        </div>

        <!-- 右侧管理员信息与直接关机退出按钮（移除头像与下拉框） -->
        <div class="header-right">
          <div class="user-profile-direct">
            <span class="user-label">当前用户：</span>
            <span class="user-name">{{ nickName || '超级管理员' }}</span>
            <button class="logout-btn" title="退出登录" @click="handleLogout">
              <el-icon class="logout-icon"><SwitchButton /></el-icon>
            </button>
          </div>
        </div>
      </el-header>

      <!-- 核心画卷内容主区 -->
      <el-main class="layout-content-main">
        <div class="content-scroll-box">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script src="./System.js"></script>
<style scoped lang="scss" src="./System.scss"></style>
