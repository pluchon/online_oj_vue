<template>
  <oj-dialog
    v-model="visible"
    :title="`${examTitle} 赛后复盘`"
    width="760px"
    :show-close="true"
    :show-footer="false"
    :glowing="generating"
    :close-on-click-modal="!generating"
  >
    <div class="review-body">
      <div v-if="loading" class="review-state">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>

      <div v-else-if="generating && !review" class="review-state">
        正在整理你这场的提交并生成复盘，大约需要 10 秒
      </div>

      <div v-else-if="!review" class="review-state">
        <span>{{ failed ? '复盘生成失败' : '复盘加载失败' }}</span>
        <button type="button" class="btn-retry" @click="reload">重试</button>
      </div>

      <div v-else class="review-result" :class="{ 'is-stale': generating }">
        <!-- 成绩概览：每项一行 -->
        <div class="overview-row">
          <div class="overview-item">
            <span class="overview-label">得分</span>
            <span class="overview-value">{{ review.score ?? 0 }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">排名</span>
            <span class="overview-value">{{ review.examRank ?? '-' }}<small> / {{ review.participantCount }}</small></span>
          </div>
          <div class="overview-item">
            <span class="overview-label">通过</span>
            <span class="overview-value">{{ review.passedCount }}<small> / {{ review.questionCount }} 题</small></span>
          </div>
        </div>

        <!-- 整体总结 -->
        <p v-if="review.summary" class="summary-note">{{ review.summary }}</p>

        <!-- 逐题回顾 -->
        <h4 class="section-title">
          <el-icon class="section-icon"><Tickets /></el-icon>
          逐题回顾
          <span class="title-tags">
            <span v-if="counts.failed" class="chip tone-fail">{{ counts.failed }} 道未通过</span>
            <span v-if="counts.unsubmitted" class="chip tone-warning">{{ counts.unsubmitted }} 道未提交</span>
            <span class="chip tone-muted">共 {{ review.questionCount }} 题</span>
          </span>
        </h4>
        <div v-for="(item, index) in review.questions" :key="item.questionId" class="question-row">
          <div class="question-head">
            <span class="question-no" :class="statusOf(item)" :title="statusLabel(item)">{{ index + 1 }}</span>
            <span class="question-title" :title="item.title">{{ item.title }}</span>
            <span class="chip" :class="difficultyClass(item.difficulty)">{{ item.difficultyDesc }}</span>
            <span class="question-tags">
              <template v-if="item.submitCount">
                <span class="chip tone-muted">提交 {{ item.submitCount }} 次</span>
                <span v-if="item.passed" class="chip tone-pass">第 {{ item.passMinutes }} 分钟通过</span>
                <span v-else class="chip tone-fail">最后一次{{ item.lastVerdict || '未通过' }}</span>
              </template>
              <span class="chip tone-muted">全场通过率 {{ formatRate(item.passRate) }}</span>
            </span>
          </div>
          <p v-if="item.comment" class="question-comment">{{ item.comment }}</p>
        </div>

        <!-- 左侧生成时间，右侧重新生成 -->
        <div class="footer-row">
          <span class="generated-time">生成于 {{ formatTime(review.generatedTime) }}</span>
          <button
            type="button"
            class="btn-regenerate"
            :disabled="generating || !review.regenerateRemaining"
            @click="confirmVisible = true"
          >
            <el-icon><RefreshRight /></el-icon>
            <span>{{ review.regenerateRemaining ? `重新生成（剩 ${review.regenerateRemaining} 次）` : '重新生成次数已用完' }}</span>
          </button>
        </div>
      </div>
    </div>
  </oj-dialog>

  <!-- 重新生成确认 -->
  <oj-dialog
    v-model="confirmVisible"
    title="重新生成复盘"
    width="420px"
    confirm-text="重新生成"
    :message="`新的复盘会覆盖当前内容，这场竞赛还能重新生成 ${review?.regenerateRemaining ?? 0} 次。`"
    @confirm="handleRegenerateConfirm"
  />
</template>

<script src="./ExamReviewDialog.js"></script>
<style lang="scss" scoped src="./ExamReviewDialog.scss"></style>
