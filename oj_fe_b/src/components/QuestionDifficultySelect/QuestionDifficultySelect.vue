<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :size="size"
    class="difficulty-select"
    @update:model-value="handleUpdateValue"
    @change="handleChange"
  >
    <el-option
      v-if="includeAll"
      :label="allLabel"
      :value="null"
    />
    <el-option
      v-for="item in difficultyOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script src="./QuestionDifficultySelect.js"></script>
<style scoped lang="scss" src="./QuestionDifficultySelect.scss"></style>
