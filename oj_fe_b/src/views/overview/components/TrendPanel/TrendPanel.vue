<template>
  <section class="trend-panel">
    <div class="card-title">
      <span>提交趋势</span>
      <el-segmented
        v-model="range"
        class="oj-segmented"
        :options="RANGE_OPTIONS"
        @change="loadTrend"
      />
    </div>

    <div v-loading="loading" class="trend-body">
      <OjEmpty
        v-if="loadError && !trend.length"
        text="提交趋势加载失败"
        sub-text="请稍后切换时间范围重试"
        :image-size="100"
      />
      <TrendChart v-else-if="trend.length" :data="trend" />
    </div>
  </section>
</template>

<script src="./TrendPanel.js"></script>
<style scoped lang="scss" src="./TrendPanel.scss"></style>
