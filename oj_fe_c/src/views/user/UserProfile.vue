<template>
  <div class="user-profile-page">
    <!-- 顶部全局典雅导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <!-- 品牌标识（纯粹的墨衡二字） -->
        <div class="brand-area" @click="goToHome">
          <span class="brand-title">墨衡</span>
        </div>

        <!-- 核心导航栏：题库中心、竞赛中心、我的竞赛、消息中心、个人中心 -->
        <nav class="nav-links">
          <router-link to="/question" class="nav-link">题库中心</router-link>
          <router-link to="/exam" class="nav-link">竞赛中心</router-link>
          <router-link v-if="isLogin" to="/my-exam" class="nav-link">我的竞赛</router-link>
          <router-link v-if="isLogin" to="/message" class="nav-link">消息中心</router-link>
          <router-link v-if="isLogin" to="/user/profile" class="nav-link active">个人中心</router-link>
        </nav>

        <!-- 用户行为区（直连展示头像、昵称与退出登录） -->
        <div class="user-action-area">
          <template v-if="isLogin">
            <div class="user-direct-info">
              <div class="user-avatar-box">
                <img
                  :src="userAvatar"
                  class="user-avatar-img"
                  alt="头像"
                  @error="handleAvatarError"
                />
              </div>
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

    <!-- 主体区域：紧凑饱满单屏格局（彻底杜绝空白留白，无滚动条） -->
    <main class="profile-main-container">
      <!-- 异常重试状态 -->
      <div v-if="hasError" class="state-container error-state">
        <el-empty description="资料加载失败，请检查网络后重试">
          <el-button type="primary" class="btn-retry" @click="loadUserProfile">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 资料内容区域 -->
      <div v-else v-loading="pageLoading" class="profile-content-layout">
        <!-- 左侧：学者档案卡片 (~340px，内容饱满紧凑) -->
        <aside class="profile-sidebar-card">
          <!-- 顶部头像与基础标识 -->
          <div class="sidebar-top-section">
            <div class="avatar-ring-wrap">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :http-request="handleAvatarUpload"
                :before-upload="beforeAvatarUpload"
                accept="image/jpeg,image/png,image/webp,image/gif"
              >
                <div class="avatar-inner-box">
                  <img
                    :src="profileAvatar"
                    class="scholar-avatar-img"
                    alt="学者头像"
                    @error="handleProfileAvatarError"
                  />
                  <div class="avatar-hover-mask">
                    <el-icon class="hover-icon"><Camera /></el-icon>
                    <span class="hover-text">更换头像</span>
                  </div>
                </div>
              </el-upload>
            </div>

            <!-- 昵称（无修改图标） -->
            <div class="scholar-name-row">
              <h2 class="scholar-name">{{ formData.nickName || userProfile.nickName || '墨衡学者' }}</h2>
            </div>

            <!-- 状态徽章与 ID -->
            <div class="scholar-tags-row">
              <span class="status-badge">正常</span>
              <div class="oj-id-badge" @click="copyOjId" title="点击复制 ID">
                <span class="oj-id-text">ID: {{ userProfile.userId || userProfile.id || '0949_TGx7' }}</span>
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </div>

            <!-- 一句话用户格言/简介（纯粹引用排版，无多余标题框） -->
            <div class="scholar-quote-wrap">
              <p class="quote-sentence">
                “{{ userProfile.introduce || formData.introduce || defaultIntroduce }}”
              </p>
            </div>
          </div>

          <!-- 个人档案元信息列表 -->
          <div class="scholar-meta-list">
            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><Calendar /></el-icon>
                <span class="meta-label">注册时间</span>
              </div>
              <span class="meta-value">{{ formatRegisterTime(userProfile.createTime) }}</span>
            </div>

            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><Female v-if="formData.sex === 2" /><Male v-else /></el-icon>
                <span class="meta-label">性别</span>
              </div>
              <span class="meta-value">{{ userProfile.sexDesc || getSexText(formData.sex) }}</span>
            </div>

            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><School /></el-icon>
                <span class="meta-label">学校</span>
              </div>
              <span class="meta-value">{{ userProfile.schoolName || formData.schoolName || '暂未填写' }}</span>
            </div>

            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><Trophy /></el-icon>
                <span class="meta-label">专业</span>
              </div>
              <span class="meta-value">{{ userProfile.majorName || formData.majorName || '暂未填写' }}</span>
            </div>

            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><Message /></el-icon>
                <span class="meta-label">邮箱</span>
              </div>
              <span class="meta-value">{{ userProfile.email || formData.email || '暂未填写' }}</span>
            </div>

            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><ChatDotRound /></el-icon>
                <span class="meta-label">微信</span>
              </div>
              <span class="meta-value">{{ userProfile.wechat || formData.wechat || '暂未填写' }}</span>
            </div>

            <div class="meta-item">
              <div class="item-left">
                <el-icon class="meta-icon"><ChatLineRound /></el-icon>
                <span class="meta-label">QQ</span>
              </div>
              <span class="meta-value">{{ userProfile.qq || formData.qq || '暂未填写' }}</span>
            </div>
          </div>

          <!-- 编辑资料操作按钮 -->
          <div class="sidebar-action-wrap">
            <button type="button" class="btn-scholar-edit" @click="openEditDialog">
              <el-icon class="btn-icon"><Edit /></el-icon>
              <span>编辑资料</span>
            </button>
          </div>
        </aside>

        <!-- 右侧：核心看板（紧凑精致双卡布局，去除多余空白留白） -->
        <section class="profile-dashboard-content">
          <!-- 1. 数据总览卡片（高度紧凑贴合，横向四维 + 雷达图） -->
          <div class="dashboard-card overview-card">
            <div class="overview-top-bar">
              <h3 class="overview-title">数据总览</h3>
              <div class="time-filter-wrap">
                <el-select
                  v-model="overviewTimeRange"
                  class="time-select"
                  popper-class="oj-select-popper"
                  size="small"
                  @change="handleTimeRangeChange"
                >
                  <el-option label="全部时间" value="all" />
                  <el-option label="近一年" value="year" />
                  <el-option label="近一月" value="month" />
                  <el-option label="本周" value="week" />
                </el-select>
              </div>
            </div>

            <div class="overview-content-row">
              <!-- 左侧四项核心指标（纵向细线严格分隔） -->
              <div class="stats-section">
                <!-- 已解决指标（带左右精细铜版画月桂双枝） -->
                <div class="stat-col solved-col">
                  <div class="stat-val-wrap">
                    <svg class="laurel-branch left" viewBox="0 0 28 54" fill="none">
                      <path d="M24 48 C10 40 7 24 16 6" stroke="#967b5b" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M20 42 C14 40 12 36 16 34 C19 36 21 39 20 42 Z" fill="#967b5b"/>
                      <path d="M14 32 C9 30 7 26 11 24 C15 26 16 29 14 32 Z" fill="#967b5b"/>
                      <path d="M12 22 C7 20 6 15 11 13 C14 15 15 19 12 22 Z" fill="#967b5b"/>
                      <path d="M13 12 C10 9 11 6 15 5 C17 7 16 10 13 12 Z" fill="#967b5b"/>
                    </svg>
                    <span class="stat-num">{{ statsData.solvedCount }}</span>
                    <svg class="laurel-branch right" viewBox="0 0 28 54" fill="none">
                      <path d="M4 48 C18 40 21 24 12 6" stroke="#967b5b" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M8 42 C14 40 16 36 12 34 C9 36 7 39 8 42 Z" fill="#967b5b"/>
                      <path d="M14 32 C19 30 21 26 17 24 C13 26 12 29 14 32 Z" fill="#967b5b"/>
                      <path d="M16 22 C21 20 22 15 17 13 C14 15 13 19 16 22 Z" fill="#967b5b"/>
                      <path d="M15 12 C18 9 17 6 13 5 C11 7 12 10 15 12 Z" fill="#967b5b"/>
                    </svg>
                  </div>
                  <span class="stat-name">已解决</span>
                </div>

                <div class="stat-divider"></div>

                <!-- 尝试中 -->
                <div class="stat-col">
                  <div class="stat-val-wrap">
                    <span class="stat-num">{{ statsData.tryingCount }}</span>
                  </div>
                  <span class="stat-name">尝试中</span>
                </div>

                <div class="stat-divider"></div>

                <!-- 提交次数 -->
                <div class="stat-col">
                  <div class="stat-val-wrap">
                    <span class="stat-num">{{ statsData.submitCount }}</span>
                  </div>
                  <span class="stat-name">提交次数</span>
                </div>

                <div class="stat-divider"></div>

                <!-- 通过率 -->
                <div class="stat-col">
                  <div class="stat-val-wrap">
                    <span class="stat-num">{{ statsData.passRate }}</span>
                  </div>
                  <span class="stat-name">通过率</span>
                </div>
              </div>

              <!-- 中间纵向贯通分割线 -->
              <div class="section-divider"></div>

              <!-- 右侧五维能力雷达图 -->
              <div class="radar-section">
                <svg class="radar-svg" viewBox="0 0 240 180">
                  <!-- 4圈等分五边形同心同轴参考网格 -->
                  <polygon points="120,86 135.2,97.0 129.4,114.9 110.6,114.9 104.8,97.0" class="radar-grid-line" />
                  <polygon points="120,70 150.4,92.1 138.8,127.9 101.2,127.9 89.6,92.1" class="radar-grid-line" />
                  <polygon points="120,54 165.6,87.1 148.2,140.8 91.8,140.8 74.4,87.1" class="radar-grid-line" />
                  <polygon points="120,38 180.8,82.2 157.6,153.8 82.4,153.8 59.2,82.2" class="radar-grid-outer" />

                  <!-- 5条径向发射轴线 -->
                  <line x1="120" y1="102" x2="120" y2="38" class="radar-axis-line" />
                  <line x1="120" y1="102" x2="180.8" y2="82.2" class="radar-axis-line" />
                  <line x1="120" y1="102" x2="157.6" y2="153.8" class="radar-axis-line" />
                  <line x1="120" y1="102" x2="82.4" y2="153.8" class="radar-axis-line" />
                  <line x1="120" y1="102" x2="59.2" y2="82.2" class="radar-axis-line" />

                  <!-- 能力覆盖多边形 -->
                  <polygon
                    :points="radarPoints"
                    class="radar-data-area"
                  />

                  <!-- 维度文字说明 -->
                  <text x="120" y="24" class="radar-text" text-anchor="middle">数据结构</text>
                  <text x="190" y="86" class="radar-text" text-anchor="start">算法思维</text>
                  <text x="166" y="170" class="radar-text" text-anchor="start">代码实现</text>
                  <text x="74" y="170" class="radar-text" text-anchor="end">数学基础</text>
                  <text x="50" y="86" class="radar-text" text-anchor="end">竞赛基础</text>
                </svg>
              </div>
            </div>
          </div>

          <!-- 2. 解题日历卡片（扩充至30周，色块示例置于右侧，年份切换） -->
          <div class="dashboard-card solution-calendar-card">
            <div class="calendar-top-bar">
              <h3 class="calendar-title">解题日历</h3>
              <div class="year-navigator">
                <button type="button" class="btn-year-arrow" @click="prevCalendarYear" title="上一年">
                  <el-icon><ArrowLeft /></el-icon>
                </button>
                <span class="current-year-label">{{ calendarYearLabel }}</span>
                <button type="button" class="btn-year-arrow" @click="nextCalendarYear" title="下一年">
                  <el-icon><ArrowRight /></el-icon>
                </button>
              </div>
            </div>

            <div class="calendar-content-row">
              <!-- 左侧热力图部分（包含精准月份标尺、星期标尺与52周热力方块） -->
              <div class="heatmap-main-area">
                <!-- 顶部月份分布指示标签（与下方列槽100%严格垂直对齐） -->
                <div class="matrix-month-row">
                  <div class="month-row-spacer"></div>
                  <div class="matrix-month-cols">
                    <div
                      v-for="(week, wIdx) in calendarHeatmap"
                      :key="wIdx"
                      class="month-col-slot"
                    >
                      <span v-if="week.monthName" class="month-name-tag">{{ week.monthName }}</span>
                    </div>
                  </div>
                </div>

                <div class="heatmap-matrix-flow">
                  <!-- 星期标尺 -->
                  <div class="matrix-day-labels">
                    <span class="day-lbl">Mon</span>
                    <span class="day-lbl">Wed</span>
                    <span class="day-lbl">Fri</span>
                  </div>

                  <!-- 52周矩阵列（饱满横向舒展） -->
                  <div class="matrix-columns-flow">
                    <div
                      v-for="(week, wIdx) in calendarHeatmap"
                      :key="wIdx"
                      class="matrix-week-col"
                    >
                      <span
                        v-for="(day, dIdx) in week.days"
                        :key="dIdx"
                        class="heatmap-cell"
                        :class="'level-' + day.level"
                        @mouseenter="onCellMouseEnter($event, day)"
                        @mouseleave="onCellMouseLeave"
                      ></span>
                    </div>
                  </div>

                  <!-- 鼠标悬浮黑色小"v"箭头提示框（不引起滚动条与形变） -->
                  <div
                    v-if="tooltipState.visible"
                    class="calendar-dark-tooltip"
                    :style="{ left: tooltipState.x + 'px', top: tooltipState.y + 'px' }"
                  >
                    <span class="tooltip-text">{{ tooltipState.text }}</span>
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </div>

              <!-- 右侧题词铭文与色块示例（与右上角铜版画植物叶饰相呼应） -->
              <div class="calendar-inscription-wrap">
                <blockquote class="inscription-quote">
                  “ 每一次提交，<br />
                  都是向更远处迈出的一小步。 ”
                </blockquote>
                <cite class="inscription-author">—— Sic Parvis Magna</cite>

                <!-- 色块示例置于右侧 -->
                <div class="calendar-legend-bar">
                  <span class="legend-text">较少</span>
                  <div class="legend-squares">
                    <span class="legend-square level-0"></span>
                    <span class="legend-square level-1"></span>
                    <span class="legend-square level-2"></span>
                    <span class="legend-square level-3"></span>
                    <span class="legend-square level-4"></span>
                  </div>
                  <span class="legend-text">较多</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 编辑个人资料公共弹窗（标准无滚动条 Dialog） -->
    <oj-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="640px"
      cancel-text="取消"
      confirm-text="保存修改"
      :confirm-loading="saving"
      @confirm="handleSaveProfile"
      @cancel="closeEditDialog"
    >
      <div class="profile-dialog-form-wrap">
        <el-form
          ref="profileFormRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          class="scholar-edit-form"
        >
          <div class="dialog-form-grid">
            <!-- 昵称 -->
            <el-form-item label="用户昵称" prop="nickName">
              <el-input
                v-model="formData.nickName"
                placeholder="请输入2-32位用户昵称"
                maxlength="32"
                clearable
              />
            </el-form-item>

            <!-- 性别 -->
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="formData.sex" class="scholar-radio-group">
                <el-radio :label="0">保密</el-radio>
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 电子邮箱 -->
            <el-form-item label="电子邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入常用电子邮箱（选填）"
                clearable
              />
            </el-form-item>

            <!-- 学校名称 -->
            <el-form-item label="学校名称" prop="schoolName">
              <el-input
                v-model="formData.schoolName"
                placeholder="例如：清华大学（选填）"
                maxlength="100"
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

            <!-- QQ号 -->
            <el-form-item label="QQ号" prop="qq">
              <el-input
                v-model="formData.qq"
                placeholder="请输入QQ号（选填）"
                maxlength="20"
                clearable
              />
            </el-form-item>

            <!-- 专业名称（跨两列） -->
            <el-form-item label="专业名称" prop="majorName" class="grid-span-2">
              <el-input
                v-model="formData.majorName"
                placeholder="例如：计算机科学与技术（选填）"
                maxlength="100"
                clearable
              />
            </el-form-item>
          </div>

          <!-- 个人简介（自适应伸缩文本框） -->
          <el-form-item label="个人简介" prop="introduce" class="bio-form-item">
            <el-input
              v-model="formData.introduce"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              placeholder="书写您对于算法的感悟、研究方向或座右铭..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </oj-dialog>
  </div>
</template>

<script src="./UserProfile.js"></script>
<style lang="scss" scoped src="./UserProfile.scss"></style>
