<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="760px"
    :before-close="handleBeforeClose"
    :destroy-on-close="true"
    class="question-drawer"
  >
    <div v-loading="detailLoading" class="drawer-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="question-form"
      >
        <!-- 基础配置行：标题 -->
        <el-form-item label="题目标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入题目标题（如：两数之和）"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 基础配置行：难度、时空限制（响应式三列布局） -->
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-form-item label="题目难度" prop="difficulty">
              <QuestionDifficultySelect
                v-model="formData.difficulty"
                :include-all="false"
                placeholder="请选择难度"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="时间限制（毫秒）" prop="timeLimit">
              <el-input-number
                v-model="formData.timeLimit"
                :min="1"
                :max="100000"
                :step="500"
                controls-position="right"
                class="full-width-number"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="空间限制（MB）" prop="spaceLimit">
              <el-input-number
                v-model="formData.spaceLimit"
                :min="1"
                :max="2048"
                :step="64"
                controls-position="right"
                class="full-width-number"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 题目描述：富文本编辑器 -->
        <el-form-item label="题目描述" prop="content">
          <RichTextEditor
            v-model="formData.content"
            height="260px"
            placeholder="请在此排版题目的详细描述、输入输出要求及示例说明..."
          />
        </el-form-item>

        <!-- 题目用例 -->
        <el-form-item label="题目用例" prop="questionCase">
          <el-input
            v-model="formData.questionCase"
            type="textarea"
            :rows="3"
            placeholder="请输入题目用例数据（格式可为文本或 JSON 字符串）"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <!-- 代码区域标签页切换 -->
        <div class="code-tabs-wrapper">
          <el-tabs v-model="activeCodeTab" class="code-tabs" type="border-card">
            <el-tab-pane label="默认代码模板" name="defaultCode">
              <el-form-item prop="defaultCode" class="code-form-item">
                <CodeEditor
                  v-model="formData.defaultCode"
                  title="用户默认代码模板"
                  height="260px"
                />
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Main 评测函数" name="mainFunc">
              <el-form-item prop="mainFunc" class="code-form-item">
                <CodeEditor
                  v-model="formData.mainFunc"
                  title="系统评测运行入口"
                  height="260px"
                />
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>

    <!-- 抽屉吸底按钮操作栏 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button :disabled="submitting" @click="handleClose">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="detailLoading"
          @click="handleSubmit"
        >
          保存提交
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script src="./QuestionDrawer.js"></script>
<style lang="scss" scoped src="./QuestionDrawer.scss"></style>
