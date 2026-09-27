<template>
  <section class="exam-panel">
    <div class="card-title">
      <span>最近竞赛</span>
      <el-segmented
        v-model="query.days"
        class="oj-segmented"
        :options="DAYS_OPTIONS"
        @change="handleDaysChange"
      />
    </div>

    <!-- 汇总：报名、参赛按用户去重 -->
    <div class="exam-summary">
      <div v-for="item in summaryItems" :key="item.label" class="summary-item">
        <span class="summary-label">{{ item.label }}</span>
        <span class="summary-value">{{ item.value }}</span>
        <span class="summary-unit">{{ item.unit }}</span>
      </div>
    </div>

    <!-- 竞赛列表（后端分页） -->
    <div v-loading="loading" class="exam-list-wrap">
      <template v-if="!loading">
        <OjEmpty
          v-if="loadError"
          text="竞赛统计加载失败"
          sub-text="请稍后切换时间段重试"
          :image-size="90"
        />
        <OjEmpty
          v-else-if="!rows.length"
          :text="`${currentLabel}没有进行过的竞赛`"
          :image-size="90"
        />
      </template>
      <ol v-if="rows.length" class="exam-list">
        <li v-for="exam in rows" :key="exam.examId" class="exam-item">
          <span class="exam-status" :class="exam.finished ? 'is-finished' : 'is-ongoing'">
            {{ exam.finished ? '已结束' : '进行中' }}
          </span>
          <span class="exam-title" :title="exam.title">{{ exam.title }}</span>
          <span class="exam-time" :title="`${exam.startTime} ~ ${exam.endTime}`">{{ shortTime(exam.startTime) }}</span>
          <span class="exam-count">报名 {{ exam.enrollCount }} · 参赛 {{ exam.participantCount }}</span>
        </li>
      </ol>
    </div>

    <!-- 底部：左侧 AI 分析占位，右侧翻页 -->
    <div class="exam-footer">
      <el-tooltip content="即将上线" placement="top">
        <span class="ai-tag">
          <el-icon><MagicStick /></el-icon>
          AI 分析
        </span>
      </el-tooltip>
      <Pagination
        v-model:page="query.pageNum"
        class="exam-pagination"
        :total="total"
        :limit="query.pageSize"
        layout="prev, pager, next"
        @pagination="loadExams"
      />
    </div>
  </section>
</template>

<script src="./ExamPanel.js"></script>
<style scoped lang="scss" src="./ExamPanel.scss"></style>
