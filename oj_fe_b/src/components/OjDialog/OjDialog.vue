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
    <!-- 顶部居中加粗标题栏与右侧关闭叉号 -->
    <template #header>
      <!-- AI 生成中的弹窗边框光效（相对整个弹窗定位） -->
      <AiGlowBorder overlay :active="glowing" :border-radius="8" />
      <div class="oj-dialog-header">
        <div class="header-placeholder" />
        <h3 class="oj-dialog-title">
          <slot name="title">{{ title }}</slot>
        </h3>
        <button
          class="oj-dialog-close-btn"
          type="button"
          aria-label="关闭"
          @click="handleClose"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </template>

    <!-- 弹窗主体内容插槽 -->
    <div class="oj-dialog-body">
      <slot />
    </div>

    <!-- 底部操作区（默认仅保留单个操作按钮，无冗余取消按钮） -->
    <template v-if="showFooter" #footer>
      <div class="oj-dialog-footer">
        <slot name="footer">
          <button
            v-if="showConfirm"
            type="button"
            class="btn-dialog-action"
            :class="{ disabled: confirmLoading || confirmDisabled }"
            :disabled="confirmLoading || confirmDisabled"
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
