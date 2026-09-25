<template>
  <div class="tag-cascade" :class="{ 'is-multiple': multiple }">
    <!-- 左：标签分类 -->
    <el-select
      :model-value="categoryValue"
      :disabled="disabled"
      class="cascade-category"
      @update:model-value="handleCategoryChange"
    >
      <el-option label="全部分类" :value="ALL" />
      <el-option
        v-for="item in categoryOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 右：所选分类下的标签（多选时右侧显示已选数量与上限） -->
    <div class="cascade-tag-wrap">
      <el-select
        :model-value="tagValue"
        :placeholder="tagPlaceholder"
        :multiple="multiple"
        :multiple-limit="multiple ? multipleLimit : 0"
        :disabled="disabled"
        :loading="loading"
        filterable
        class="cascade-tag"
        @update:model-value="handleTagChange"
      >
        <el-option
          v-if="!multiple"
          label="全部标签"
          :value="ALL"
        />
        <!-- 全部分类时按分类分组 -->
        <template v-if="categoryValue === ALL">
          <el-option-group
            v-for="group in groupedTags"
            :key="group.value"
            :label="group.label"
          >
            <el-option
              v-for="tag in group.tags"
              :key="tag.tagId"
              :label="tag.tagName"
              :value="tag.tagId"
            />
          </el-option-group>
        </template>
        <template v-else>
          <el-option
            v-for="tag in visibleTags"
            :key="tag.tagId"
            :label="tag.tagName"
            :value="tag.tagId"
          />
        </template>
        <!-- 已选标签可能不在当前分类的选项里，名称按ID从全部标签中取 -->
        <template v-if="multiple" #label="{ value }">
          {{ tagNameOf(value) }}
        </template>
      </el-select>
      <span v-if="multiple" class="tag-count">{{ selectedCount }} / {{ multipleLimit }}</span>
    </div>
  </div>
</template>

<script src="./QuestionTagSelect.js"></script>
<style scoped lang="scss" src="./QuestionTagSelect.scss"></style>
