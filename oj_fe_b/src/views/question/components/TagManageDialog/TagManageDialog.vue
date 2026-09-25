<template>
  <OjDialog
    v-model="visible"
    title="标签管理"
    width="620px"
    :show-footer="false"
  >
    <div class="tag-manage-body">
      <!-- 新增标签 -->
      <div class="tag-add-row">
        <el-input
          v-model="addForm.tagName"
          :maxlength="MAX_TAG_NAME_LENGTH"
          placeholder="标签名称"
          class="tag-name-input"
          :disabled="saving"
          @keyup.enter="handleAdd"
        />
        <el-select
          v-model="addForm.category"
          class="tag-category-select"
          :disabled="saving"
        >
          <el-option
            v-for="item in TAG_CATEGORY_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <button
          type="button"
          class="btn-tag-add"
          :disabled="saving"
          @click="handleAdd"
        >
          <el-icon class="btn-icon"><Plus /></el-icon>
          <span>添加</span>
        </button>
      </div>

      <!-- 标签列表（按分类分组） -->
      <div v-loading="loading" class="tag-list-area">
        <div v-if="loadError" class="tag-state">
          <span>标签加载失败</span>
          <button type="button" class="btn-retry" @click="loadTags">重试</button>
        </div>
        <div v-else-if="!loading && tags.length === 0" class="tag-state">
          <span>还没有标签，在上方添加</span>
        </div>
        <template v-else>
          <section
            v-for="group in groupedTags"
            :key="group.value"
            class="tag-group"
          >
            <div class="tag-group-header">
              <h4 class="tag-group-title">{{ group.label }}</h4>
              <span class="tag-group-count">共 {{ group.tags.length }} 个标签</span>
            </div>
            <div
              v-for="tag in group.tags"
              :key="tag.tagId"
              class="tag-row"
            >
              <!-- 编辑态 -->
              <template v-if="editingId === tag.tagId">
                <el-input
                  v-model="editForm.tagName"
                  :maxlength="MAX_TAG_NAME_LENGTH"
                  class="tag-name-input"
                  :disabled="saving"
                  @keyup.enter="handleSaveEdit(tag)"
                />
                <el-select
                  v-model="editForm.category"
                  class="tag-category-select"
                  :disabled="saving"
                >
                  <el-option
                    v-for="item in TAG_CATEGORY_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <div class="tag-row-actions">
                  <button type="button" class="row-btn row-btn-primary" :disabled="saving" @click="handleSaveEdit(tag)">保存</button>
                  <button type="button" class="row-btn" :disabled="saving" @click="cancelEdit">取消</button>
                </div>
              </template>

              <!-- 展示态 -->
              <template v-else>
                <span class="tag-name">{{ tag.tagName }}</span>
                <span class="tag-count">{{ tag.questionCount }} 题</span>
                <div class="tag-row-actions">
                  <button type="button" class="row-btn" :disabled="saving" @click="startEdit(tag)">编辑</button>
                  <button type="button" class="row-btn row-btn-danger" :disabled="saving" @click="handleDelete(tag)">删除</button>
                </div>
              </template>
            </div>
          </section>
        </template>
      </div>
    </div>
  </OjDialog>
</template>

<script src="./TagManageDialog.js"></script>
<style lang="scss" scoped src="./TagManageDialog.scss"></style>
