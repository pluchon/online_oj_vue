<template>
  <div class="exam-rank-page">
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
          <router-link v-if="isLogin" to="/message" class="nav-link">消息中心</router-link>
        </div>
        <div class="user-action-area">
          <template v-if="isLogin">
            <div class="msg-bell-trigger" title="消息中心" @click="goToMessage">
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
                  <el-dropdown-item command="message">
                    <el-icon><Bell /></el-icon>
                    <span>消息中心</span>
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
            <el-button type="primary" size="small" @click="goToLogin">
              登录 / 注册
            </el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 竞赛头部横幅与基本信息 -->
    <div class="rank-banner-section">
      <div class="banner-inner">
        <div class="back-bar">
          <el-button link class="back-link" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回竞赛大厅</span>
          </el-button>
        </div>
        <div class="exam-title-row">
          <h1 class="exam-main-title">{{ examDetail.title || '算法与编程竞赛' }}</h1>
          <el-tag
            :type="getStatusTagType(examDetail.contestStatus)"
            effect="dark"
            class="status-tag"
          >
            {{ examDetail.contestStatusDesc || '已完赛' }}
          </el-tag>
        </div>
        <div class="exam-meta-row">
          <span class="meta-item">
            <el-icon><Calendar /></el-icon>
            比赛时间：{{ examDetail.startTime || '-' }} 至 {{ examDetail.endTime || '-' }}
          </span>
          <span class="meta-item">
            <el-icon><User /></el-icon>
            参赛人数：<strong>{{ total }}</strong> 人
          </span>
          <el-button
            v-if="examDetail.contestStatus === 2"
            type="primary"
            size="small"
            plain
            class="refresh-btn"
            :loading="loading"
            @click="refreshData"
          >
            <el-icon><Refresh /></el-icon>
            <span>刷新榜单</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <main class="rank-main-container">
      <!-- 冠亚季军领奖台 (Top 3 Podium) -->
      <section v-if="topThreeList.length > 0" class="podium-card">
        <div class="podium-header">
          <el-icon class="podium-trophy-icon"><Trophy /></el-icon>
          <span class="podium-title">荣耀领奖台 · Top 3 巅峰榜</span>
        </div>
        <div class="podium-stage">
          <!-- 亚军 (第 2 名) -->
          <div v-if="topThreeList[1]" class="podium-col second-place">
            <div class="player-avatar-wrap">
              <el-avatar :size="64" :src="topThreeList[1].headImage || defaultAvatar" class="avatar-silver" />
              <div class="medal-icon silver-medal">🥈</div>
            </div>
            <div class="player-name">{{ topThreeList[1].nickName }}</div>
            <div class="player-score">{{ topThreeList[1].score }} 分</div>
            <div class="player-ac">通过 {{ topThreeList[1].acceptCount }} 题</div>
            <div class="pillar pillar-silver">
              <span class="pillar-rank">2</span>
            </div>
          </div>

          <!-- 冠军 (第 1 名) -->
          <div v-if="topThreeList[0]" class="podium-col first-place">
            <div class="crown-icon">👑</div>
            <div class="player-avatar-wrap">
              <el-avatar :size="76" :src="topThreeList[0].headImage || defaultAvatar" class="avatar-gold" />
              <div class="medal-icon gold-medal">🥇</div>
            </div>
            <div class="player-name">{{ topThreeList[0].nickName }}</div>
            <div class="player-score-gold">{{ topThreeList[0].score }} 分</div>
            <div class="player-ac">通过 {{ topThreeList[0].acceptCount }} 题</div>
            <div class="pillar pillar-gold">
              <span class="pillar-rank">1</span>
            </div>
          </div>

          <!-- 季军 (第 3 名) -->
          <div v-if="topThreeList[2]" class="podium-col third-place">
            <div class="player-avatar-wrap">
              <el-avatar :size="60" :src="topThreeList[2].headImage || defaultAvatar" class="avatar-bronze" />
              <div class="medal-icon bronze-medal">🥉</div>
            </div>
            <div class="player-name">{{ topThreeList[2].nickName }}</div>
            <div class="player-score">{{ topThreeList[2].score }} 分</div>
            <div class="player-ac">通过 {{ topThreeList[2].acceptCount }} 题</div>
            <div class="pillar pillar-bronze">
              <span class="pillar-rank">3</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 当前选手个人战报卡片 -->
      <section class="my-rank-banner">
        <div class="banner-left">
          <div class="rank-badge-icon">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="rank-desc-wrap">
            <template v-if="isLogin && myRank && myRank.examRank">
              <div class="my-rank-title">
                我的个人战报
                <span class="highlight-rank">第 {{ myRank.examRank }} 名</span>
                <span class="total-rank-info">/ 共 {{ total }} 人</span>
              </div>
              <div class="my-rank-stats">
                <span>总分：<strong>{{ myRank.score }}</strong> 分</span>
                <span class="stat-divider">|</span>
                <span>通过：<strong>{{ myRank.acceptCount }}</strong> 题</span>
                <span class="stat-divider">|</span>
                <span>提交：<strong>{{ myRank.submitCount }}</strong> 次</span>
              </div>
            </template>
            <template v-else-if="isLogin">
              <div class="my-rank-title un-enrolled">您暂未参加本次竞赛</div>
              <div class="my-rank-stats">竞赛结束后开放题库练习，欢迎前往题库中心提升实力</div>
            </template>
            <template v-else>
              <div class="my-rank-title un-login">登录即可查看您在本次竞赛中的个人战绩与排名</div>
            </template>
          </div>
        </div>
        <div v-if="!isLogin" class="banner-right">
          <el-button type="primary" size="small" @click="goToLogin">去登录</el-button>
        </div>
      </section>

      <!-- 完整排名榜单表格卡片 -->
      <div class="rank-table-card">
        <div class="table-card-header">
          <div class="header-title-group">
            <el-icon class="title-icon"><Histogram /></el-icon>
            <span class="title-text">全员排名总榜</span>
          </div>
          <span class="total-count-text">共 {{ total }} 名参赛选手</span>
        </div>

        <el-table
          v-loading="loading"
          :data="rankList"
          row-class-name="rank-table-row"
          class="leaderboard-table"
          stripe
        >
          <template #empty>
            <el-empty description="暂无排名记录或竞赛尚未有提交产生" />
          </template>

          <!-- 排名列 -->
          <el-table-column label="排名" width="100" align="center">
            <template #default="{ row }">
              <div class="rank-col-badge">
                <span v-if="row.examRank === 1" class="top-rank rank-1">🥇 1</span>
                <span v-else-if="row.examRank === 2" class="top-rank rank-2">🥈 2</span>
                <span v-else-if="row.examRank === 3" class="top-rank rank-3">🥉 3</span>
                <span v-else class="normal-rank">{{ row.examRank }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 参赛选手列 -->
          <el-table-column label="参赛选手" min-width="200">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="36" :src="row.headImage || defaultAvatar" class="cell-avatar" />
                <span class="user-nickname" :class="{ 'is-me': row.isCurrentUser }">
                  {{ row.nickName }}
                </span>
                <el-tag v-if="row.isCurrentUser" size="small" type="danger" effect="dark" class="me-tag">
                  我
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 总得分列 -->
          <el-table-column label="竞赛得分" min-width="120" align="center">
            <template #default="{ row }">
              <span class="score-value">{{ row.score }}</span>
            </template>
          </el-table-column>

          <!-- AC题目数列 -->
          <el-table-column label="通过题数" min-width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.acceptCount > 0 ? 'success' : 'info'" size="small" effect="light">
                {{ row.acceptCount }} 题 AC
              </el-tag>
            </template>
          </el-table-column>

          <!-- 提交次数列 -->
          <el-table-column label="提交次数" min-width="110" align="center">
            <template #default="{ row }">
              <span class="submit-count-text">{{ row.submitCount }} 次</span>
            </template>
          </el-table-column>

          <!-- 最后一次有效提交时间 -->
          <el-table-column label="最后有效提交 / 用时" min-width="180" align="center">
            <template #default="{ row }">
              <span class="submit-time-text">{{ row.lastSubmitTime || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <div class="pagination-footer">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pageQuery.pageNum"
            :page-size="pageQuery.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./ExamRank.js"></script>
<style lang="scss" scoped src="./ExamRank.scss"></style>
