<template>
  <div class="question-do-page" v-loading="pageLoading">
    <!-- 顶部状态栏与返回导航 -->
    <header class="do-header">
      <div class="header-left">
        <el-button link class="back-btn" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>{{ isExamMode ? '返回竞赛' : '返回题目列表' }}</span>
        </el-button>
        <span class="divider">|</span>
        <span class="mode-badge" :class="{ 'is-exam': isExamMode }">
          {{ isExamMode ? '竞赛答题模式' : '日常练习模式' }}
        </span>
      </div>

      <div class="header-center">
        <span class="exam-title-badge" v-if="isExamMode && examTitle">
          {{ examTitle }}
        </span>
      </div>

      <div class="header-right">
        <el-button
          type="primary"
          class="submit-top-btn"
          :loading="submitting"
          @click="handleSubmit"
        >
          <el-icon><Check /></el-icon>
          <span>提交代码</span>
        </el-button>
      </div>
    </header>

    <!-- 主工作台双栏容器 -->
    <main class="do-workbench">
      <!-- 左栏：题目描述与上下题导航 -->
      <section class="panel-left">
        <div class="panel-header">
          <div class="tab-item active">
            <el-icon><Document /></el-icon>
            <span>题目描述</span>
          </div>

          <div class="nav-actions">
            <el-button
              size="small"
              class="nav-btn"
              text
              :disabled="!preQuestionId || navLoading"
              @click="handlePreQuestion"
            >
              <span>上一题</span>
              <el-icon><ArrowLeft /></el-icon>
            </el-button>

            <el-button
              size="small"
              class="nav-btn"
              text
              :disabled="!nextQuestionId || navLoading"
              @click="handleNextQuestion"
            >
              <el-icon><ArrowRight /></el-icon>
              <span>下一题</span>
            </el-button>
          </div>
        </div>

        <div class="panel-body">
          <template v-if="question">
            <h1 class="question-title">{{ question.title }}</h1>

            <div class="question-meta">
              <span class="meta-item">
                <span class="meta-label">题目难度:</span>
                <span class="difficulty-tag" :class="'diff-' + question.difficulty">
                  {{ question.difficultyDesc || getDiffText(question.difficulty) }}
                </span>
              </span>

              <span class="meta-item">
                <span class="meta-label">时间限制:</span>
                <span class="meta-val">{{ question.timeLimit }} ms</span>
              </span>

              <span class="meta-item">
                <span class="meta-label">空间限制:</span>
                <span class="meta-val">{{ question.spaceLimit }} MB</span>
              </span>
            </div>

            <div class="question-content">
              <p class="content-text">{{ question.content }}</p>
            </div>
          </template>

          <el-empty v-else description="暂未获取到题目信息" />
        </div>
      </section>

      <!-- 右栏：代码编辑器与执行结果控制台 -->
      <section class="panel-right">
        <!-- 上半部分：代码编辑区 -->
        <div class="editor-section">
          <CodeEditor
            v-model="userCode"
            v-model:language="currentLanguage"
            title="代码"
            height="100%"
            theme="vs"
          >
            <template #extra-actions>
              <el-tooltip content="重置为题目初始默认模板" placement="top">
                <el-button size="small" class="header-btn" text @click="handleResetCode">
                  重置模板
                </el-button>
              </el-tooltip>
            </template>
          </CodeEditor>
        </div>

        <!-- 下半部分：控制台（测试用例 与 执行结果 并列子卡片选项卡） -->
        <div class="result-section">
          <div class="result-header">
            <div class="console-tabs">
              <div
                class="console-tab-item"
                :class="{ active: activeConsoleTab === 'case' }"
                @click="activeConsoleTab = 'case'"
              >
                <el-icon><Document /></el-icon>
                <span>测试用例</span>
              </div>
              <div
                class="console-tab-item"
                :class="{ active: activeConsoleTab === 'result' }"
                @click="activeConsoleTab = 'result'"
              >
                <el-icon><Monitor /></el-icon>
                <span>执行结果</span>
              </div>
            </div>

            <div class="result-actions" v-if="activeConsoleTab === 'result' && submitResult">
              <el-tag :type="submitResult.pass === 1 ? 'success' : (submitResult.pass === 2 ? 'warning' : 'danger')" size="small">
                {{ submitResult.pass === 1 ? '运行通过 (Accepted)' : (submitResult.pass === 2 ? '沙箱评测中 (Judging)' : '未通过 (Wrong Answer)') }}
              </el-tag>
              <span class="score-text">得分: {{ submitResult.score }}</span>
            </div>
          </div>

          <div class="result-body">
            <!-- 测试用例面板 -->
            <div class="case-panel" v-if="activeConsoleTab === 'case'">
              <template v-if="parsedTestCases.length > 0">
                <!-- 用例选择胶囊按钮组 -->
                <div class="case-nav">
                  <button
                    v-for="(c, idx) in parsedTestCases"
                    :key="idx"
                    type="button"
                    class="case-pill-btn"
                    :class="{ active: activeCaseIndex === idx }"
                    @click="activeCaseIndex = idx"
                  >
                    Case {{ c.index }}
                  </button>
                </div>

                <!-- 当前选中用例详情 -->
                <div class="case-content" v-if="currentCase">
                  <div class="case-field-group">
                    <span class="field-title">输入</span>
                    <pre class="field-value">{{ currentCase.input }}</pre>
                  </div>
                  <div class="case-field-group" v-if="currentCase.output">
                    <span class="field-title">预期输出</span>
                    <pre class="field-value">{{ currentCase.output }}</pre>
                  </div>
                </div>
              </template>
              <div class="result-placeholder" v-else>
                <span>暂无测试用例数据</span>
              </div>
            </div>

            <!-- 执行结果面板 -->
            <div class="result-panel" v-else>
              <!-- 提交中 loading 状态 -->
              <div class="result-loading-box" v-if="submitting">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>评测运行中，请稍候...</span>
              </div>

              <!-- 初始未提交状态 -->
              <div class="result-placeholder" v-else-if="!submitResult">
                <span>请先提交代码</span>
              </div>

              <!-- 提交结果回显 -->
              <div class="result-feedback" v-else :class="{ 'is-passed': submitResult.pass === 1 }">
                <div class="feedback-status-row">
                  <span class="status-badge" :class="submitResult.pass === 1 ? 'pass' : (submitResult.pass === 2 ? 'judging' : 'fail')">
                    {{ submitResult.pass === 1 ? 'Accepted' : (submitResult.pass === 2 ? 'Judging...' : 'Wrong Answer') }}
                  </span>
                  <span class="submit-id-info">提交记录ID: {{ submitResult.submitId }}</span>
                  <span class="submit-time-info">{{ submitResult.createTime }}</span>
                </div>

                <div class="feedback-detail-box">
                  <pre class="exe-message">{{ submitResult.exeMessage }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script src="./QuestionDo.js"></script>
<style lang="scss" scoped src="./QuestionDo.scss"></style>
