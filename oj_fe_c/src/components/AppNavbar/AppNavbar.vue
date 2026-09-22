<template>
  <header class="global-navbar">
    <div class="nav-inner">
      <!-- 品牌标识 -->
      <div class="brand-area" @click="goToHome">
        <span class="brand-title">墨衡</span>
      </div>

      <!-- 主导航：未登录只展示题库与竞赛 -->
      <nav class="nav-links">
        <router-link
          v-for="item in visibleLinks"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: activePath === item.path }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <!-- 用户区：头像、昵称与退出登录 -->
      <div class="user-action-area">
        <div v-if="isLogin" class="user-direct-info">
          <div class="user-avatar-box">
            <img
              :src="avatarSrc"
              class="user-avatar-img"
              alt="头像"
              @error="handleAvatarError"
            />
          </div>
          <span class="user-name">{{ nickName || '学员' }}</span>
          <button
            type="button"
            class="direct-logout-btn"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
        <button v-else type="button" class="nav-login-btn" @click="goToLogin">
          登录 / 注册
        </button>
      </div>
    </div>
  </header>
</template>

<script src="./AppNavbar.js"></script>
<style scoped lang="scss" src="./AppNavbar.scss"></style>
