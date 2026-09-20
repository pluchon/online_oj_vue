<template>
  <div class="message-center-page">
    <!-- 顶部全局导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <div class="brand-area" @click="goToHome">
          <img src="@/assets/images/logo.png" alt="Logo" class="brand-logo" />
          <span class="brand-title">比特OJ 在线代码评测平台</span>
        </div>
        <div class="nav-links">
          <router-link to="/question" class="nav-link">题库中心</router-link>
          <router-link to="/exam" class="nav-link">竞赛中心</router-link>
          <router-link v-if="isLogin" to="/my-exam" class="nav-link">我的竞赛</router-link>
          <router-link v-if="isLogin" to="/message" class="nav-link active">消息中心</router-link>
        </div>
        <div class="user-action-area">
          <template v-if="isLogin">
            <div class="msg-bell-trigger active-bell" @click="fetchMessageList">
              <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="badge-item">
                <el-icon class="bell-icon"><Bell /></el-icon>
              </el-badge>
            </div>
            <el-dropdown trigger="hover" class="user-dropdown" @command="handleUserCommand">
              <div class="user-info-trigger">
                <el-avatar :size="34" :src="headImage || defaultAvatar" class="user-avatar">
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
            <el-button type="primary" class="login-btn" @click="goToLogin">
              登录 / 注册
            </el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 消息中心主体 -->
    <main class="main-container">
      <!-- 顶部控制头卡片 -->
      <section class="message-header-card">
        <div class="header-left">
          <div class="title-with-icon">
            <el-icon class="page-title-icon"><ChatDotRound /></el-icon>
            <h1 class="page-title">我的消息</h1>
          </div>
          <div class="header-meta">
            <span class="meta-item">共 <strong class="highlight-num">{{ total }}</strong> 条通知</span>
            <span class="meta-divider">/</span>
            <span class="meta-item">
              未读 <strong class="unread-num">{{ unreadCount }}</strong> 条
            </span>
          </div>
        </div>

        <div class="header-right">
          <el-button
            type="primary"
            plain
            :disabled="unreadCount === 0 || loading"
            @click="handleReadAll"
          >
            <el-icon><Check /></el-icon>
            全部标为已读
          </el-button>
          <el-button :loading="loading" @click="fetchMessageList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </section>

      <!-- 消息卡片列表 -->
      <section v-loading="loading" class="message-list-section">
        <template v-if="messageList && messageList.length > 0">
          <div
            v-for="item in messageList"
            :key="item.messageId"
            class="message-card"
            :class="{ 'is-unread': item.isRead === 0 }"
            @click="handleCardClick(item)"
          >
            <!-- 左侧消息圆形铃铛图标 -->
            <div class="card-icon-wrap" :class="{ 'icon-unread': item.isRead === 0 }">
              <el-icon class="card-bell-icon"><Bell /></el-icon>
              <span v-if="item.isRead === 0" class="unread-dot"></span>
            </div>

            <!-- 中间消息主体内容 -->
            <div class="card-content-wrap">
              <div class="content-header-row">
                <div class="title-area">
                  <span class="card-title">{{ item.title || '系统通知' }}</span>
                  <el-tag
                    v-if="item.isRead === 0"
                    size="small"
                    type="danger"
                    effect="light"
                    class="unread-tag"
                  >
                    未读
                  </el-tag>
                </div>
                <span class="card-time">{{ item.createTime }}</span>
              </div>

              <!-- 消息文本描述 -->
              <p class="card-body-text">
                {{ item.content }}
              </p>
            </div>

            <!-- 右侧操作区 -->
            <div class="card-action-wrap">
              <el-button
                v-if="isExamNotification(item)"
                type="primary"
                size="small"
                plain
                class="rank-action-btn"
                @click.stop="goToContestRank(item)"
              >
                <el-icon><Trophy /></el-icon>
                <span>竞赛大厅</span>
              </el-button>
              <el-button
                v-if="item.isRead === 0"
                type="primary"
                link
                size="small"
                @click.stop="handleReadSingle(item)"
              >
                标为已读
              </el-button>
              <span v-else class="read-status-label">已读</span>
            </div>
          </div>

          <!-- 分页器 -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="pageQuery.pageNum"
              v-model:page-size="pageQuery.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>

        <!-- 空数据状态 -->
        <template v-else-if="!loading">
          <div class="empty-message-wrap">
            <el-empty description="暂无任何站内通知消息" :image-size="140">
              <template #extra>
                <el-button type="primary" plain @click="fetchMessageList">重新获取</el-button>
              </template>
            </el-empty>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script src="./Message.js"></script>
<style scoped lang="scss" src="./Message.scss"></style>
