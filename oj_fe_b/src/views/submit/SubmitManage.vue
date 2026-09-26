<template>
  <div class="submit-manage-panel">
    <!-- 检索与筛选横栏 -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <!-- 题目（按标题远程搜索，选中后可按题重判） -->
        <span class="filter-label">题目</span>
        <el-select
          v-model="queryParams.questionId"
          filterable
          remote
          clearable
          :remote-method="searchQuestions"
          :loading="questionSearching"
          placeholder="输入标题搜索"
          class="filter-select filter-question"
          @change="handleSearch"
        >
          <el-option
            v-for="item in questionOptions"
            :key="item.questionId"
            :label="item.title"
            :value="item.questionId"
          />
        </el-select>

        <!-- 用户昵称 -->
        <span class="filter-label">用户昵称</span>
        <el-input
          v-model="queryParams.nickName"
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <!-- 判题结论 -->
        <span class="filter-label">结论</span>
        <el-select
          v-model="queryParams.verdict"
          clearable
          placeholder="全部"
          class="filter-select filter-verdict"
          @change="handleSearch"
        >
          <el-option :value="VERDICT_JUDGING" label="评测中" />
          <el-option
            v-for="item in JUDGE_STATUS_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <!-- 来源（练习或某场竞赛，竞赛按标题远程搜索） -->
        <span class="filter-label">来源</span>
        <el-select
          v-model="queryParams.source"
          filterable
          remote
          clearable
          :remote-method="searchExams"
          :loading="examSearching"
          placeholder="全部"
          class="filter-select filter-source"
          @visible-change="handleSourceVisible"
          @change="handleSearch"
        >
          <el-option :value="SUBMIT_SOURCE_PRACTICE" label="练习" />
          <el-option
            v-for="item in examOptions"
            :key="item.examId"
            :label="item.title"
            :value="item.examId"
          />
        </el-select>
      </div>

      <div class="filter-right">
        <button class="btn-search" @click="handleSearch">
          <el-icon class="btn-icon"><Search /></el-icon>
          <span>搜索</span>
        </button>
        <button class="btn-reset" @click="handleReset">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          <span>重置</span>
        </button>
      </div>
    </div>

    <!-- 提交记录表格 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="submitList"
        class="custom-editorial-table"
        header-cell-class-name="editorial-table-header"
        row-class-name="editorial-table-row"
        style="width: 100%"
      >
        <el-table-column label="用户昵称" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="user-nickname-text">{{ row.nickName || `用户_${row.userId}` }}</span>
          </template>
        </el-table-column>

        <el-table-column label="题目" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'muted-text': !row.questionTitle }">{{ row.questionTitle || '已删除的题目' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="来源" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="!row.examId" class="source-practice">练习</span>
            <span v-else class="source-exam">{{ row.examTitle || '已删除的竞赛' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="结论" width="110" align="center">
          <template #default="{ row }">
            <span class="verdict-text" :class="verdictClass(row)">{{ verdictLabel(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="通过用例" width="100" align="center">
          <template #default="{ row }">
            <span class="tabular-text">{{ isJudging(row) ? '-' : `${row.passCount ?? 0}/${row.totalCount ?? 0}` }}</span>
          </template>
        </el-table-column>

        <el-table-column label="得分" width="80" align="center">
          <template #default="{ row }">
            <span class="tabular-text">{{ isJudging(row) ? '-' : (row.score ?? 0) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="耗时" width="90" align="center">
          <template #default="{ row }">
            <span class="tabular-text">{{ row.timeCost != null && !isJudging(row) ? `${row.timeCost} ms` : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="170" align="center">
          <template #default="{ row }">
            <span class="tabular-text">{{ row.createTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <button type="button" class="action-btn btn-action-view" @click="openDetail(row)">
                查看代码
              </button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <OjEmpty
            :text="loadError ? '提交记录加载失败' : '暂无提交记录'"
            :sub-text="loadError ? '请稍后点击搜索重试' : ''"
            :image-size="130"
          />
        </template>
      </el-table>
    </div>

    <!-- 底部分页器（左下角放按题重判） -->
    <pagination
      v-model:page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      :total="total"
      @pagination="loadSubmitList"
    >
      <template #left>
        <el-tooltip
          :disabled="!!appliedQuestionId"
          content="先按题目筛选，再重判这道题"
          placement="top"
        >
          <span class="rejudge-wrap">
            <button
              type="button"
              class="btn-rejudge"
              :disabled="!appliedQuestionId || rejudging"
              @click="handleRejudge"
            >
              <el-icon class="btn-icon"><RefreshRight /></el-icon>
              <span>{{ rejudging ? '重判中...' : '重判本题' }}</span>
            </button>
          </span>
        </el-tooltip>
      </template>
    </pagination>

    <!-- 提交详情弹窗 -->
    <SubmitDetailDialog ref="detailDialogRef" />
  </div>
</template>

<script src="./SubmitManage.js"></script>
<style scoped lang="scss" src="./SubmitManage.scss"></style>
