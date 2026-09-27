<template>
  <OjDialog
    v-model="visible"
    title="申诉详情"
    width="880px"
  >
    <div v-loading="loading" class="appeal-detail-body">
      <OjEmpty
        v-if="loadError"
        text="申诉详情加载失败"
        sub-text="请关闭后重试"
        :image-size="110"
      />

      <template v-else-if="detail">
        <!-- 申诉人、题目与理由 -->
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用户ID</span>
            <span class="info-value tabular">{{ detail.userId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">用户昵称</span>
            <span class="info-value">{{ detail.nickName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">题目名称</span>
            <span class="info-value">{{ detail.questionTitle || '已删除的题目' }}</span>
          </div>
          <div class="info-item info-wide">
            <span class="info-label">申诉理由</span>
            <span class="info-text" :title="detail.reason">{{ detail.reason }}</span>
          </div>
          <div v-if="detail.aiAnalysis" class="info-item info-wide">
            <span class="info-label">AI 初审意见</span>
            <span class="info-text" :title="detail.aiAnalysis">{{ detail.aiAnalysis }}</span>
          </div>
        </div>

        <!-- 逐用例结果：点选查看，默认用例 1 -->
        <div class="detail-section">
          <div class="section-title">
            <span>逐用例结果</span>
            <span class="section-tags">
              <span class="status-chip" :class="`tone-${judgeStatusOf(detail.originJudgeStatus).tone}`">{{ detail.originJudgeStatusDesc || '-' }}</span>
              <span class="status-chip tone-muted">通过 {{ detail.passCount ?? 0 }} / {{ detail.totalCount ?? 0 }}</span>
            </span>
          </div>
          <div v-if="detail.cases.length" class="case-strip">
            <button
              v-for="item in detail.cases"
              :key="item.index"
              type="button"
              class="case-dot"
              :class="[caseClass(item), { 'is-active': item.index === activeIndex }]"
              @click="activeIndex = item.index"
            >
              {{ item.index }}
            </button>
          </div>
          <div v-if="activeCase" class="case-detail">
            <div v-if="activeCase.missing" class="case-missing">这个用例已被修改或删除，只能看到当时的实际输出</div>
            <div class="case-grid">
              <div class="case-item">
                <span class="case-label">输入</span>
                <pre class="detail-pre">{{ activeCase.input ?? '-' }}</pre>
              </div>
              <div class="case-item">
                <span class="case-label">预期输出</span>
                <pre class="detail-pre">{{ activeCase.expectedOutput ?? '-' }}</pre>
              </div>
              <div class="case-item">
                <span class="case-label">实际输出</span>
                <pre class="detail-pre" :class="{ 'is-fail': activeCase.pass === false }">{{ actualText(activeCase) }}</pre>
              </div>
            </div>
          </div>
          <div v-else class="case-empty">没有逐用例结果</div>
        </div>

        <!-- 执行回显（编译错误、运行异常时） -->
        <div v-if="detail.exeMessage" class="detail-section">
          <div class="section-title">执行回显</div>
          <pre class="detail-pre">{{ detail.exeMessage }}</pre>
        </div>

        <!-- 提交代码（只读，头部只显示语言） -->
        <div class="detail-section">
          <CodeEditor
            :model-value="detail.userCode || ''"
            :path="`inmemory://appeal/${detail.appealId}.java`"
            height="340px"
            read-only
            copyable
          />
        </div>
      </template>
    </div>

    <!-- 裁定 -->
    <template #footer>
      <div class="handle-footer">
        <span v-if="detail" class="handle-status">
          <span class="status-chip" :class="`tone-${appealStatusOf(detail.status).tone}`">{{ appealStatusOf(detail.status).label }}</span>
        </span>
        <div class="handle-buttons">
          <button type="button" class="btn-handle btn-reject" :disabled="isCurrent(APPEAL_STATUS.REJECTED)" @click="handle(APPEAL_STATUS.REJECTED)">
            不通过
          </button>
          <button
            type="button"
            class="btn-handle btn-doubt"
            :disabled="isCurrent(APPEAL_STATUS.DOUBTFUL)"
            @click="handle(APPEAL_STATUS.DOUBTFUL)"
          >
            存疑
          </button>
          <button type="button" class="btn-handle btn-uphold" :disabled="isCurrent(APPEAL_STATUS.UPHELD)" @click="handle(APPEAL_STATUS.UPHELD)">
            通过
          </button>
        </div>
      </div>
    </template>
  </OjDialog>
</template>

<script src="./AppealDetailDialog.js"></script>
<style scoped lang="scss" src="./AppealDetailDialog.scss"></style>
