<template>
  <div class="exam-list-page">
    <!-- 顶部全局典雅导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <!-- 品牌标识（纯粹墨衡二字） -->
        <div class="brand-area" @click="goToHome">
          <span class="brand-title">墨衡</span>
        </div>

        <!-- 核心导航栏：题库中心、竞赛中心、我的竞赛、消息中心、个人中心 -->
        <nav class="nav-links">
          <router-link to="/question" class="nav-link">题库中心</router-link>
          <router-link to="/exam" class="nav-link active">竞赛中心</router-link>
          <router-link v-if="isLogin" to="/my-exam" class="nav-link">我的竞赛</router-link>
          <router-link v-if="isLogin" to="/message" class="nav-link">消息中心</router-link>
          <router-link v-if="isLogin" to="/user/profile" class="nav-link">个人中心</router-link>
        </nav>

        <!-- 用户行为区（直连展示昵称与退出登录） -->
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
            <button type="button" class="nav-login-btn" @click="handleLogin">
              登录 / 注册
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主体内容区域（加宽至大气格局，一页8场，一行4场） -->
    <main class="main-container">
      <div class="exam-canvas-card">
        <!-- 友好轻量筛选栏（最左侧左右滑块时间筛选，搜索框左侧完赛情况筛选下拉框） -->
        <section class="filter-header-bar">
          <!-- 左侧：左右滑块切换时间筛选（丝滑动画，选择全部/本日/本周/本月/近半年） -->
          <div class="filter-left-group">
            <div class="slider-segment-control" ref="sliderContainerRef">
              <div class="slider-indicator" :style="sliderIndicatorStyle"></div>
              <button
                v-for="(item, index) in timeFilterOptions"
                :key="item.value"
                :ref="el => setTabRef(el, index)"
                type="button"
                class="slider-btn"
                :class="{ active: currentTimeFilter === item.value }"
                @click="selectTimeFilter(item.value, index)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <!-- 右侧：完赛状态下拉框 + 标题搜索 + 搜索按钮 + 重置按钮 -->
          <div class="search-action-group">
            <!-- 完赛状态下拉框（全部、未完赛、历史竞赛） -->
            <el-select
              v-model="currentCategory"
              class="status-select"
              popper-class="oj-select-popper"
              placeholder="完赛情况"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="opt in contestCategoryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- 搜索框 -->
            <div class="search-box">
              <el-icon class="search-icon"><Search /></el-icon>
              <input
                v-model="queryParams.title"
                type="text"
                placeholder="搜索竞赛名称..."
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <span v-if="queryParams.title" class="clear-btn" @click="clearKeyword">✕</span>
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
        </section>

        <!-- 竞赛卡片列表展示区（一行4个，一页8个） -->
        <section v-loading="loading" class="exam-stream-section">
          <div v-if="examList && examList.length > 0" class="exam-card-grid">
            <div
              v-for="item in examList"
              :key="item.examId"
              class="exam-card"
            >
              <!-- 封面图（使用官方规范默认竞赛图） -->
              <div class="card-cover">
                <img src="../../assets/images/c_competition_picture.jpg" alt="竞赛" class="cover-img" />
              </div>

              <!-- 竞赛信息与行动 -->
              <div class="card-body">
                <!-- 标题与最右侧开赛状态角标 -->
                <div class="exam-title-row">
                  <span class="exam-title" :title="item.title">{{ item.title }}</span>
                  <span class="status-badge" :class="getStatusInfo(item).badgeClass">
                    {{ getStatusInfo(item).text }}
                  </span>
                </div>

                <!-- 时间图标 + 开始时间 - 结束时间 -->
                <div class="meta-row time-row">
                  <el-icon class="meta-icon"><Clock /></el-icon>
                  <span class="time-range">{{ item.startTime || '--' }} 至 {{ item.endTime || '--' }}</span>
                </div>

                <!-- 参赛人数与题目数量（移除两项之间的“·”） -->
                <div class="meta-row stats-row">
                  <span class="stat-item">
                    <el-icon class="stat-icon"><User /></el-icon>
                    <span>{{ item.enterCount ?? item.isEnterCount ?? 0 }} 人参赛</span>
                  </span>
                  <span class="stat-item">
                    <el-icon class="stat-icon"><Document /></el-icon>
                    <span>{{ item.questionCount ?? 0 }} 道题目</span>
                  </span>
                </div>

                <!-- 底部行动按钮 -->
                <div class="card-action">
                  <!-- 已完赛状态：双按钮（竞赛练习 + 查看排名） -->
                  <template v-if="getStatusInfo(item).phase === 'ended'">
                    <button
                      type="button"
                      class="btn-exam-outline"
                      @click="handlePractice(item)"
                    >
                      竞赛练习
                    </button>
                    <button
                      type="button"
                      class="btn-exam-primary"
                      @click="handleRank(item)"
                    >
                      查看排名
                    </button>
                  </template>

                  <!-- 未完赛状态：单按钮（报名参赛 / 已报名 / 开始答题 / 已开赛） -->
                  <template v-else>
                    <button
                      type="button"
                      class="btn-exam-primary"
                      :class="{ disabled: getStatusInfo(item).disabled }"
                      :disabled="getStatusInfo(item).disabled || Boolean(enrollLoadingMap[item.examId])"
                      @click="handleActionClick(item)"
                    >
                      {{ Boolean(enrollLoadingMap[item.examId]) ? '报名中...' : getStatusInfo(item).btnText }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 缺省空态（水平垂直居中展示小蒙插画与说明） -->
          <div v-else-if="!loading" class="empty-card">
            <img src="@/assets/images/c_not_data_xiaomeng.png" alt="暂无竞赛数据" class="empty-img" />
            <span class="empty-text">暂无符合条件的竞赛数据</span>
          </div>

          <!-- 底部分页控制栏（左下角展示进行中、未开赛、已完赛全量状态徽章） -->
          <div class="pagination-footer">
            <div class="footer-stats-tags">
              <div class="stat-badge total-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">共</span>
                <strong class="badge-num">{{ total }}</strong>
                <span class="badge-unit">场竞赛</span>
              </div>
              <span class="stat-divider">|</span>
              <div class="stat-badge ongoing-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">进行中</span>
                <strong class="badge-num">{{ ongoingCount }}</strong>
                <span class="badge-unit">场</span>
              </div>
              <div class="stat-badge upcoming-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">未开赛</span>
                <strong class="badge-num">{{ upcomingCount }}</strong>
                <span class="badge-unit">场</span>
              </div>
              <div class="stat-badge ended-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">已完赛</span>
                <strong class="badge-num">{{ endedCount }}</strong>
                <span class="badge-unit">场</span>
              </div>
            </div>
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              :page-size="8"
              :total="total"
              layout="prev, pager, next"
              background
              @current-change="loadExamList"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- 竞赛排名弹窗 -->
    <exam-rank-dialog
      v-model="rankDialog.visible"
      :exam-id="rankDialog.examId"
      :exam-title="rankDialog.title"
    />

    <!-- 通用确认弹窗 -->
    <oj-dialog
      v-model="confirmDialog.visible"
      :title="confirmDialog.title"
      width="420px"
      :confirm-text="confirmDialog.confirmText"
      @confirm="handleConfirmDialog"
    >
      <p class="confirm-dialog-text">{{ confirmDialog.content }}</p>
    </oj-dialog>
  </div>
</template>

<script src="./ExamList.js"></script>
<style scoped lang="scss" src="./ExamList.scss"></style>
