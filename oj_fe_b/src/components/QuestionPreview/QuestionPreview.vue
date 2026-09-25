<template>
  <OjDialog
    v-model="visible"
    title="题目详情"
    width="780px"
    :show-footer="false"
  >
    <div v-loading="loading" class="question-preview">
      <div v-if="loadFailed" class="preview-state">
        <span>题目加载失败</span>
        <button type="button" class="btn-retry" @click="loadDetail">重试</button>
      </div>

      <template v-else-if="question">
        <!-- 标题与属性 -->
        <div class="preview-header">
          <h2 class="preview-title">{{ question.title }}</h2>
          <div class="preview-tags">
            <DifficultyTag :difficulty="question.difficulty" :desc="question.difficultyDesc" />
            <span class="limit-pill">
              <el-icon><Timer /></el-icon>
              {{ question.timeLimit ?? '--' }} ms
            </span>
            <span class="limit-pill">
              <el-icon><Coin /></el-icon>
              {{ question.spaceLimit ?? '--' }} MB
            </span>
            <span
              v-for="tag in question.tags || []"
              :key="tag.tagId"
              class="topic-tag"
            >{{ tag.tagName }}</span>
          </div>
        </div>

        <!-- 题目描述 -->
        <div class="preview-section">
          <div class="description-text" v-html="descriptionHtml"></div>
        </div>

        <!-- 示例 -->
        <div v-if="examples.length > 0" class="preview-section">
          <h3 class="section-title">示例</h3>
          <div class="examples-grid">
            <div
              v-for="(item, index) in examples"
              :key="index"
              class="example-card"
              :class="{ 'is-wide': isLongExample(item) }"
            >
              <div class="example-card-header">示例 {{ index + 1 }}</div>
              <div class="example-card-row">
                <span class="row-label">输入</span>
                <pre class="row-code">{{ item.input }}</pre>
              </div>
              <div class="example-card-row">
                <span class="row-label">输出</span>
                <pre class="row-code">{{ item.output }}</pre>
              </div>
              <div v-if="item.explain" class="example-card-row">
                <span class="row-label">解释</span>
                <span class="row-explain">{{ item.explain }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 提示 -->
        <div v-if="hints.length > 0" class="preview-section">
          <h3 class="section-title">提示</h3>
          <ul class="hints-list">
            <li v-for="(hint, index) in hints" :key="index">{{ hint }}</li>
          </ul>
        </div>
      </template>

      <div v-else-if="!loading" class="preview-state">
        <OjEmpty text="题目不存在或已被删除" :image-size="120" />
      </div>
    </div>
  </OjDialog>
</template>

<script src="./QuestionPreview.js"></script>
<style lang="scss" scoped src="./QuestionPreview.scss"></style>
