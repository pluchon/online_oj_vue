<template>
  <div class="question-list-page">
    <!-- 顶部全局典雅导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <!-- 品牌标识（仅纯粹的墨衡二字，彻底移除英文） -->
        <div class="brand-area" @click="goToHome">
          <span class="brand-title">墨衡</span>
        </div>

        <!-- 核心导航栏：题库中心、竞赛中心、我的竞赛、消息中心、个人中心 -->
        <nav class="nav-links">
          <router-link to="/question" class="nav-link active">题库中心</router-link>
          <router-link to="/exam" class="nav-link">竞赛中心</router-link>
          <router-link v-if="isLogin" to="/my-exam" class="nav-link">我的竞赛</router-link>
          <router-link v-if="isLogin" to="/message" class="nav-link">消息中心</router-link>
          <router-link v-if="isLogin" to="/user/profile" class="nav-link">个人中心</router-link>
        </nav>

        <!-- 用户行为区（移除铃铛图标，移除下拉菜单，直接展示昵称与退出登录） -->
        <div class="user-action-area">
          <template v-if="isLogin">
            <div class="user-direct-info">
              <el-avatar :size="30" :src="headImage || defaultAvatar" class="user-avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="user-name">{{ nickName || '学员' }}</span>
              <button type="button" class="direct-logout-btn" @click="handleLogout">
                退出登录
              </button>
            </div>
          </template>
          <template v-else>
            <button type="button" class="nav-login-btn" @click="goToLogin">
              登录 / 注册
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主体内容区域（加宽至大气格局） -->
    <main class="main-container">
      <!-- 独立羊皮纸长卷白卡容器（固定底高，不随行数塌陷，翻页器与统计固定底部） -->
      <div class="catalog-canvas-card">
        <!-- 典雅一体化筛选工具栏 -->
        <section class="filter-panel">
          <div class="filter-top-bar">
            <!-- 搜索与重置操作组合区（搜索框在最左侧且内部带放大镜图标，搜索按钮在右侧，重置按钮在搜索按钮右侧） -->
            <div class="search-action-group">
              <div class="search-box">
                <el-icon class="search-icon"><Search /></el-icon>
                <input
                  v-model="queryParams.keyword"
                  type="text"
                  placeholder="搜索题目关键词..."
                  class="search-input"
                  @keyup.enter="handleSearch"
                />
                <span v-if="queryParams.keyword" class="clear-btn" @click="clearKeyword">✕</span>
              </div>
              <button type="button" class="btn-search" @click="handleSearch">
                <el-icon class="btn-icon"><Search /></el-icon>
                <span>搜索</span>
              </button>
              <button type="button" class="btn-reset" @click="handleReset">
                <el-icon class="btn-icon"><RefreshRight /></el-icon>
                <span>重置</span>
              </button>
            </div>

            <!-- 右侧：难度分段控制器 -->
            <div class="difficulty-segment">
              <button
                v-for="item in difficultyOptions"
                :key="item.value ?? 'all'"
                type="button"
                class="segment-btn"
                :class="{ active: queryParams.difficulty === item.value }"
                @click="selectDifficulty(item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </section>

        <!-- 题目列表长卷（固定承载区，不足10条时留白，无数据时居中铺满展示小蒙插画） -->
        <section v-loading="loading" class="question-stream">
          <div class="card-list">
            <template v-if="questionList && questionList.length">
              <div
                v-for="row in questionList"
                :key="row.questionId"
                class="question-card"
                @click="openQuestionDetail(row)"
              >
                <!-- 左侧：纯粹题目标题（彻底剔除无意义题目ID） -->
                <div class="card-left">
                  <span class="question-title">{{ row.title }}</span>
                </div>

                <!-- 中间：题目难度标签（置于攻克状态左侧） + 月相天文隐喻答题状态 + 时空限制 -->
                <div class="card-center">
                  <!-- 难度标签置于是否攻克左边 -->
                  <span class="difficulty-tag" :class="getDifficultyClass(row.difficulty)">
                    {{ row.difficultyDesc || getDifficultyText(row.difficulty) }}
                  </span>

                  <!-- 是否攻克状态 -->
                  <div class="status-lunar" :class="getStatusClass(row)">
                    <span class="lunar-symbol">{{ getStatusSymbol(row) }}</span>
                    <span class="status-text">{{ getStatusText(row) }}</span>
                  </div>

                  <!-- 时空限制 -->
                  <div class="limits-group">
                    <span class="limit-item">
                      <el-icon class="limit-icon"><Timer /></el-icon>
                      {{ row.timeLimit || 1000 }} ms
                    </span>
                    <span class="limit-item">
                      <el-icon class="limit-icon"><Cpu /></el-icon>
                      {{ row.spaceLimit || 128 }} MB
                    </span>
                  </div>
                </div>

                <!-- 右侧：行动按钮（点击直接前往做题） -->
                <div class="card-right" @click.stop="goToQuestionDo(row)">
                  <button type="button" class="arrow-circle-btn" title="开始做题">
                    <svg class="arrow-svg" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </template>

            <!-- 空态（垂直水平居中铺满卡片区域，展示小蒙插画与文字说明） -->
            <div v-else-if="!loading" class="empty-card">
              <img src="@/assets/images/c_not_data_xiaomeng.png" alt="暂无题目数据" class="empty-img" />
              <span class="empty-text">暂无匹配题目数据</span>
            </div>
          </div>

          <!-- 底部固定的统计与翻页控制区（全量状态标签徽章体系） -->
          <div class="pagination-footer">
            <div class="footer-stats-tags">
              <div class="stat-badge total-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">共</span>
                <strong class="badge-num">{{ total }}</strong>
                <span class="badge-unit">道题</span>
              </div>
              <span class="stat-divider">|</span>
              <div class="stat-badge solved-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">已攻克</span>
                <strong class="badge-num">{{ solvedCount }}</strong>
                <span class="badge-unit">道</span>
              </div>
              <div class="stat-badge progress-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">尝试中</span>
                <strong class="badge-num">{{ progressCount }}</strong>
                <span class="badge-unit">道</span>
              </div>
              <div class="stat-badge untouched-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">未尝试</span>
                <strong class="badge-num">{{ untouchedCount }}</strong>
                <span class="badge-unit">道</span>
              </div>
            </div>
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              :page-size="10"
              :total="total"
              layout="prev, pager, next"
              background
              @current-change="handlePageChange"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- 题目详情快速预览公共弹窗 -->
    <oj-dialog
      v-model="detailVisible"
      :title="currentQuestion?.title || '题目详情'"
      width="680px"
      cancel-text="关闭"
      confirm-text="开始做题"
      @confirm="goToQuestionDo(currentQuestion)"
    >
      <div v-if="currentQuestion" class="detail-body">
        <!-- 弹窗元数据标签行（难度、时间限制、空间限制均做成标签徽章） -->
        <div class="dialog-meta-row">
          <span class="meta-tag diff-tag" :class="getDifficultyClass(currentQuestion.difficulty)">
            {{ currentQuestion.difficultyDesc || getDifficultyText(currentQuestion.difficulty) }}
          </span>
          <span class="meta-tag limit-tag">
            <el-icon class="tag-icon"><Timer /></el-icon>
            <span>时间限制: {{ currentQuestion.timeLimit || 1000 }} ms</span>
          </span>
          <span class="meta-tag limit-tag">
            <el-icon class="tag-icon"><Cpu /></el-icon>
            <span>空间限制: {{ currentQuestion.spaceLimit || 128 }} MB</span>
          </span>
        </div>
        <div class="dialog-content-box">
          <p class="content-text">{{ currentQuestion.content }}</p>
        </div>
      </div>
    </oj-dialog>
  </div>
</template>

<script src="./QuestionList.js"></script>
<style scoped lang="scss" src="./QuestionList.scss"></style>
