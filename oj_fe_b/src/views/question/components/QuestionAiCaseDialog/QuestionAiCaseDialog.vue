<template>
  <OjDialog
    v-model="visible"
    title="AI 生成用例"
    width="880px"
    :confirm-text="previewCases.length ? `加入用例列表（${selectedCount} 组）` : '生成用例'"
    loading-text="生成中，模型出题并运行标程约需一分钟..."
    :confirm-loading="generating"
    @confirm="handleConfirm"
  >
    <div class="ai-case-body">
      <!-- 标程与数量 -->
      <div class="ai-case-section">
        <div class="section-head">
          <span class="section-title">标程</span>
          <span class="section-desc">与用户提交格式相同的方法实现，只用于运行得到预期输出，不会保存</span>
        </div>
        <CodeEditor
          v-model="standardCodeModel"
          title="标程"
          path="inmemory://question/standardCode.java"
          height="220px"
          :read-only="generating"
        />
        <div class="count-row">
          <span class="count-label">生成组数</span>
          <el-input-number
            v-model="count"
            :min="1"
            :max="maxCount"
            :disabled="generating"
            controls-position="right"
            class="count-input"
          />
          <el-button
            v-if="previewCases.length"
            :disabled="generating"
            @click="handleGenerate"
          >
            重新生成
          </el-button>
        </div>
      </div>

      <!-- 预览 -->
      <div v-if="previewCases.length" class="ai-case-section">
        <div class="section-head">
          <span class="section-title">预览 · {{ previewCases.length }} 组</span>
          <span v-if="droppedCount" class="section-desc">另有 {{ droppedCount }} 组因标程运行失败或输出过长被丢弃</span>
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
      </div>
    </div>
  </OjDialog>
</template>

<script src="./QuestionAiCaseDialog.js"></script>
<style lang="scss" scoped src="./QuestionAiCaseDialog.scss"></style>
