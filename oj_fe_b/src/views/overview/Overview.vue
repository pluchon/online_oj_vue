<template>
  <div v-loading="loading" class="overview-panel">
    <!-- 顶部：更新时间与刷新 -->
    <div class="overview-header">
      <span class="overview-updated">{{ updatedAt ? `更新于 ${updatedAt}` : '' }}</span>
      <button class="btn-refresh" type="button" :disabled="loading" @click="loadOverview">
        <el-icon class="btn-icon"><Refresh /></el-icon>
        <span>刷新</span>
      </button>
    </div>

    <!-- 加载失败且没有旧数据 -->
    <OjEmpty
      v-if="loadError && !overview"
      text="数据概览加载失败"
      sub-text="请稍后点击刷新重试"
      :image-size="130"
    />

    <template v-else-if="overview">
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div v-for="card in statCards" :key="card.label" class="stat-card">
          <span class="stat-label">{{ card.label }}</span>
          <span class="stat-value">{{ card.value }}</span>
          <span class="stat-sub">{{ card.sub }}</span>
        </div>
      </div>

      <div class="overview-row">
        <!-- 近 7 天趋势 -->
        <section class="overview-card trend-card">
          <div class="card-title">近 7 天趋势</div>
          <TrendChart v-if="overview.week.submitCount > 0" :data="overview.trend" />
          <OjEmpty v-else text="近 7 天没有提交" :image-size="110" />
        </section>

        <!-- 最近竞赛 -->
        <section class="overview-card exam-card">
          <div class="card-title">最近竞赛</div>
          <div v-if="exam" class="exam-body">
            <div class="exam-title-row">
              <span class="exam-title">{{ exam.title }}</span>
              <span class="exam-status" :class="exam.finished ? 'is-finished' : 'is-ongoing'">
                {{ exam.finished ? '已结束' : '进行中' }}
              </span>
            </div>
            <div class="exam-time">{{ exam.startTime }} ~ {{ exam.endTime }}</div>
            <div class="exam-numbers">
              <div class="exam-number">
                <span class="number-value">{{ exam.enrollCount }}</span>
                <span class="number-label">报名人数</span>
              </div>
              <div class="exam-number">
                <span class="number-value">{{ exam.participantCount }}</span>
                <span class="number-label">实际参赛</span>
              </div>
              <div class="exam-number">
                <span class="number-value">{{ participationRate }}</span>
                <span class="number-label">参赛率</span>
              </div>
            </div>
          </div>
          <OjEmpty v-else text="还没有开赛的竞赛" :image-size="100" />
        </section>
      </div>

      <!-- 难题榜 -->
      <section class="overview-card hard-card">
        <div class="card-title">
          难题榜
          <span class="card-hint">已出结论的提交满 5 条的题中，通过率最低的 5 道</span>
        </div>
        <ol v-if="overview.hardQuestions.length" class="hard-list">
          <li v-for="(item, index) in overview.hardQuestions" :key="item.questionId" class="hard-item">
            <span class="hard-rank">{{ index + 1 }}</span>
            <span class="hard-title">{{ item.title || '已删除的题目' }}</span>
            <span class="hard-difficulty">{{ item.difficultyDesc || '-' }}</span>
            <span class="hard-count">通过 {{ item.passCount }} / {{ item.judgedCount }}</span>
            <div class="hard-rate">
              <div class="rate-track">
                <div class="rate-fill" :style="{ width: `${item.passRate || 0}%` }" />
              </div>
              <span class="rate-text">{{ formatRate(item.passRate) }}</span>
            </div>
            <button type="button" class="btn-view-submits" @click="viewAppeals(item)">查看申诉</button>
          </li>
        </ol>
        <OjEmpty v-else text="暂无已出结论提交满 5 条的题目" :image-size="100" />
      </section>
    </template>
  </div>
</template>

<script src="./Overview.js"></script>
<style scoped lang="scss" src="./Overview.scss"></style>
