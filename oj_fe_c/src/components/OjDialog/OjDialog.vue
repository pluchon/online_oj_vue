<template>
  <el-dialog
    :model-value="modelValue"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    :show-close="false"
    class="oj-dialog-container"
    align-center
    append-to-body
    @update:model-value="handleUpdateModelValue"
  >
    <!-- 顶部居中加粗标题（支持右上角可选 x 按钮） -->
    <template #header>
      <div class="oj-dialog-header">
        <h3 class="oj-dialog-title">
          <slot name="title">{{ title }}</slot>
        </h3>
        <button
          v-if="showClose"
          type="button"
          class="btn-dialog-close"
          title="关闭"
          @click="handleClose"
        >
          <svg class="close-icon" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- 弹窗主体内容插槽 -->
    <div class="oj-dialog-body">
      <slot>
        <p v-if="message" class="oj-dialog-message">{{ message }}</p>
      </slot>
    </div>

    <!-- 底部操作区（默认提供取消与主操作按钮） -->
    <template v-if="showFooter" #footer>
      <div class="oj-dialog-footer">
        <slot name="footer">
          <button
            v-if="showCancel"
            type="button"
            class="btn-dialog-cancel"
            @click="handleCancel"
          >
            <span>{{ cancelText }}</span>
          </button>
          <button
            v-if="showConfirm"
            type="button"
            class="btn-dialog-action"
            :class="{ disabled: confirmLoading }"
            :disabled="confirmLoading"
            @click="handleConfirm"
          >
            <span>{{ confirmLoading ? loadingText : confirmText }}</span>
          </button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script src="./OjDialog.js"></script>
<style scoped lang="scss" src="./OjDialog.scss"></style>
