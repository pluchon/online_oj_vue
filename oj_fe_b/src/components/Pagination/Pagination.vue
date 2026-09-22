<template>
  <div :class="['pagination-footer-wrapper', { hidden: isHidden }]">
    <div class="pagination-left">
      <slot name="left" />
    </div>
    <el-pagination
      :current-page="page"
      :page-size="limit"
      :total="total"
      :layout="layout"
      :background="background"
      class="custom-pagination"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script src="./Pagination.js"></script>
<style scoped lang="scss" src="./Pagination.scss"></style>
