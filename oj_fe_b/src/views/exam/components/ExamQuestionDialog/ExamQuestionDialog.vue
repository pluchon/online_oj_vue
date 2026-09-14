<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="860px"
    class="exam-question-dialog"
    destroy-on-close
    append-to-body
  >
    <!-- 弹窗自定义标题栏：带红色星号 -->
    <template #header>
      <div class="custom-dialog-title">
        <span class="required-star">*</span>
        <span>选择竞赛题目</span>
      </div>
    </template>

    <div class="dialog-body-content">
      <!-- 顶部筛选栏 -->
      <div class="dialog-filter-bar">
        <div class="filter-left">
          <!-- 题目难度选择下拉框 -->
          <QuestionDifficultySelect
            v-model="queryParams.difficulty"
            include-all
            placeholder="请选择"
            class="dialog-select"
            @change="handleSearch"
          />

          <!-- 题目标题模糊搜索 -->
          <el-input
            v-model="queryParams.title"
            placeholder="请输入您要搜索的题目标题"
            clearable
            class="dialog-input"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />

          <!-- 搜索与重置按钮 -->
          <el-button type="primary" class="btn-dialog-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button class="btn-dialog-reset" @click="handleReset">
            重置
          </el-button>
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
          header-cell-class-name="custom-table-header"
          stripe
          @selection-change="handleSelectionChange"
        >
          <!-- 多选复选框列 -->
          <el-table-column
            type="selection"
            width="55"
            align="center"
            :reserve-selection="true"
            :selectable="isRowSelectable"
          />

          <!-- 题目 ID -->
          <el-table-column
            prop="questionId"
            label="题目id"
            min-width="190"
            align="center"
          />

          <!-- 题目标题 -->
          <el-table-column
            prop="title"
            label="题目标题"
            min-width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.title }}</span>
              <el-tag
                v-if="isBound(row.questionId)"
                size="small"
                type="info"
                effect="plain"
                style="margin-left: 8px;"
              >
                已添加
              </el-tag>
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

          <!-- 空状态 -->
          <template #empty>
            <el-empty description="暂无符合条件的题目数据" :image-size="80" />
          </template>
        </el-table>
      </div>

      <!-- 底部翻页器 -->
      <div class="dialog-pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer-wrapper">
        <el-button
          type="primary"
          plain
          class="btn-submit-binding"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script src="./ExamQuestionDialog.js"></script>
<style scoped lang="scss" src="./ExamQuestionDialog.scss"></style>
