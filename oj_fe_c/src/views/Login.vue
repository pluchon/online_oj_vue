<template>
  <div class="login-page">
    <!-- 左侧：全幅博物学铜版插画区域（横屏大图比例，画面留白区展示品牌与核心意象） -->
    <div class="left-section">
      <div class="left-brand-block">
        <h1 class="brand-title">墨衡</h1>
        <div class="brand-slogan-wrap">
          <p class="brand-slogan">以算法丈量世界</p>
          <p class="brand-slogan">用代码寻找答案</p>
        </div>
        <div class="brand-divider"></div>
        <span class="brand-latin">Ad Algorithmum Per Aspera</span>
      </div>
    </div>

    <!-- 右侧：典雅表单区域（竖屏修长比例，暗纹背景底图） -->
    <div class="right-section">
      <!-- 居中表单容器 -->
      <div class="form-container">
        <!-- 标题区域：纯粹精炼的“欢迎回来” -->
        <div class="brand-header">
          <h2 class="form-title">欢迎回来</h2>
        </div>

        <!-- 登录表单 -->
        <div class="form-body">
          <!-- 手机号输入 -->
          <div class="form-item">
            <el-icon class="input-icon"><Iphone /></el-icon>
            <el-input
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              maxlength="11"
              clearable
              autocomplete="tel"
              @keyup.enter="handleLogin"
            />
          </div>

          <!-- 短信验证码输入与获取按钮 -->
          <div class="code-row">
            <div class="code-input-wrapper">
              <el-icon class="input-icon"><ChatDotSquare /></el-icon>
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                maxlength="6"
                clearable
                autocomplete="one-time-code"
                @keyup.enter="handleLogin"
              />
            </div>
            <button
              type="button"
              class="send-code-btn"
              :class="{ disabled: countdown > 0 || codeLoading }"
              :disabled="countdown > 0 || codeLoading"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>

          <!-- 辅助选项：记住我时保留手机号，登录状态保持 7 天 -->
          <div class="form-meta-row">
            <el-checkbox v-model="rememberMe" class="custom-checkbox">记住我</el-checkbox>
          </div>

          <!-- 行内错误提示 -->
          <div v-if="errorMsg" class="form-error-text">
            {{ errorMsg }}
          </div>

          <!-- 登录主按钮（典雅深墨绿） -->
          <button
            type="button"
            class="submit-button"
            :class="{ disabled: loading }"
            :disabled="loading"
            @click="handleLogin"
          >
            <span>{{ loading ? '处理中...' : '登录' }}</span>
            <svg class="arrow-svg" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
<style scoped lang="scss" src="./Login.scss"></style>
