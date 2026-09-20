<template>
  <OjDialog
    v-model="visible"
    title="选择竞赛题目"
    width="880px"
    :show-footer="false"
  >
    <div class="dialog-body-content">
      <!-- 顶部筛选栏：左侧难度与题目标题筛选，右侧搜索与重置按钮 -->
      <div class="dialog-filter-bar">
        <div class="filter-left">
          <span class="filter-label">题目难度</span>
          <QuestionDifficultySelect
            v-model="queryParams.difficulty"
            include-all
            all-label="全部难度"
            class="dialog-select"
            @change="handleSearch"
          />

          <span class="filter-label">搜索题目标题</span>
          <el-input
            v-model="queryParams.title"
            clearable
            class="dialog-input"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </div>

        <div class="filter-right">
          <button type="button" class="btn-dialog-search" @click="handleSearch">
            <el-icon class="btn-icon"><Search /></el-icon>
            <span>搜索</span>
          </button>
          <button type="button" class="btn-dialog-reset" @click="handleReset">
            <el-icon class="btn-icon"><Refresh /></el-icon>
            <span>重置</span>
          </button>
        </div>
      </div>

      <!-- 题目勾选表格 -->
      <div class="dialog-table-wrapper">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="questionList"
          row-key="questionId"
          class="custom-dialog-table"
          header-cell-class-name="editorial-table-header"
          row-class-name="editorial-table-row"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <!-- 多选复选框列 -->
          <el-table-column
            type="selection"
            width="50"
            align="center"
            :reserve-selection="true"
            :selectable="isRowSelectable"
          />

          <!-- 题目 ID -->
          <el-table-column
            prop="questionId"
            label="题目 ID"
            min-width="170"
            align="center"
          >
            <template #default="{ row }">
              <span class="tabular-code-text">{{ row.questionId }}</span>
            </template>
          </el-table-column>

          <!-- 题目标题 -->
          <el-table-column
            prop="title"
            label="题目标题"
            min-width="220"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="question-title-text">{{ row.title }}</span>
              <span
                v-if="isBound(row.questionId)"
                class="bound-badge"
              >
                已添加
              </span>
            </template>
          </el-table-column>

          <!-- 题目难度 -->
          <el-table-column
            prop="difficulty"
            label="题目难度"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <DifficultyTag :difficulty="row.difficulty" :desc="row.difficultyDesc" />
            </template>
          </el-table-column>

          <!-- 空状态：采用小蒙定制插画与针对性文案 -->
          <template #empty>
            <OjEmpty
              text="暂无题目可供选择"
              sub-text="未检索到符合条件的题目，可调整难度或关键词后重试"
              :image-size="125"
            />
          </template>
        </el-table>
      </div>

      <!-- 底部控制栏：左侧放置翻页器（共几条放在翻页器右侧），最右侧放置“确认”按钮（内含白色对勾），无多余分割横线 -->
      <div class="dialog-bottom-bar">
        <div class="dialog-pagination-wrapper">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            :pager-count="5"
            layout="prev, pager, next, total"
            class="custom-pagination"
            @current-change="handleCurrentChange"
          />
        </div>

        <button
          type="button"
          class="btn-confirm-action"
          @click="handleSubmit"
        >
          <el-icon class="btn-check-icon"><Check /></el-icon>
          <span>确认</span>
        </button>
      </div>
    </div>
  </OjDialog>
</template>

<script src="./ExamQuestionDialog.js"></script>
<style scoped lang="scss" src="./ExamQuestionDialog.scss"></style>
