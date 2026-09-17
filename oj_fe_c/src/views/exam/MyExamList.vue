<template>
  <div class="my-exam-page">
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
          <router-link to="/my-exam" class="nav-link active">我的竞赛</router-link>
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
          <h1 class="banner-headline">我的竞赛日程与战报</h1>
          <p class="banner-subline">查看您已报名的全部竞赛，掌握开赛时间与赛后官方得分排名</p>
        </div>
      </div>
    </div>

    <!-- 顶部分类 Tab 栏 -->
    <div class="category-tabs-wrap">
      <div class="tabs-inner">
        <div
          v-for="tab in filterTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <main class="content-container">
      <div class="section-title">
        <span>已报名的竞赛</span>
      </div>

      <!-- 竞赛卡片列表展示区 -->
      <div v-loading="loading" class="exam-grid-container">
        <!-- 卡片网格 -->
        <div v-if="filteredList && filteredList.length > 0" class="exam-card-grid">
          <div
            v-for="item in filteredList"
            :key="item.examId"
            class="exam-card"
          >
            <!-- 左侧竞赛封面图与状态角标 -->
            <div class="card-cover">
              <img src="@/assets/images/exam-cover.svg" alt="竞赛封面" class="cover-img" />
              <span
                class="status-badge"
                :class="getStatusBadgeClass(item.contestStatus)"
              >
                {{ item.contestStatusDesc || getStatusText(item.contestStatus) }}
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
                <div class="time-row">
                  <span class="time-label">报名时间:</span>
                  <span class="time-val">{{ item.createTime || '--' }}</span>
                </div>
              </div>

              <!-- 成绩与排名展示（仅完赛状态有效） -->
              <div v-if="item.contestStatus === 2" class="exam-result-info">
                <span class="result-badge score">
                  得分: {{ item.score !== null && item.score !== undefined ? item.score + '分' : '待公布' }}
                </span>
                <span class="result-badge rank">
                  排名: {{ item.examRank ? '第' + item.examRank + '名' : '待公布' }}
                </span>
              </div>

              <div class="card-action">
                <!-- 未开赛状态 -->
                <template v-if="item.contestStatus === 0">
                  <el-button
                    type="success"
                    plain
                    disabled
                    size="default"
                    class="action-btn"
                  >
                    已报名 (等待开赛)
                  </el-button>
                </template>

                <!-- 进行中状态 -->
                <template v-else-if="item.contestStatus === 1">
                  <el-button
                    type="primary"
                    size="default"
                    class="action-btn"
                    @click="handleStartExam(item)"
                  >
                    开始答题
                  </el-button>
                </template>

                <!-- 已完赛状态 -->
                <template v-else-if="item.contestStatus === 2">
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
              </div>
            </div>
          </div>
        </div>

        <!-- 缺省空状态 -->
        <div v-else-if="!loading" class="empty-wrap">
          <el-empty description="暂无符合条件的已报名竞赛" :image-size="120">
            <el-button type="primary" size="small" @click="goToExamList">
              前往竞赛中心报名
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 底部分页器 -->
      <pagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="loadMyExamList"
      />
    </main>
  </div>
</template>

<script src="./MyExamList.js"></script>
<style scoped lang="scss" src="./MyExamList.scss"></style>
