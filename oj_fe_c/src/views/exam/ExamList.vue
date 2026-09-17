<template>
  <div class="exam-list-page">
    <!-- 顶部全局导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <div class="brand-area" @click="goToHome">
          <img src="@/assets/images/logo.png" alt="Logo" class="brand-logo" />
          <span class="brand-title">比特OJ 在线代码评测平台</span>
        </div>
        <div class="nav-links">
          <router-link to="/question" class="nav-link">题库中心</router-link>
          <router-link to="/exam" class="nav-link active">竞赛中心</router-link>
          <router-link v-if="isLogin" to="/my-exam" class="nav-link">我的竞赛</router-link>
        </div>
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

    <!-- 顶部竞赛主题横幅 (Banner) -->
    <div class="exam-banner-section">
      <div class="banner-inner">
        <div class="banner-text">
          <h1 class="banner-headline">算法与编程竞赛中心</h1>
          <p class="banner-subline">挑战名企真题，与万千开发者同台竞逐算法巅峰</p>
        </div>
      </div>
    </div>

    <!-- 顶部分类 Tab 栏 -->
    <div class="category-tabs-wrap">
      <div class="tabs-inner">
        <div
          class="tab-item"
          :class="{ active: activeTab === '0' }"
          @click="handleTabChange('0')"
        >
          未完赛
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === '1' }"
          @click="handleTabChange('1')"
        >
          历史竞赛
        </div>
      </div>
    </div>

    <!-- 主体内容卡片区域 -->
    <main class="content-container">
      <!-- 列表标题 -->
      <div class="section-title">
        <span>推荐竞赛</span>
      </div>

      <!-- 搜索过滤条 -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">竞赛时间</span>
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            class="exam-date-picker"
            @change="handleDateChange"
          />
        </div>

        <div class="filter-actions">
          <el-button type="primary" class="btn-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button class="btn-reset" @click="handleReset">
            重置
          </el-button>
        </div>
      </div>

      <!-- 竞赛卡片列表展示区 -->
      <div v-loading="loading" class="exam-grid-container">
        <!-- 卡片网格 -->
        <div v-if="examList && examList.length > 0" class="exam-card-grid">
          <div
            v-for="item in examList"
            :key="item.examId"
            class="exam-card"
          >
            <!-- 左侧竞赛封面图 -->
            <div class="card-cover">
              <img src="@/assets/images/exam-cover.svg" alt="竞赛封面" class="cover-img" />
              <!-- 动态状态角标 -->
              <span
                class="status-badge"
                :class="getStatusInfo(item).badgeClass"
              >
                {{ getStatusInfo(item).text }}
              </span>
            </div>

            <!-- 右侧竞赛信息与操作 -->
            <div class="card-body">
              <div class="exam-title" :title="item.title">
                {{ item.title }}
              </div>

              <div class="exam-time-info">
                <div class="time-row">
                  <span class="time-label">开赛时间:</span>
                  <span class="time-val">{{ item.startTime || '--' }}</span>
                </div>
                <div class="time-row">
                  <span class="time-label">结束时间:</span>
                  <span class="time-val">{{ item.endTime || '--' }}</span>
                </div>
              </div>

              <div class="card-action">
                <!-- 已完赛状态：显示双按钮（竞赛练习 + 查看排名） -->
                <template v-if="getStatusInfo(item).phase === 'ended'">
                  <el-button
                    type="primary"
                    plain
                    size="default"
                    class="action-btn"
                    @click="handlePractice(item)"
                  >
                    竞赛练习
                  </el-button>
                  <el-button
                    type="default"
                    size="default"
                    class="action-btn"
                    @click="handleRank(item)"
                  >
                    查看排名
                  </el-button>
                </template>
                <!-- 未完赛状态：单按钮（报名参赛 / 已报名 / 开始答题 / 已开赛） -->
                <template v-else>
                  <el-button
                    :type="getStatusInfo(item).btnType"
                    :plain="getStatusInfo(item).plain"
                    :disabled="getStatusInfo(item).disabled"
                    :loading="Boolean(enrollLoadingMap[item.examId])"
                    size="default"
                    class="action-btn"
                    @click="handleActionClick(item)"
                  >
                    {{ getStatusInfo(item).btnText }}
                  </el-button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 缺省空状态 -->
        <div v-else-if="!loading" class="empty-wrap">
          <el-empty description="暂无符合条件的竞赛数据" :image-size="120">
            <el-button type="primary" size="small" @click="handleReset">重置筛选</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 底部分页器 -->
      <pagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="loadExamList"
      />
    </main>
  </div>
</template>

<script src="./ExamList.js"></script>
<style scoped lang="scss" src="./ExamList.scss"></style>
