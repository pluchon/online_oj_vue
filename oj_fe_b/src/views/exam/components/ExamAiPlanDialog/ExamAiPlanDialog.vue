<template>
  <OjDialog
    v-model="visible"
    title="AI 帮建"
    width="600px"
    confirm-text="开始生成"
    loading-text="正在挑选题目..."
    :confirm-loading="generating"
    :confirm-disabled="!ready"
    :glowing="generating"
    @confirm="handleGenerate"
  >
    <div class="ai-plan-body">
      <el-input
        v-model="description"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        resize="none"
        :disabled="generating"
        placeholder="描述这场竞赛，如：面向大一新生的动态规划入门赛"
      />

      <!-- 选项行：从左到右排列，后续选项直接往后加 -->
      <div class="option-row">
        <div class="option-item">
          <span class="option-label">难度倾向</span>
          <el-select v-model="tendency" placeholder="请选择" :disabled="generating" class="option-select">
            <el-option
              v-for="item in tendencyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="option-item">
          <span class="option-label">题目数量</span>
          <el-select v-model="countLevel" placeholder="请选择" :disabled="generating" class="option-select">
            <el-option
              v-for="item in countOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
    </div>
  </OjDialog>
</template>

<script src="./ExamAiPlanDialog.js"></script>
<style lang="scss" scoped src="./ExamAiPlanDialog.scss"></style>
