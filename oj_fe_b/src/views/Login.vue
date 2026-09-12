<template>
  <div class="login-page">
    <!-- 极光光斑背景 -->
    <div class="orange"></div>
    <div class="blue"></div>
    <div class="blue small"></div>

    <!-- 登录卡片 -->
    <div class="login-box">
      <!-- 品牌 Logo 与标题区域 -->
      <div class="logo-box">
        <img class="logo-img" src="@/assets/images/logo.png" alt="比特OJ Logo" />
        <div class="right">
          <div class="sys-name">比特OJ后台管理</div>
          <div class="sys-sub-name">帮助100万学生就业</div>
        </div>
      </div>

      <!-- 表单输入区域 -->
      <div class="form-box">
        <div class="form-item">
          <img class="input-icon" src="@/assets/images/shouji.png" alt="账号" />
          <el-input
            v-model="loginForm.userAccount"
            placeholder="请输入账号"
            clearable
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-item">
          <img class="input-icon" src="@/assets/images/yanzhengma.png" alt="密码" />
          <el-input
            v-model="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- 错误提示文本（行内） -->
        <div v-if="errorMsg" class="form-error-text">
          {{ errorMsg }}
        </div>

        <!-- 登录提交按钮 -->
        <div
          class="submit-box"
          :class="{ disabled: loading }"
          @click="handleLogin"
        >
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
<style scoped lang="scss" src="./Login.scss"></style>
