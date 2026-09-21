<template>
  <oj-dialog
    :model-value="modelValue"
    :title="examTitle || '竞赛排名'"
    width="600px"
    :show-close="true"
    :show-footer="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="rank-dialog-body">
      <!-- 榜单 -->
      <div class="rank-list">
        <div v-if="loading" class="rank-state">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>

        <div v-else-if="loadError" class="rank-state">
          <span>加载失败</span>
          <button type="button" class="btn-retry" @click="loadRankList(pageNum)">重试</button>
        </div>

        <div v-else-if="!rankList.length" class="rank-state">
          <span>暂无排名</span>
        </div>

        <template v-else>
          <div
            v-for="item in rankList"
            :key="item.userId"
            class="rank-row"
            :class="{ 'is-me': item.isCurrentUser }"
          >
            <span class="rank-no" :class="{ 'is-top': item.examRank <= 3 }">{{ item.examRank }}</span>
            <span class="rank-name">
              {{ item.nickName || '匿名选手' }}
              <em v-if="item.isCurrentUser" class="me-tag">我</em>
            </span>
            <span class="rank-score">{{ item.score || 0 }} 分</span>
          </div>
        </template>
      </div>

      <!-- 翻页器固定在底部 -->
      <div class="rank-pager" v-if="total > pageSize">
        <el-pagination
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          size="small"
          background
          @current-change="loadRankList"
        />
      </div>
    </div>
  </oj-dialog>
</template>

<script src="./ExamRankDialog.js"></script>
<style scoped lang="scss" src="./ExamRankDialog.scss"></style>
