<template>
  <OjDialog
    v-model="visible"
    title="AI 生成题面"
    width="560px"
    confirm-text="生成草稿"
    loading-text="生成中，约需半分钟..."
    :confirm-loading="generating"
    @confirm="handleGenerate"
  >
    <div class="ai-draft-body">
      <el-input
        v-model="description"
        type="textarea"
        :rows="5"
        maxlength="500"
        show-word-limit
        resize="none"
        :disabled="generating"
        placeholder="一句话描述题目，如：给定整数数组和目标值，找出和为目标值的两个下标"
      />
      <p class="ai-draft-tip">生成结果会填入当前表单，确认无误后再保存。</p>
    </div>
  </OjDialog>
</template>

<script src="./QuestionAiDraftDialog.js"></script>
<style lang="scss" scoped src="./QuestionAiDraftDialog.scss"></style>
