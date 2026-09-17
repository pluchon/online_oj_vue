<template>
  <div class="question-list-page">
    <!-- 顶部全局导航栏 -->
    <header class="global-navbar">
      <div class="nav-inner">
        <div class="brand-area" @click="goToHome">
          <img src="@/assets/images/logo.png" alt="Logo" class="brand-logo" />
          <span class="brand-title">比特OJ 在线代码评测平台</span>
        </div>
        <div class="nav-links">
          <router-link to="/question" class="nav-link active">题库中心</router-link>
          <router-link to="/exam" class="nav-link">竞赛中心</router-link>
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

    <!-- 主体内容容器 -->
    <main class="main-container">
      <!-- 搜索与筛选工具栏 -->
      <section class="toolbar-card">
        <div class="toolbar-row">
          <div class="search-input-box">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索题目标题或内容关键字 (ES分词检索)..."
              clearable
              class="keyword-input"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" class="search-btn" @click="handleSearch">
              搜索
            </el-button>
            <el-button class="reset-btn" @click="handleReset">
              重置
            </el-button>
          </div>

          <div class="filter-group">
            <span class="filter-label">难度筛选:</span>
            <div class="difficulty-pills">
              <span
                v-for="item in difficultyOptions"
                :key="item.value"
                class="diff-pill"
                :class="[
                  item.className,
                  { active: queryParams.difficulty === item.value }
                ]"
                @click="selectDifficulty(item.value)"
              >
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 题目列表表格 -->
      <section class="table-card">
        <div class="table-header-info">
          <div class="info-left">
            <span class="info-title">全部题目</span>
            <span class="info-badge">共 {{ total }} 道</span>
          </div>
          <div class="info-right">
            <el-button
              type="primary"
              link
              :loading="syncLoading"
              class="sync-btn"
              @click="handleManualSync"
            >
              <el-icon><Refresh /></el-icon>
              <span>同步题库索引</span>
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="questionList"
          row-key="questionId"
          class="question-table"
          stripe
          empty-text="暂无匹配题目"
        >
          <el-table-column label="编号" prop="questionId" width="180">
            <template #default="{ row }">
              <span class="question-id-text">#{{ row.questionId }}</span>
            </template>
          </el-table-column>

          <el-table-column label="题目标题" min-width="260">
            <template #default="{ row }">
              <div class="title-cell" @click="openQuestionDetail(row)">
                <span class="question-title-link">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="难度" prop="difficulty" width="120" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getDifficultyTagType(row.difficulty)"
                effect="light"
                round
                class="diff-tag"
              >
                {{ row.difficultyDesc || '未知' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="时间限制" prop="timeLimit" width="140" align="center">
            <template #default="{ row }">
              <span class="limit-text">{{ row.timeLimit || 1000 }} ms</span>
            </template>
          </el-table-column>

          <el-table-column label="空间限制" prop="spaceLimit" width="140" align="center">
            <template #default="{ row }">
              <span class="limit-text">{{ row.spaceLimit || 128 }} MB</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="130" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                class="action-btn"
                @click="openQuestionDetail(row)"
              >
                查看题目
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <Pagination
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="fetchQuestionList"
          />
        </div>
      </section>
    </main>

    <!-- 题目详情预览弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="题目详情"
      width="700px"
      destroy-on-close
      class="question-detail-dialog"
    >
      <div v-if="currentQuestion" class="detail-body">
        <div class="detail-header">
          <h2 class="detail-title">{{ currentQuestion.title }}</h2>
          <div class="detail-tags">
            <el-tag :type="getDifficultyTagType(currentQuestion.difficulty)" round>
              {{ currentQuestion.difficultyDesc }}
            </el-tag>
            <span class="tag-divider">|</span>
            <span class="tag-limit">时间限制: {{ currentQuestion.timeLimit }} ms</span>
            <span class="tag-divider">|</span>
            <span class="tag-limit">空间限制: {{ currentQuestion.spaceLimit }} MB</span>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">题目描述</h4>
          <div class="section-content text-content">
            {{ currentQuestion.content }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./QuestionList.js"></script>
<style scoped lang="scss" src="./QuestionList.scss"></style>
