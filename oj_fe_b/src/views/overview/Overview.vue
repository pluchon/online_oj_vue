<template>
  <div class="overview-panel">
    <!-- 统计卡片：每项一行 -->
    <div class="stat-cards">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <span class="stat-label">{{ card.label }}</span>
        <span class="stat-value">{{ card.value }}</span>
        <span class="stat-unit">{{ card.unit }}</span>
      </div>
    </div>

    <!-- 提交趋势（独占一行，可切时间范围） -->
    <TrendPanel />

    <!-- 最近竞赛与难题榜：左右各半、等高 -->
    <div class="overview-row">
      <ExamPanel />

      <section class="hard-card">
        <div class="card-title">
          <span class="title-with-hint">
            难题榜
            <el-tooltip content="已出结论的提交满 5 条的题中，通过率最低的 5 道" placement="top">
              <el-icon class="hint-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </span>
        </div>

        <div v-loading="loading" class="hard-list-wrap">
          <template v-if="!loading">
            <OjEmpty
              v-if="loadError"
              text="难题榜加载失败"
              sub-text="请稍后重新进入本页"
              :image-size="90"
            />
            <OjEmpty
              v-else-if="!hardQuestions.length"
              text="暂无已出结论提交满 5 条的题目"
              :image-size="90"
            />
          </template>
          <ol v-if="hardQuestions.length" class="hard-list">
            <li v-for="(item, index) in hardQuestions" :key="item.questionId" class="hard-item">
              <span class="hard-rank">{{ index + 1 }}</span>
              <span class="hard-title" :title="item.title">{{ item.title || '已删除的题目' }}</span>
              <span class="difficulty-chip" :class="difficultyClass(item.difficulty)">{{ item.difficultyDesc || '-' }}</span>
              <span class="rate-chip">通过率 {{ formatRate(item.passRate) }}</span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  </div>
</template>

<script src="./Overview.js"></script>
<style scoped lang="scss" src="./Overview.scss"></style>
