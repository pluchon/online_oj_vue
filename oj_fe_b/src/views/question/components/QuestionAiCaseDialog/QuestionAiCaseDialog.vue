<template>
  <OjDialog
    v-model="visible"
    title="AI 生成用例"
    width="760px"
    :confirm-text="`加入用例列表（${selectedCount} 组）`"
    :show-confirm="previewCases.length > 0"
    :confirm-loading="generating"
    @confirm="handleConfirm"
  >
    <div class="ai-case-body">
      <div v-if="generating" class="case-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>AI 正在出解法、设计用例并运行得到预期输出，约需半分钟到一分钟</span>
      </div>

      <div v-else-if="loadError" class="case-state">
        <span>生成失败</span>
        <el-button size="small" @click="handleGenerate">重试</el-button>
      </div>

      <template v-else-if="previewCases.length">
        <div class="section-head">
          <span class="section-title">预览 · {{ previewCases.length }} 组</span>
          <span v-if="droppedCount" class="section-desc">另有 {{ droppedCount }} 组因解法运行失败或输出过长被丢弃</span>
          <el-button class="btn-regenerate" size="small" @click="handleGenerate">重新生成</el-button>
        </div>
        <div class="preview-list">
          <label
            v-for="(item, index) in previewCases"
            :key="index"
            class="preview-card"
            :class="{ unchecked: !item.checked }"
          >
            <el-checkbox v-model="item.checked" class="preview-check" />
            <div class="preview-main">
              <div class="preview-intent">{{ item.intent || `用例 ${index + 1}` }}</div>
              <div class="preview-line"><span class="line-label">输入</span><code>{{ item.displayInput }}</code></div>
              <div class="preview-line"><span class="line-label">输出</span><code>{{ item.judgeOutput }}</code></div>
            </div>
          </label>
        </div>
      </template>
    </div>
  </OjDialog>
</template>

<script src="./QuestionAiCaseDialog.js"></script>
<style lang="scss" scoped src="./QuestionAiCaseDialog.scss"></style>
