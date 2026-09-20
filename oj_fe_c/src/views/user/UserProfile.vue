<template>
  <div class="user-profile-page">
    <!-- 顶部全局导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <div class="brand-area" @click="goToHome">
          <img src="@/assets/images/logo.png" alt="Logo" class="brand-logo" />
          <span class="brand-title">Online Judge</span>
        </div>

        <nav class="nav-links">
          <router-link to="/question" class="nav-link">题库中心</router-link>
          <router-link to="/exam" class="nav-link">竞赛中心</router-link>
        </nav>

        <div class="user-action-area">
          <template v-if="isLogin">
            <el-dropdown trigger="hover" class="user-dropdown" @command="handleUserCommand">
              <div class="user-info-trigger">
                <el-avatar
                  :size="34"
                  :src="headImage || defaultAvatar"
                  class="user-avatar"
                >
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <span class="user-name">{{ nickName }}</span>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-menu-list">
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    <span>个人中心</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="myExam">
                    <el-icon><Trophy /></el-icon>
                    <span>我的竞赛管理</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="handleLogin">
              登录 / 注册
            </el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面面包屑与标题区 -->
    <div class="profile-header-section">
      <div class="header-inner">
        <el-breadcrumb separator="/" class="custom-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/question' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-title-wrap">
          <h1 class="page-title">个人中心</h1>
          <p class="page-desc">查看并管理您的个人档案、学术履历与基本安全信息</p>
        </div>
      </div>
    </div>

    <!-- 主体区域 -->
    <main class="profile-main-container">
      <!-- 异常重试状态 -->
      <div v-if="hasError" class="state-container error-state">
        <el-empty description="资料加载失败，请检查网络后重试">
          <el-button type="primary" @click="loadUserProfile">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 资料内容区域 -->
      <div v-else v-loading="pageLoading" class="profile-content-layout">
        <!-- 左侧：用户简况卡片 -->
        <aside class="profile-sidebar">
          <div class="sidebar-card">
            <!-- 头像上传区 -->
            <div class="avatar-upload-wrapper" v-loading="avatarUploading">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :http-request="handleAvatarUpload"
                :before-upload="beforeAvatarUpload"
                accept="image/jpeg,image/png,image/webp,image/gif"
              >
                <div class="avatar-hover-box">
                  <el-avatar
                    :size="110"
                    :src="formData.headImage || defaultAvatar"
                    class="main-avatar"
                  >
                    <el-icon :size="48"><UserFilled /></el-icon>
                  </el-avatar>
                  <div class="avatar-mask">
                    <el-icon class="mask-icon"><Camera /></el-icon>
                    <span class="mask-text">更换头像</span>
                  </div>
                </div>
              </el-upload>
            </div>

            <!-- 用户基础标识 -->
            <h2 class="sidebar-username">{{ formData.nickName || '未设置昵称' }}</h2>
            <div class="sidebar-meta">
              <el-tag size="small" type="success" effect="plain" class="status-tag">
                正常
              </el-tag>
              <el-tag size="small" type="info" effect="plain" class="phone-tag">
                <el-icon><Phone /></el-icon>
                <span>{{ userProfile.phone || '未绑定手机' }}</span>
              </el-tag>
            </div>

            <el-divider class="sidebar-divider" />

            <!-- 用户信息微摘要 -->
            <div class="sidebar-info-list">
              <div class="info-item">
                <span class="label">性别</span>
                <span class="value">{{ userProfile.sexDesc || '保密' }}</span>
              </div>
              <div class="info-item">
                <span class="label">学校</span>
                <span class="value">{{ userProfile.schoolName || '暂未填写' }}</span>
              </div>
              <div class="info-item">
                <span class="label">注册时间</span>
                <span class="value">{{ userProfile.createTime || '-' }}</span>
              </div>
            </div>

            <!-- 头像上传提示 -->
            <div class="avatar-tip-box">
              <el-icon><InfoFilled /></el-icon>
              <span>支持 JPG、PNG、WebP，大小不超过 2MB</span>
            </div>
          </div>
        </aside>

        <!-- 右侧：资料编辑表单卡片 -->
        <section class="profile-main-content">
          <div class="form-card">
            <div class="card-header">
              <h3 class="card-title">基本信息</h3>
              <span class="card-subtitle">完善个人基本信息，以便系统提供更好的个性化服务</span>
            </div>

            <el-form
              ref="profileFormRef"
              :model="formData"
              :rules="formRules"
              label-position="top"
              class="profile-edit-form"
            >
              <div class="form-grid">
                <!-- 用户昵称 -->
                <el-form-item label="用户昵称" prop="nickName">
                  <el-input
                    v-model="formData.nickName"
                    placeholder="请输入2-32位用户昵称"
                    maxlength="32"
                    show-word-limit
                    clearable
                  />
                </el-form-item>

                <!-- 用户性别 -->
                <el-form-item label="性别" prop="sex">
                  <el-radio-group v-model="formData.sex">
                    <el-radio :label="0">保密</el-radio>
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 绑定手机号 -->
                <el-form-item label="绑定手机号">
                  <el-input
                    :model-value="userProfile.phone"
                    disabled
                    placeholder="绑定手机号"
                  >
                    <template #suffix>
                      <el-tooltip content="手机号为核心安全登录凭据，暂不支持在此直接修改" placement="top">
                        <el-icon class="field-tip-icon"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input>
                </el-form-item>

                <!-- 电子邮箱 -->
                <el-form-item label="电子邮箱" prop="email">
                  <el-input
                    v-model="formData.email"
                    placeholder="请输入有效电子邮箱地址"
                    clearable
                  />
                </el-form-item>

                <!-- 微信号 -->
                <el-form-item label="微信号" prop="wechat">
                  <el-input
                    v-model="formData.wechat"
                    placeholder="请输入微信号（选填）"
                    maxlength="50"
                    clearable
                  />
                </el-form-item>
              </div>

              <div class="card-header sub-header">
                <h3 class="card-title">学术与简介</h3>
                <span class="card-subtitle">展示您的教育经历与个人技术特长</span>
              </div>

              <div class="form-grid">
                <!-- 学校名称 -->
                <el-form-item label="学校名称" prop="schoolName">
                  <el-input
                    v-model="formData.schoolName"
                    placeholder="例如：清华大学（选填）"
                    maxlength="100"
                    clearable
                  />
                </el-form-item>

                <!-- 专业名称 -->
                <el-form-item label="专业名称" prop="majorName">
                  <el-input
                    v-model="formData.majorName"
                    placeholder="例如：计算机科学与技术（选填）"
                    maxlength="100"
                    clearable
                  />
                </el-form-item>
              </div>

              <!-- 个人简介 -->
              <el-form-item label="个人简介" prop="introduce" class="full-width-item">
                <el-input
                  v-model="formData.introduce"
                  type="textarea"
                  :rows="4"
                  placeholder="用一段简短的话介绍一下您自己吧（最多200字）..."
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <!-- 表单操作按钮栏 -->
              <div class="form-action-bar">
                <el-button
                  type="primary"
                  :loading="saving"
                  @click="handleSaveProfile"
                >
                  保存修改
                </el-button>
                <el-button
                  :disabled="saving"
                  @click="handleResetForm"
                >
                  重置
                </el-button>
              </div>
            </el-form>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script src="./UserProfile.js"></script>
<style lang="scss" scoped src="./UserProfile.scss"></style>
