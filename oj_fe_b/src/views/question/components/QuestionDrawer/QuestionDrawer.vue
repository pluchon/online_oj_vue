<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="820px"
    :show-close="false"
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
        <!-- AI 辅助出题入口 -->
        <div class="ai-toolbar">
          <button type="button" class="btn-ai" :disabled="submitting" @click="openDraftDialog">
            <el-icon class="btn-icon"><MagicStick /></el-icon>
            <span>AI 生成题面</span>
          </button>
        </div>

        <!-- 基础配置行：题目标题 -->
        <el-form-item label="题目标题" prop="title">
          <el-input
            v-model="formData.title"
            maxlength="50"
            clearable
            class="form-title-input"
          />
        </el-form-item>

        <!-- 基础配置行：难度、时空限制（响应式三列布局） -->
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-form-item label="题目难度" prop="difficulty">
              <QuestionDifficultySelect
                v-model="formData.difficulty"
                :include-all="false"
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

        <!-- 题目描述：轻量级 Markdown 左右分栏编辑器（左侧编辑，右侧实时排版） -->
        <el-form-item label="题目描述" prop="content">
          <MarkdownEditor
            v-model="formData.content"
            height="290px"
          />
        </el-form-item>

        <!-- 题目用例：标题展示“题目用例 · 共 xx 组”，最右侧展示“添加用例”按钮 -->
        <el-form-item required class="case-form-item">
          <template #label>
            <div class="case-header-row">
              <span class="case-header-title">题目用例 · 共 {{ testCaseList.length }} 组</span>
              <button
                type="button"
                class="btn-ai btn-ai-case"
                :disabled="testCaseList.length >= MAX_CASES || submitting"
                @click="openCaseDialog"
              >
                <el-icon class="btn-icon"><MagicStick /></el-icon>
                <span>AI 生成用例</span>
              </button>
              <button
                type="button"
                class="btn-add-case"
                :disabled="testCaseList.length >= MAX_CASES"
                @click="handleAddTestCase"
              >
                <el-icon class="btn-icon"><Plus /></el-icon>
                <span>添加用例</span>
              </button>
            </div>
          </template>

          <div class="test-case-manager">
            <div class="test-case-list">
              <div
                v-for="(item, index) in testCaseList"
                :key="index"
                class="test-case-card"
              >
                <div class="card-top-bar">
                  <span class="case-index-tag">用例 #{{ index + 1 }}</span>
                  <el-switch
                    v-model="item.isSample"
                    :active-value="CASE_TYPE.SAMPLE"
                    :inactive-value="CASE_TYPE.HIDDEN"
                    active-text="公开示例"
                    inactive-text="隐藏"
                    class="case-sample-switch"
                  />
                  <button
                    v-if="testCaseList.length > 1"
                    type="button"
                    class="btn-delete-case"
                    @click="handleRemoveTestCase(index)"
                  >
                    <el-icon class="del-icon"><Delete /></el-icon>
                    <span>删除</span>
                  </button>
                </div>

                <div class="card-inputs-grid">
                  <div class="input-line">
                    <span class="line-label">展示输入：</span>
                    <el-input
                      v-model="item.displayInput"
                      type="textarea"
                      :autosize="{ minRows: 1, maxRows: 3 }"
                      resize="none"
                      placeholder='题面显示，如 s = "()"'
                      class="case-content-input"
                    />
                  </div>
                  <div class="input-line">
                    <span class="line-label">展示输出：</span>
                    <el-input
                      v-model="item.displayOutput"
                      type="textarea"
                      :autosize="{ minRows: 1, maxRows: 3 }"
                      resize="none"
                      class="case-content-input"
                    />
                  </div>
                  <div class="input-line">
                    <span class="line-label">判题输入：</span>
                    <el-input
                      v-model="item.judgeInput"
                      type="textarea"
                      :autosize="{ minRows: 1, maxRows: 4 }"
                      resize="none"
                      placeholder="按 main 函数约定逐行给出参数"
                      class="case-content-input"
                    />
                  </div>
                  <div class="input-line">
                    <span class="line-label">判题输出：</span>
                    <el-input
                      v-model="item.judgeOutput"
                      type="textarea"
                      :autosize="{ minRows: 1, maxRows: 3 }"
                      resize="none"
                      placeholder="程序应输出的一行结果"
                      class="case-content-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 代码区域标签页切换 -->
        <div class="code-tabs-wrapper">
          <el-tabs v-model="activeCodeTab" class="code-tabs" type="border-card">
            <el-tab-pane label="默认代码模板" name="defaultCode" :lazy="true">
              <el-form-item prop="defaultCode" class="code-form-item">
                <CodeEditor
                  v-model="formData.defaultCode"
                  title="用户默认代码模板"
                  path="inmemory://question/defaultCode.java"
                  height="260px"
                />
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Main 评测函数" name="mainFunc" :lazy="true">
              <el-form-item prop="mainFunc" class="code-form-item">
                <CodeEditor
                  v-model="formData.mainFunc"
                  title="Main 评测函数"
                  path="inmemory://question/mainFunc.java"
                  height="260px"
                />
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>

    <QuestionAiDraftDialog ref="draftDialogRef" @generated="applyDraft" />
    <QuestionAiCaseDialog
      ref="caseDialogRef"
      v-model:standard-code="standardCode"
      @confirm="appendAiCases"
    />

    <!-- 抽屉吸底操作栏 -->
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
