<template>
  <el-container class="layout-container">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="layout-aside">
      <!-- 品牌 Logo 与系统标题 -->
      <div class="aside-logo">
        <img class="logo-img" src="@/assets/images/logo.png" alt="比特OJ Logo" />
        <span class="logo-title">比特OJ后台管理</span>
      </div>

      <!-- 导航菜单 -->
      <div class="aside-menu-wrapper">
        <el-menu
          :default-active="activeMenu"
          class="el-menu"
          :router="true"
        >
          <el-menu-item index="/system/user" disabled>
            <el-icon><Management /></el-icon>
            <span>用户管理</span>
          </el-menu-item>

          <el-menu-item index="/system/question">
            <el-icon><Document /></el-icon>
            <span>题目管理</span>
          </el-menu-item>

          <el-menu-item index="/system/contest" disabled>
            <el-icon><Trophy /></el-icon>
            <span>竞赛管理</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>

    <!-- 右侧主体容器 -->
    <el-container class="layout-main-wrapper">
      <!-- 顶部 Header 栏 -->
      <el-header class="layout-header">
        <div class="header-right">
          <el-dropdown trigger="click" placement="bottom-end" class="user-dropdown">
            <span class="user-profile">
              <el-avatar :size="30" class="user-avatar">{{ (nickName || '管').slice(0, 1) }}</el-avatar>
              <div class="user-info">
                <span class="user-label">当前用户：</span>
                <span class="user-name">{{ nickName || '管理员' }}</span>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDownBold /></el-icon>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="SwitchButton" @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 核心内容渲染区 -->
      <el-main class="layout-content-main">
        <div class="content-card">
          <!-- 子路由页面渲染出口 -->
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script src="./System.js"></script>
<style scoped lang="scss" src="./System.scss"></style>
