<template>
  <OjDialog
    v-model="visible"
    title="提交详情"
    width="860px"
    :show-footer="false"
  >
    <div v-loading="loading" class="submit-detail-body">
      <!-- 加载失败 -->
      <OjEmpty
        v-if="loadError"
        text="提交详情加载失败"
        sub-text="请关闭后重试"
        :image-size="110"
      />

      <template v-else-if="detail">
        <!-- 概要信息 -->
        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">用户</span>
            <span class="meta-value">{{ detail.nickName || `用户_${detail.userId}` }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">题目</span>
            <span class="meta-value">{{ detail.questionTitle || '已删除的题目' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">来源</span>
            <span class="meta-value">{{ detail.examId ? (detail.examTitle || '已删除的竞赛') : '练习' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">结论</span>
            <span class="meta-value verdict-text" :class="verdictClass">{{ verdictLabel }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">通过用例</span>
            <span class="meta-value tabular">{{ judging ? '-' : `${detail.passCount ?? 0}/${detail.totalCount ?? 0}` }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">耗时</span>
            <span class="meta-value tabular">{{ detail.timeCost != null && !judging ? `${detail.timeCost} ms` : '-' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">提交时间</span>
            <span class="meta-value tabular">{{ detail.createTime || '-' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">最近判题</span>
            <span class="meta-value tabular">{{ detail.updateTime || '-' }}</span>
          </div>
        </div>

        <!-- 逐用例状态 -->
        <div v-if="caseStates.length" class="detail-section">
          <div class="section-title">逐用例结果</div>
          <div class="case-strip">
            <el-tooltip
              v-for="(state, index) in caseStates"
              :key="index"
              :content="`用例 ${index + 1}：${CASE_STATE_TEXT[state] || '未执行'}`"
              placement="top"
            >
              <span class="case-dot" :class="`case-${CASE_STATE_CLASS[state] || 'skipped'}`">{{ index + 1 }}</span>
            </el-tooltip>
          </div>
        </div>

        <!-- 执行回显（编译错误、运行异常等） -->
        <div v-if="detail.exeMessage" class="detail-section">
          <div class="section-title">执行回显</div>
          <pre class="detail-pre">{{ detail.exeMessage }}</pre>
        </div>

        <!-- 首个未通过用例 -->
        <div v-if="hasFailCase" class="detail-section">
          <div class="section-title">首个未通过用例</div>
          <div class="fail-case-grid">
            <div class="fail-case-item">
              <span class="fail-case-label">输入</span>
              <pre class="detail-pre">{{ detail.failCaseInput ?? '用例已被修改或删除' }}</pre>
            </div>
            <div class="fail-case-item">
              <span class="fail-case-label">预期输出</span>
              <pre class="detail-pre">{{ detail.failCaseExpected ?? '用例已被修改或删除' }}</pre>
            </div>
            <div class="fail-case-item">
              <span class="fail-case-label">实际输出</span>
              <pre class="detail-pre">{{ detail.failOutput ?? '-' }}</pre>
            </div>
          </div>
        </div>

        <!-- 学员代码 -->
        <div class="detail-section">
          <CodeEditor
            :model-value="detail.userCode || ''"
            :path="`inmemory://submit/${detail.submitId}.java`"
            title="提交代码"
            height="360px"
            read-only
            copyable
          />
        </div>
      </template>
    </div>
  </OjDialog>
</template>

<script src="./SubmitDetailDialog.js"></script>
<style scoped lang="scss" src="./SubmitDetailDialog.scss"></style>
