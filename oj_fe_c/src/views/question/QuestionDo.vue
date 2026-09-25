<template>
  <div class="question-do-page" v-loading="pageLoading">
    <AppNavbar />

    <!-- 双卡工作台主容器 -->
    <main class="question-workbench-layout" :class="{ 'has-tutor': tutorOpen }">
      <!-- 左侧：题目详情卡片 -->
      <section class="problem-spec-card">
        <!-- 卡片头部：返回与上下题切换 -->
        <div class="card-header-bar">
          <button type="button" class="btn-back-breadcrumb" @click="handleBack">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span>{{ isExamMode ? '竞赛' : '题库' }}</span>
          </button>

          <div class="nav-quick-btns">
            <template v-if="!isContestMode">
              <button
                type="button"
                class="btn-ai-tutor"
                :class="{ active: tutorOpen }"
                aria-label="AI 辅导"
                @click="toggleTutor"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
                </svg>
                <span>AI 辅导</span>
              </button>
            </template>
            <button
              type="button"
              class="nav-quick-btn"
              :disabled="!preQuestionId || navLoading"
              @click="handlePreQuestion"
            >
              <el-icon><ArrowLeft /></el-icon>
              <span>上一题</span>
            </button>
            <button
              type="button"
              class="nav-quick-btn"
              :disabled="!nextQuestionId || navLoading"
              @click="handleNextQuestion"
            >
              <span>下一题</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
        </div>

        <!-- 题目内部可滚动内容区 -->
        <div class="spec-scroll-body">
          <!-- 标题与属性区 -->
          <div class="problem-header-area">
            <h1 class="problem-main-title">{{ question?.title }}</h1>
            <div class="problem-tags-row">
              <span class="diff-badge" :class="'diff-' + (question?.difficulty || 1)">
                {{ question?.difficultyDesc || getDiffText(question?.difficulty || 1) }}
              </span>
              <span class="limit-pill">
                <el-icon><Timer /></el-icon>
                {{ question?.timeLimit ?? '--' }} ms
              </span>
              <span class="limit-pill">
                <el-icon><Coin /></el-icon>
                {{ question?.spaceLimit ?? '--' }} MB
              </span>
              <!-- 标签会提示解法，竞赛答题中不展示 -->
              <template v-if="!isContestMode">
                <span
                  v-for="tag in question?.tags || []"
                  :key="tag.tagId"
                  class="topic-tag"
                >{{ tag.tagName }}</span>
              </template>
            </div>
          </div>

          <!-- 1. 题目描述 -->
          <div class="problem-section-block">
            <div class="description-text" v-html="formattedDescriptionHtml"></div>
          </div>

          <!-- 2. 示例卡片 -->
          <div class="problem-section-block" v-if="displayExamples.length > 0">
            <h3 class="section-title">示例</h3>
            <div class="examples-grid">
              <div
                v-for="(item, eIdx) in displayExamples"
                :key="eIdx"
                class="example-card"
                :class="{ 'is-wide': isLongExample(item) }"
              >
                <div class="example-card-header">示例 {{ eIdx + 1 }}</div>
                <div class="example-card-row">
                  <span class="row-label">输入</span>
                  <pre class="row-code">{{ item.input }}</pre>
                </div>
                <div class="example-card-row">
                  <span class="row-label">输出</span>
                  <pre class="row-code">{{ item.output }}</pre>
                </div>
                <div class="example-card-row" v-if="item.explain">
                  <span class="row-label">解释</span>
                  <span class="row-explain">{{ item.explain }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 相似题推荐（登录且非竞赛模式，无结果时不显示） -->
          <div class="problem-section-block" v-if="similarQuestions.length > 0">
            <h3 class="section-title">你可能还想做</h3>
            <div class="similar-list">
              <button
                v-for="item in similarQuestions"
                :key="item.questionId"
                type="button"
                class="similar-item"
                @click="switchQuestion(item.questionId)"
              >
                <span class="diff-badge" :class="'diff-' + (item.difficulty || 1)">
                  {{ item.difficultyDesc || getDiffText(item.difficulty || 1) }}
                </span>
                <span class="similar-title">{{ item.title }}</span>
              </button>
            </div>
          </div>

          <!-- 4. 提示与约束 -->
          <div class="problem-section-block" v-if="displayHints.length > 0">
            <h3 class="section-title">提示</h3>
            <ul class="hints-list">
              <li v-for="(hint, hIdx) in displayHints" :key="hIdx">{{ hint }}</li>
            </ul>
          </div>
        </div>

        <!-- 赛中倒计时栏（固定在题目卡片底部，赛后练习不显示） -->
        <div v-if="isContestMode" class="exam-countdown-footer">
          <span class="exam-name" :title="examInfo.title">{{ examInfo.title }}</span>
          <span class="countdown-label">距结束</span>
          <span class="countdown-value">{{ countdownText }}</span>
        </div>
      </section>

      <!-- 右侧：代码编辑与控制台 -->
      <section class="workbench-right-col">
        <!-- 上半部分：代码编辑器卡片 -->
        <div class="editor-card" :class="{ 'is-fullscreen': isEditorFullscreen }">
          <!-- 编辑器顶部工具栏 -->
          <div class="editor-header-bar">
            <div class="header-left-tools">
              <span class="lang-label">Java</span>

              <el-tooltip content="重置代码" placement="top">
                <button type="button" class="btn-tool-icon" @click="handleResetCode">
                  <el-icon><RefreshLeft /></el-icon>
                </button>
              </el-tooltip>

              <el-tooltip content="格式化" placement="top">
                <button type="button" class="btn-tool-icon" @click="handleFormatCode">
                  <el-icon><MagicStick /></el-icon>
                </button>
              </el-tooltip>

              <el-tooltip :content="editorTheme === 'vs' ? '深色主题' : '浅色主题'" placement="top">
                <button type="button" class="btn-tool-icon" @click="toggleEditorTheme">
                  <el-icon><Sunny v-if="editorTheme === 'vs-dark'" /><Moon v-else /></el-icon>
                </button>
              </el-tooltip>

              <el-tooltip :content="isEditorFullscreen ? '退出全屏' : '全屏'" placement="top">
                <button type="button" class="btn-tool-icon" @click="toggleEditorFullscreen">
                  <el-icon><FullScreen /></el-icon>
                </button>
              </el-tooltip>

              <el-tooltip :content="isCodeDirty ? '保存代码（有未保存的修改）' : '保存代码'" placement="top">
                <button
                  type="button"
                  class="btn-tool-icon"
                  :class="{ 'is-dirty': isCodeDirty }"
                  :disabled="savingCode"
                  @click="saveCode()"
                >
                  <el-icon><DocumentChecked /></el-icon>
                </button>
              </el-tooltip>
            </div>

            <div class="header-right-actions">
              <!-- 运行按钮（次要行动点） -->
              <button type="button" class="btn-run-code" :disabled="runningCase || submitting" @click="handleRun">
                <el-icon class="btn-icon" :class="{ 'is-loading': runningCase }">
                  <Loading v-if="runningCase" /><CaretRight v-else />
                </el-icon>
                <span>运行</span>
              </button>

              <!-- 提交按钮（主行动点，深墨绿） -->
              <button type="button" class="btn-submit-code" :disabled="submitting" @click="handleSubmit">
                <el-icon class="btn-icon" :class="{ 'is-loading': submitting }">
                  <Loading v-if="submitting" /><Upload v-else />
                </el-icon>
                <span>提交</span>
              </button>
            </div>
          </div>

          <!-- Monaco 编辑器挂载容器 -->
          <div class="editor-monaco-wrapper">
            <CodeEditor
              ref="codeEditorRef"
              v-model="userCode"
              language="java"
              height="100%"
              :theme="editorTheme"
              :show-header="false"
            />
          </div>
        </div>

        <!-- 下半部分：测试用例与执行结果卡片 -->
        <div
          class="console-card"
          :class="{ 'is-pass': activeConsoleTab === 'result' && !runningCase && !submitting && verdictClass === 'pass' }"
        >
          <div class="console-header-bar">
            <div class="console-tabs">
              <button
                type="button"
                class="btn-console-tab"
                :class="{ active: activeConsoleTab === 'case' }"
                @click="toggleConsoleTab('case')"
              >
                测试用例
              </button>
              <button
                type="button"
                class="btn-console-tab"
                :class="{ active: activeConsoleTab === 'result' }"
                @click="toggleConsoleTab('result')"
              >
                <span
                  v-if="resultData"
                  class="status-indicator-dot"
                  :class="'is-' + verdictClass"
                ></span>
                <span>执行结果</span>
              </button>
              <button
                v-if="hasSubmitted"
                type="button"
                class="btn-console-tab"
                :class="{ active: activeConsoleTab === 'history' }"
                @click="toggleConsoleTab('history')"
              >
                提交记录
              </button>
            </div>
          </div>

          <!-- 全部通过时的庆祝插画（透明背景，置于内容下层） -->
          <img
            v-if="activeConsoleTab === 'result' && !runningCase && !submitting && verdictClass === 'pass'"
            :src="submitSuccessImage"
            class="success-illustration"
            alt=""
          />

          <!-- 控制台主体内容 -->
          <div class="console-body-wrapper">
            <!-- 1. 测试用例视图 -->
            <div class="case-view-container" v-if="activeConsoleTab === 'case'">
              <div v-if="!parsedTestCases.length" class="result-state-box">
                <span>暂无用例</span>
              </div>

              <template v-else>
                <div class="case-tabs-list">
                  <button
                    v-for="(c, idx) in parsedTestCases"
                    :key="idx"
                    type="button"
                    class="case-tag-btn"
                    :class="{ active: activeCaseIndex === idx }"
                    @click="activeCaseIndex = idx"
                  >
                    用例 {{ c.index }}
                  </button>
                </div>

                <div class="case-io-stack">
                  <div class="io-box">
                    <div class="io-box-label">输入</div>
                    <pre class="io-code-block">{{ currentCase?.input }}</pre>
                  </div>
                  <div class="io-box">
                    <div class="io-box-label">预期输出</div>
                    <pre class="io-code-block">{{ currentCase?.output }}</pre>
                  </div>
                </div>
              </template>
            </div>

            <!-- 2. 执行结果视图 -->
            <div class="result-view-container" v-else-if="activeConsoleTab === 'result'">
              <div v-if="submitting || runningCase" class="result-state-box">
                <el-icon class="is-loading state-icon"><Loading /></el-icon>
                <span>评测中</span>
              </div>

              <div v-else-if="!resultData" class="result-state-box">
                <span>暂无结果</span>
              </div>

              <div v-else class="result-feedback-detail">
                <!-- 结论与统计 -->
                <div class="feedback-top-summary">
                  <span class="result-verdict-text" :class="verdictClass">{{ verdictText }}</span>
                  <span class="meta-stat" v-if="resultData.totalCount">
                    {{ resultData.passCount || 0 }} / {{ resultData.totalCount }}
                  </span>
                  <span class="meta-stat" v-if="resultData.timeCost">{{ resultData.timeCost }} ms</span>
                  <span class="meta-stat" v-if="lastResult.mode === 'submit' && !isJudging">
                    {{ resultData.score ?? 0 }} 分
                  </span>

                  <!-- 提交：逐用例进度格（靠右） -->
                  <div class="case-progress" v-if="caseCells.length">
                    <span
                      v-for="(cell, idx) in caseCells"
                      :key="idx"
                      class="progress-cell"
                      :class="'is-' + cell"
                    ></span>
                  </div>
                </div>

                <!-- 编译错误、运行异常等原始输出 -->
                <pre class="feedback-exe-message" v-if="resultData.exeMessage">{{ resultData.exeMessage }}</pre>

                <!-- 运行：逐用例结果 -->
                <template v-if="runCaseResults.length">
                  <div class="case-tabs-list">
                    <button
                      v-for="(c, idx) in runCaseResults"
                      :key="idx"
                      type="button"
                      class="case-tag-btn result-tag"
                      :class="{ active: activeResultCaseIndex === idx, 'is-fail': !c.pass }"
                      @click="activeResultCaseIndex = idx"
                    >
                      <span class="case-dot"></span>
                      用例 {{ idx + 1 }}
                    </button>
                  </div>
                  <div class="case-io-stack" v-if="activeRunCase">
                    <div class="io-box">
                      <div class="io-box-label">输入</div>
                      <pre class="io-code-block">{{ activeRunCase.input }}</pre>
                    </div>
                    <div class="io-box">
                      <div class="io-box-label">输出</div>
                      <pre class="io-code-block" :class="{ 'is-wrong': !activeRunCase.pass }">{{ activeRunCase.actualOutput ?? '' }}</pre>
                    </div>
                    <div class="io-box">
                      <div class="io-box-label">预期结果</div>
                      <pre class="io-code-block">{{ activeRunCase.expectedOutput }}</pre>
                    </div>
                  </div>
                </template>

                <!-- 提交：首个未通过用例 -->
                <div class="case-io-stack" v-if="lastResult.mode === 'submit' && resultData.failCase">
                  <div class="io-box">
                    <div class="io-box-label">输入</div>
                    <pre class="io-code-block">{{ resultData.failCase.input }}</pre>
                  </div>
                  <div class="io-box" v-if="resultData.failCase.actualOutput !== null && resultData.failCase.actualOutput !== undefined">
                    <div class="io-box-label">输出</div>
                    <pre class="io-code-block is-wrong">{{ resultData.failCase.actualOutput }}</pre>
                  </div>
                  <div class="io-box">
                    <div class="io-box-label">预期结果</div>
                    <pre class="io-code-block">{{ resultData.failCase.expectedOutput }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 提交记录视图（翻页器固定在底部） -->
            <div class="history-view-container" v-else>
              <div v-if="!isLogin" class="result-state-box">
                <span>登录后查看提交记录</span>
              </div>

              <div v-else-if="historyLoading && !historyList.length" class="result-state-box">
                <el-icon class="is-loading state-icon"><Loading /></el-icon>
              </div>

              <div v-else-if="historyError" class="result-state-box">
                <span>加载失败</span>
                <button type="button" class="btn-retry" @click="loadHistory(historyPage)">重试</button>
              </div>

              <div v-else-if="!historyList.length" class="result-state-box">
                <span>暂无提交</span>
              </div>

              <template v-else>
                <div class="history-list">
                  <button
                    v-for="item in historyList"
                    :key="item.submitId"
                    type="button"
                    class="history-row"
                    :class="{ 'is-current': item.submitId === resultData?.submitId }"
                    @click="handleLoadHistoryCode(item)"
                  >
                    <span class="history-verdict" :class="historyVerdict(item).cls">{{ historyVerdict(item).text }}</span>
                    <span class="history-meta">{{ item.passCount || 0 }} / {{ item.totalCount || 0 }}</span>
                    <span class="history-meta">{{ item.timeCost ? item.timeCost + ' ms' : '—' }}</span>
                    <span class="history-time">{{ formatHistoryTime(item.createTime) }}</span>
                    <span class="history-action">载入代码</span>
                  </button>
                </div>

                <div class="history-pager">
                  <el-pagination
                    :current-page="historyPage"
                    :page-size="historyPageSize"
                    :total="historyTotal"
                    layout="prev, pager, next"
                    size="small"
                    background
                    @current-change="handleHistoryPage"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- 最右侧：AI 辅导卡片（赛中不显示） -->
      <AiTutorPanel
        v-if="tutorOpen && question?.questionId && !isContestMode"
        class="ai-tutor-column"
        :question-id="question.questionId"
        :exam-id="currentExamId"
        :get-user-code="getUserCode"
        :refresh-key="tutorRefreshKey"
        :before-optimize="ensureCodeSaved"
        @close="tutorOpen = false"
      />
    </main>

    <!-- 通用确认弹窗 -->
    <oj-dialog
      v-model="confirmDialog.state.visible"
      :title="confirmDialog.state.title"
      :message="confirmDialog.state.message"
      width="420px"
      :confirm-text="confirmDialog.state.confirmText"
      :cancel-text="confirmDialog.state.cancelText"
      :show-close="confirmDialog.state.showClose"
      @confirm="confirmDialog.onConfirm"
      @cancel="confirmDialog.onCancel"
    />
  </div>
</template>

<script src="./QuestionDo.js"></script>
<style lang="scss" scoped src="./QuestionDo.scss"></style>
