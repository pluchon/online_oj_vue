<template>
  <div class="login-page">
    <!-- 极光光斑背景 -->
    <div class="aurora-glow orange"></div>
    <div class="aurora-glow blue"></div>
    <div class="aurora-glow blue small"></div>

    <!-- 登录注册卡片 -->
    <div class="login-box">
      <!-- 品牌 Logo 与标题区域 -->
      <div class="logo-box">
        <img class="logo-img" src="@/assets/images/logo.png" alt="比特OJ Logo" />
        <div class="title-right">
          <div class="sys-name">比特OJ 在线代码评测</div>
          <div class="sys-sub-name">算法能力成长与在线答题平台</div>
        </div>
      </div>

      <!-- 表单输入区域 -->
      <div class="form-box">
        <!-- 手机号输入 -->
        <div class="form-item">
          <img class="input-icon" src="@/assets/images/shouji.png" alt="手机号" />
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
            clearable
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- 验证码输入与获取按钮 -->
        <div class="form-item code-item">
          <div class="code-input-wrap">
            <img class="input-icon" src="@/assets/images/yanzhengma.png" alt="验证码" />
            <el-input
              v-model="loginForm.code"
              placeholder="请输入6位验证码"
              maxlength="6"
              clearable
              @keyup.enter="handleLogin"
            />
          </div>
          <el-button
            class="send-code-btn"
            type="primary"
            plain
            :disabled="countdown > 0 || codeLoading"
            :loading="codeLoading"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码' }}
          </el-button>
        </div>

        <!-- 错误提示文本（行内展示） -->
        <div v-if="errorMsg" class="form-error-text">
          {{ errorMsg }}
        </div>

        <!-- 登录 / 注册统一大按钮 -->
        <div
          class="submit-box"
          :class="{ disabled: loading }"
          @click="handleLogin"
        >
          <span v-if="!loading">登录 / 注册</span>
          <span v-else>处理中...</span>
        </div>

        <div class="form-tip">
          <span>未注册手机号验证通过后将自动创建账号并登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
<style scoped lang="scss" src="./Login.scss"></style>
