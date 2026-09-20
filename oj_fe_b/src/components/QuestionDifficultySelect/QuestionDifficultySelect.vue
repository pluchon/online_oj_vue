<template>
  <el-select
    :model-value="selectValue"
    :placeholder="displayPlaceholder"
    :clearable="clearable"
    :disabled="disabled"
    :size="size"
    popper-class="editorial-difficulty-popper"
    class="difficulty-select"
    @update:model-value="handleUpdateValue"
    @change="handleChange"
  >
    <el-option
      v-if="includeAll"
      :label="allLabel"
      value="ALL"
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
