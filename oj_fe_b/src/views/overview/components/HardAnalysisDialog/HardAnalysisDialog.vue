<template>
  <OjDialog
    v-model="visible"
    title="难题分析"
    width="680px"
    :glowing="analyzing"
  >
    <div v-loading="loading" class="analysis-body">
      <!-- 首次分析中：还没有可显示的结果 -->
      <div v-if="analyzing && !result" class="analysis-waiting">
        正在统计提交并交给 AI 归纳，大约需要 20 秒
      </div>

      <template v-else-if="!loading">
        <OjEmpty
          v-if="!result"
          :text="loadError ? '分析结果加载失败' : '分析失败'"
          sub-text="可以点击下方「重新分析」再试一次"
          :image-size="90"
        />
        <OjEmpty v-else-if="!result.sufficient" text="数据还不够" :image-size="90" />

        <div v-else class="analysis-result" :class="{ 'is-stale': analyzing }">
          <!-- 出题质量提醒 -->
          <section class="analysis-section">
            <h4 class="section-title">
              <el-icon class="section-icon is-warning"><WarningFilled /></el-icon>
              出题质量提醒
              <span v-if="result.suspects.length" class="title-extra">
                <span class="chip tone-warning">{{ result.suspects.length }} 道题</span>
              </span>
            </h4>
            <p v-if="!result.suspects.length" class="section-empty">没有发现失败集中在单个用例或申诉成立的题</p>
            <div v-for="item in result.suspects" :key="item.questionId" class="suspect-row">
              <div class="suspect-head">
                <span class="suspect-title" :title="item.title">{{ item.title }}</span>
                <span class="suspect-tags">
                  <span class="chip difficulty-chip" :class="difficultyClass(item.difficulty)">{{ item.difficultyDesc || '-' }}</span>
                  <span v-if="item.caseIndex" class="chip tone-danger">{{ item.caseShare }}% 的失败在用例 {{ item.caseIndex }}</span>
                  <span v-if="item.upheldAppealCount" class="chip tone-warning">{{ item.upheldAppealCount }} 条申诉成立</span>
                </span>
              </div>
              <p class="suspect-comment">{{ item.comment || '暂无判断' }}</p>
            </div>
          </section>

          <!-- 整体薄弱点 -->
          <section class="analysis-section">
            <h4 class="section-title">
              <el-icon class="section-icon is-danger"><Aim /></el-icon>
              整体薄弱点
            </h4>
            <p v-if="result.weakSummary" class="ai-note">{{ result.weakSummary }}</p>
            <p v-if="!result.weakTags.length" class="section-empty">这些题都还没有标签</p>
            <div v-else class="pie-row">
              <div class="pie-block">
                <span class="pie-caption">通过率最低</span>
                <TagPassPie :tags="result.weakTags" tone="weak" />
              </div>
              <div v-if="result.strongTags.length" class="pie-block">
                <span class="pie-caption">通过率最高</span>
                <TagPassPie :tags="result.strongTags" tone="strong" />
              </div>
            </div>
          </section>

          <!-- 主要错误类型 -->
          <section class="analysis-section">
            <h4 class="section-title">
              <el-icon class="section-icon is-warning"><Histogram /></el-icon>
              主要错误类型
              <span v-if="result.verdicts.length" class="title-extra">
                <span
                  v-for="(item, index) in result.verdicts"
                  :key="item.judgeStatus"
                  class="chip"
                  :style="verdictChipStyle(index)"
                >
                  {{ item.verdict }} {{ formatRate(item.share) }}
                </span>
              </span>
            </h4>
            <p v-if="!result.verdicts.length" class="section-empty">这些题没有未通过的提交</p>
            <div v-else class="stack-bar">
              <div
                v-for="(item, index) in result.verdicts"
                :key="item.judgeStatus"
                class="stack-part"
                :style="{ width: `${item.share || 0}%`, backgroundColor: verdictColor(index) }"
                :title="`${item.verdict} ${formatRate(item.share)}`"
              />
            </div>
            <p v-if="result.verdictSummary" class="ai-note">{{ result.verdictSummary }}</p>
          </section>
        </div>
      </template>
    </div>

    <!-- 左下角生成时间，右侧重新分析 -->
    <template #footer>
      <div class="analysis-footer">
        <span class="generated-time">{{ result?.sufficient ? `生成于 ${formatTime(result.generatedTime)}` : '' }}</span>
        <button
          type="button"
          class="btn-analyze"
          :class="{ disabled: analyzing || loading }"
          :disabled="analyzing || loading"
          @click="analyze"
        >
          {{ analyzing ? '分析中...' : '重新分析' }}
        </button>
      </div>
    </template>
  </OjDialog>
</template>

<script src="./HardAnalysisDialog.js"></script>
<style lang="scss" scoped src="./HardAnalysisDialog.scss"></style>
