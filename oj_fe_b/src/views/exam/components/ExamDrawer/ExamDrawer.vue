<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="860px"
    class="exam-drawer"
    destroy-on-close
    :before-close="handleBeforeClose"
  >
    <div v-loading="detailLoading" class="drawer-body">
      <!-- 竞赛基本信息配置表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="left"
        label-width="90px"
        class="exam-basic-form"
      >
        <!-- 竞赛名称 -->
        <el-form-item label="竞赛名称" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入竞赛名称"
            maxlength="30"
            show-word-limit
            clearable
            class="form-title-input"
          />
        </el-form-item>

        <!-- 竞赛周期 -->
        <el-form-item label="竞赛周期" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            class="form-date-picker"
            @change="handleDateChange"
          />
        </el-form-item>

        <!-- 保存基本信息按钮 -->
        <el-form-item label=" ">
          <el-button
            type="primary"
            plain
            class="btn-save-basic"
            :loading="saving"
            @click="handleSaveBasic"
          >
            保存
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 分隔线 -->
      <div class="drawer-divider"></div>

      <!-- 下方题目绑定列表展示区 -->
      <div class="exam-questions-section">
        <div class="section-action-bar">
          <el-button
            type="primary"
            link
            class="btn-add-question"
            @click="handleOpenQuestionDialog"
          >
            + 添加题目
          </el-button>
        </div>

        <!-- 已绑定题目数据表格 -->
        <el-table
          v-loading="questionLoading"
          :data="boundQuestionList"
          class="custom-exam-question-table"
          header-cell-class-name="custom-table-header"
          stripe
          style="width: 100%"
        >
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
          />

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

          <!-- 操作栏 -->
          <el-table-column
            label="操作"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-button
                link
                type="danger"
                class="btn-remove-question"
                @click="handleRemoveQuestion(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>

          <!-- 空数据状态 -->
          <template #empty>
            <div class="table-empty-state">
              <el-empty description="暂无数据" :image-size="80" />
            </div>
          </template>
        </el-table>
      </div>
    </div>

    <!-- 题目选择弹窗组件 -->
    <ExamQuestionDialog
      ref="questionDialogRef"
      @success="handleQuestionDialogSuccess"
    />
  </el-drawer>
</template>

<script src="./ExamDrawer.js"></script>
<style scoped lang="scss" src="./ExamDrawer.scss"></style>
