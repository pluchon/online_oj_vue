<template>
  <div class="appeal-manage-panel">
    <!-- 检索与筛选横栏 -->
    <div class="filter-header-bar">
      <div class="filter-left">
        <span class="filter-label">用户ID</span>
        <el-input
          v-model="queryParams.userId"
          clearable
          class="filter-input filter-user-id"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <span class="filter-label">题目名称</span>
        <el-input
          v-model="queryParams.title"
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <span class="filter-label">申诉时间</span>
        <el-select
          v-model="queryParams.days"
          clearable
          placeholder="全部"
          class="filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="item in APPEAL_DAYS_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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

    <!-- 申诉列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="appealList"
        class="custom-editorial-table"
        header-cell-class-name="editorial-table-header"
        row-class-name="editorial-table-row"
        style="width: 100%"
      >
        <el-table-column label="用户ID" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="tabular-text">{{ row.userId }}</span>
          </template>
        </el-table-column>

        <el-table-column label="用户昵称" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="user-nickname-text">{{ row.nickName || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="题目" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'muted-text': !row.questionTitle }">{{ row.questionTitle || '已删除的题目' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="原结论" width="110" align="center">
          <template #default="{ row }">
            <span class="tone-text" :class="`tone-${judgeStatusOf(row.originJudgeStatus).tone}`">
              {{ row.originJudgeStatusDesc || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="申诉状态" width="110" align="center">
          <template #default="{ row }">
            <span class="status-chip" :class="`tone-${appealStatusOf(row.status).tone}`">
              {{ appealStatusOf(row.status).label }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="申诉时间" width="185" align="center">
          <template #default="{ row }">
            <span class="tabular-text">{{ row.createTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <button
                type="button"
                class="action-btn"
                :class="isAppealFinal(row.status) ? 'btn-action-view' : 'btn-action-handle'"
                @click="openDetail(row)"
              >
                {{ isAppealFinal(row.status) ? '查看' : '处理' }}
              </button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <OjEmpty
            v-if="!loading"
            :text="loadError ? '申诉列表加载失败' : '暂无申诉'"
            :sub-text="loadError ? '请稍后点击搜索重试' : ''"
            :image-size="130"
          />
        </template>
      </el-table>
    </div>

    <pagination
      v-model:page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      :total="total"
      @pagination="loadAppealList"
    />

    <!-- 申诉详情与裁定 -->
    <AppealDetailDialog ref="detailDialogRef" @handled="loadAppealList" />
  </div>
</template>

<script src="./AppealManage.js"></script>
<style scoped lang="scss" src="./AppealManage.scss"></style>
