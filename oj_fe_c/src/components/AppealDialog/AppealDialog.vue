<template>
  <OjDialog
    v-model="visible"
    title="提交申诉"
    width="560px"
    block-footer
    :glowing="reviewing"
    :show-cancel="footer.showCancel"
    :confirm-text="footer.confirmText"
    :loading-text="footer.loadingText"
    :confirm-loading="footer.loading"
    :confirm-disabled="footer.disabled"
    :close-on-click-modal="!reviewing && !submitting"
    @confirm="handleConfirm"
  >
    <div class="appeal-dialog-body">
      <!-- 说明（AI 初审进行中也停留在这一步，由弹窗边框光效表示进行中） -->
      <template v-if="step === 'intro'">
        <p class="appeal-text">
          觉得这次提交被判错了？先由 AI 核对题目、测试用例和你的代码。AI 认为判题可能有误时，才能提交正式申诉，由管理员核实。
        </p>
        <div class="appeal-quota">
          <span class="quota-tag">AI 初审剩余 {{ quota ? quota.reviewRemaining : '-' }} 次</span>
          <span class="quota-tag">申诉剩余 {{ quota ? quota.appealRemaining : '-' }} 次</span>
        </div>
      </template>

      <!-- 初审结果 -->
      <template v-else>
        <p class="appeal-result" :class="reviewResult.allowed ? 'is-allowed' : 'is-denied'">{{ reviewResult.message }}</p>
        <template v-if="reviewResult.allowed">
          <el-input
            v-model="reason"
            type="textarea"
            :rows="5"
            :maxlength="APPEAL_REASON_MAX_LENGTH"
            show-word-limit
            resize="none"
            placeholder="写清你认为判错的理由，例如哪个用例的预期输出不符合题意"
            class="appeal-reason"
          />
          <div class="appeal-quota">
            <span class="quota-tag">申诉剩余 {{ quota ? quota.appealRemaining : '-' }} 次</span>
          </div>
        </template>
      </template>
    </div>
  </OjDialog>
</template>

<script src="./AppealDialog.js"></script>
<style scoped lang="scss" src="./AppealDialog.scss"></style>
