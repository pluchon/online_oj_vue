<template>
  <div class="message-center-page">
    <!-- 顶部全局典雅导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <!-- 品牌标识（仅纯粹的墨衡二字，彻底移除英文） -->
        <div class="brand-area" @click="goToHome">
          <span class="brand-title">墨衡</span>
        </div>

        <!-- 核心导航栏：题库中心、竞赛中心、我的竞赛、消息中心、个人中心 -->
        <nav class="nav-links">
          <router-link to="/question" class="nav-link">题库中心</router-link>
          <router-link to="/exam" class="nav-link">竞赛中心</router-link>
          <router-link v-if="isLogin" to="/my-exam" class="nav-link">我的竞赛</router-link>
          <router-link v-if="isLogin" to="/message" class="nav-link active">消息中心</router-link>
          <router-link v-if="isLogin" to="/user/profile" class="nav-link">个人中心</router-link>
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

    <!-- 主体内容区域（加宽至1360px大气格局） -->
    <main class="main-container">
      <div class="message-canvas-card">
        <!-- 顶部操作工具条（彻底移除多余卡片标题，左侧下拉筛选与一键已读，右侧搜索与重置） -->
        <section class="message-action-toolbar">
          <div class="toolbar-left">
            <!-- 通知类型下拉筛选 -->
            <el-select
              v-model="currentCategory"
              class="category-select"
              popper-class="oj-select-popper"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>

            <!-- 标记全部已读按钮（置于通知类型下拉框右侧） -->
            <button
              type="button"
              class="btn-mark-all"
              :class="{ disabled: unreadCount === 0 || loading }"
              :disabled="unreadCount === 0 || loading"
              @click="handleReadAll"
            >
              <el-icon class="btn-icon"><Check /></el-icon>
              <span>标记全部已读</span>
            </button>
          </div>

          <!-- 右侧：搜索框与操作按钮 -->
          <div class="toolbar-right">
            <div class="search-box">
              <el-icon class="search-icon"><Search /></el-icon>
              <input
                v-model="keyword"
                type="text"
                placeholder="搜索消息关键词..."
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <span v-if="keyword" class="clear-btn" @click="clearKeyword">✕</span>
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

        <!-- 编年史时间轴消息流展示区 -->
        <section v-loading="loading" class="timeline-message-section">
          <div v-if="timelineGroups && timelineGroups.length > 0" class="chronicle-feed">
            <div
              v-for="group in timelineGroups"
              :key="group.year"
              class="timeline-year-group"
            >
              <!-- 时间线上方的年份节点标记（下方贯穿该年份的消息流） -->
              <div class="year-milestone-marker">
                <div class="marker-axis">
                  <span class="year-capsule">{{ group.year }}</span>
                  <span class="milestone-dot"></span>
                </div>
                <div class="milestone-line"></div>
              </div>

              <!-- 该年份下的消息流条目 -->
              <div
                v-for="item in group.items"
                :key="item.messageId"
                class="chronicle-entry"
                :class="{ 'is-unread': item.isRead === 0 }"
              >
                <!-- 左侧时间轴节点（仅展示月.日，年份已在上方标定） -->
                <div class="entry-timeline-axis">
                  <span class="timeline-date">{{ getMonthDay(item.createTime) }}</span>
                  <div class="timeline-node" :class="{ unread: item.isRead === 0 }">
                    <span class="node-dot"></span>
                  </div>
                </div>

                <!-- 右侧学者消息卡片（紧凑对称、高质感） -->
                <div
                  class="entry-message-card"
                  :class="{ 'card-unread': item.isRead === 0 }"
                  @click="openMessageDetail(item)"
                >
                  <!-- 左侧：分类图标底座 -->
                  <div class="card-avatar-box" :class="getTypeInfo(item).typeClass">
                    <component :is="getTypeInfo(item).iconComponent" class="type-icon" />
                  </div>

                  <!-- 中间：主体信息（标题 + 分类 + 未读标记 + 摘要） -->
                  <div class="card-content-wrap">
                    <div class="card-title-row">
                      <h3 class="message-title">{{ item.title || '系统通知' }}</h3>
                      <span class="type-badge" :class="getTypeInfo(item).typeClass">
                        {{ getTypeInfo(item).label }}
                      </span>
                      <span
                        class="read-state-badge"
                        :class="item.isRead === 0 ? 'badge-unread' : 'badge-read'"
                      >
                        <span class="badge-dot"></span>
                        {{ item.isRead === 0 ? '未读' : '已读' }}
                      </span>
                    </div>

                    <p class="message-summary">{{ item.content }}</p>
                  </div>

                  <!-- 右侧：时间与查看详情操作（对称布局，上下对应） -->
                  <div class="card-action-side">
                    <span class="message-time">{{ item.createTime || '--' }}</span>
                    <div class="detail-action-link">
                      <span>查看详情</span>
                      <svg class="arrow-svg" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 缺省空态（水平垂直居中展示小蒙插画与文字说明） -->
          <div v-else-if="!loading" class="empty-card">
            <img src="@/assets/images/c_not_data_xiaomeng.png" alt="暂无消息" class="empty-img" />
            <span class="empty-text">暂无相关消息通知</span>
          </div>

          <!-- 底部分页与全量状态统计徽章（带 | 分割线） -->
          <div class="pagination-footer">
            <div class="footer-stats-tags">
              <div class="stat-badge total-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">共</span>
                <strong class="badge-num">{{ total }}</strong>
                <span class="badge-unit">条通知</span>
              </div>
              <span class="stat-divider">|</span>
              <div class="stat-badge unread-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">未读</span>
                <strong class="badge-num">{{ unreadCount }}</strong>
                <span class="badge-unit">条</span>
              </div>
              <div class="stat-badge read-badge">
                <span class="badge-dot"></span>
                <span class="badge-label">已读</span>
                <strong class="badge-num">{{ readCount }}</strong>
                <span class="badge-unit">条</span>
              </div>
            </div>

            <el-pagination
              v-model:current-page="pageQuery.pageNum"
              :page-size="pageQuery.pageSize"
              :total="total"
              layout="prev, pager, next"
              background
              @current-change="handlePageChange"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- 消息详情公共弹窗（右上角提供 x 关闭，彻底移除底部关闭栏与横线） -->
    <oj-dialog
      v-model="detailVisible"
      :title="currentMessage?.title || '通知详情'"
      width="680px"
      :show-close="true"
      :show-footer="false"
    >
      <div v-if="currentMessage" class="message-dialog-body">
        <!-- 弹窗元数据标签行（分类、发送时间、已读/未读状态做成规整标签徽章） -->
        <div class="dialog-meta-row">
          <span class="meta-tag type-tag" :class="getTypeInfo(currentMessage).typeClass">
            <el-icon class="tag-icon"><component :is="getTypeInfo(currentMessage).iconComponent" /></el-icon>
            <span>{{ getTypeInfo(currentMessage).label }}</span>
          </span>
          <span class="meta-tag time-tag">
            <el-icon class="tag-icon"><Clock /></el-icon>
            <span>{{ currentMessage.createTime || '--' }}</span>
          </span>
          <span
            class="meta-tag status-tag"
            :class="currentMessage.isRead === 0 ? 'unread' : 'read'"
          >
            <span class="status-dot"></span>
            <span>{{ currentMessage.isRead === 0 ? '未读' : '已读' }}</span>
          </span>
        </div>

        <!-- 正文卡片框（雅致学者宣纸容器） -->
        <div class="dialog-content-box">
          <p class="content-text">{{ currentMessage.content }}</p>
        </div>
      </div>
    </oj-dialog>
  </div>
</template>

<script src="./Message.js"></script>
<style scoped lang="scss" src="./Message.scss"></style>
