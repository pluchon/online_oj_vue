<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="840px"
    :show-close="false"
    :before-close="handleBeforeClose"
    :destroy-on-close="true"
    class="exam-drawer"
  >
    <div v-loading="detailLoading" class="drawer-body">
      <!-- 竞赛基本信息配置表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="exam-basic-form"
      >
        <!-- 竞赛名称 -->
        <el-form-item label="竞赛名称" prop="title">
          <el-input
            v-model="formData.title"
            maxlength="30"
            clearable
            class="form-title-input"
          />
        </el-form-item>

        <!-- 竞赛周期与保存竞赛信息按钮组合行 -->
        <el-row :gutter="16" class="date-save-row">
          <el-col :xs="24" :sm="18">
            <el-form-item label="竞赛周期" prop="dateRange">
              <el-date-picker
                v-model="formData.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                class="form-date-picker"
                @change="handleDateChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="6" class="save-btn-col">
            <el-form-item label="&nbsp;" class="save-form-item">
              <button
                type="button"
                class="btn-save-basic"
                :disabled="saving"
                @click="handleSaveBasic"
              >
                <span v-if="saving">保存中...</span>
                <span v-else>保存竞赛信息</span>
              </button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 雅致虚线分隔条 -->
      <div class="drawer-divider" />

      <!-- 下方关联题目展示与操作区域（扩大占满到底部） -->
      <div class="exam-questions-section">
        <!-- 栏目头部：左侧统计数量，右侧“添加题目”与“保存题目”操作按钮组 -->
        <div class="section-action-bar">
          <div class="title-wrap">
            <span class="section-title">关联竞赛题目 · 共 {{ boundQuestionList.length }} 题</span>
            <span v-if="!formData.examId" class="section-hint">（请先点击上方“保存竞赛信息”后，即可添加与保存题目）</span>
          </div>

          <div class="action-btn-group">
            <button
              type="button"
              class="btn-add-question"
              :disabled="!formData.examId"
              @click="handleOpenQuestionDialog"
            >
              <el-icon class="btn-icon"><Plus /></el-icon>
              <span>添加题目</span>
            </button>
            <button
              type="button"
              class="btn-save-questions"
              :disabled="!formData.examId || savingQuestions"
              @click="handleSaveQuestions"
            >
              <el-icon class="btn-icon"><Check /></el-icon>
              <span>{{ savingQuestions ? '保存中...' : '保存题目' }}</span>
            </button>
          </div>
        </div>

        <!-- 已绑定题目数据表格（科学列宽，文字截断，绝无多余横向/纵向滚动条，自然铺满到底部） -->
        <el-table
          v-loading="questionLoading"
          :data="boundQuestionList"
          class="custom-exam-question-table"
          header-cell-class-name="editorial-table-header"
          row-class-name="editorial-table-row"
          style="width: 100%"
        >
          <!-- 题目 ID -->
          <el-table-column
            prop="questionId"
            label="题目 ID"
            width="160"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="tabular-code-text">{{ row.questionId }}</span>
            </template>
          </el-table-column>

          <!-- 题目标题 -->
          <el-table-column
            prop="title"
            label="题目标题"
            min-width="240"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="question-title-text">{{ row.title }}</span>
            </template>
          </el-table-column>

          <!-- 题目难度 -->
          <el-table-column
            prop="difficulty"
            label="题目难度"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <DifficultyTag :difficulty="row.difficulty" :desc="row.difficultyDesc" />
            </template>
          </el-table-column>

          <!-- 操作栏 -->
          <el-table-column
            label="操作"
            width="90"
            align="center"
          >
            <template #default="{ row, $index }">
              <button
                type="button"
                class="btn-remove-question"
                @click="handleRemoveQuestion(row, $index)"
              >
                移出
              </button>
            </template>
          </el-table-column>

          <!-- 空数据状态：采用小蒙插画与定制文案 -->
          <template #empty>
            <OjEmpty
              text="当前竞赛尚未关联题目，请点击右上角添加题目"
              :image-size="135"
            />
          </template>
        </el-table>
      </div>
    </div>

    <!-- 题目选择弹窗组件 -->
    <ExamQuestionDialog
      ref="questionDialogRef"
      @selected="handleQuestionsSelected"
    />
  </el-drawer>
</template>

<script src="./ExamDrawer.js"></script>
<style scoped lang="scss" src="./ExamDrawer.scss"></style>
