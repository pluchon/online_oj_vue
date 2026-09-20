<template>
  <div class="login-page">
    <!-- 左侧：典雅表单区域（50% 平分） -->
    <div class="left-section">
      <div class="form-container">
        <!-- 品牌标识与副标 -->
        <div class="brand-header">
          <h1 class="brand-title">墨衡</h1>
          <div class="brand-line"></div>
          <div class="brand-subtitle">以算法丈量世界</div>
        </div>

        <!-- 表单输入区域 -->
        <div class="form-body">
          <div class="form-item">
            <el-icon class="input-icon"><User /></el-icon>
            <el-input
              v-model="loginForm.userAccount"
              placeholder="请输入用户名"
              clearable
              autocomplete="off"
              @keyup.enter="handleLogin"
            />
          </div>

          <div class="form-item">
            <el-icon class="input-icon"><Lock /></el-icon>
            <el-input
              v-model="loginForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
              autocomplete="new-password"
              @keyup.enter="handleLogin"
            />
          </div>

          <!-- 辅助选项 -->
          <div class="form-meta-row">
            <el-checkbox v-model="rememberMe" class="custom-checkbox">记住我</el-checkbox>
            <span class="forgot-link">忘记密码?</span>
          </div>

          <!-- 错误提示文本 -->
          <div v-if="errorMsg" class="form-error-text">
            {{ errorMsg }}
          </div>

          <!-- 登录提交按钮 -->
          <button
            class="submit-button"
            :class="{ disabled: loading }"
            :disabled="loading"
            @click="handleLogin"
          >
            <span>{{ loading ? '登录中...' : '登录' }}</span>
            <svg class="arrow-svg" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧：Masonry 卡片瀑布流展示区（50% 平分，羊皮纸底色 + 优雅无限滚动） -->
    <div class="right-section">
      <div class="masonry-wrapper">
        <Masonry
          :items="cards"
          :scale-on-hover="true"
          :hover-scale="0.96"
          :color-shift-on-hover="true"
        />
      </div>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
<style scoped lang="scss" src="./Login.scss"></style>
