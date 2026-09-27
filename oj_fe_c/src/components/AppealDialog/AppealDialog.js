// 提交申诉弹窗逻辑：AI 初审 → 放行后填写理由提交（规则见 D-017；给学员看的文案由后端决定，不含用例内容）
import { defineComponent, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppealQuotaApi, reviewAppealApi, createAppealApi } from '@/api/appeal'
import { APPEAL_REASON_MAX_LENGTH } from '@/constants'
import OjDialog from '@/components/OjDialog'

export default defineComponent({
  name: 'AppealDialog',
  components: {
    OjDialog,
  },
  emits: ['submitted'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 当前步骤：intro 说明与初审入口、result 初审结果
    const step = ref('intro')

    // 被申诉的提交ID
    const submitId = ref(null)

    // 今日剩余次数（加载前为空）
    const quota = ref(null)

    // 初审结果
    const reviewResult = ref(null)

    // 申诉理由
    const reason = ref('')

    // 初审进行中（弹窗边框播放 AI 光效）
    const reviewing = ref(false)

    // 正式申诉提交中
    const submitting = ref(false)

    // 底部按钮：说明步骤是「取消 / 开始 AI 初审」，不放行是「知道了」，放行是「取消 / 提交给管理员核实」
    const footer = computed(() => {
      if (step.value === 'intro') {
        return {
          showCancel: true,
          confirmText: '开始 AI 初审',
          loadingText: 'AI 初审中...',
          loading: reviewing.value,
          disabled: !quota.value || quota.value.reviewRemaining <= 0,
        }
      }
      if (!reviewResult.value?.allowed) {
        return { showCancel: false, confirmText: '知道了', loadingText: '', loading: false, disabled: false }
      }
      return {
        showCancel: true,
        confirmText: '提交给管理员核实',
        loadingText: '提交中...',
        loading: submitting.value,
        disabled: !reason.value.trim() || !quota.value || quota.value.appealRemaining <= 0,
      }
    })

    // 打开弹窗并加载剩余次数
    const open = async (id) => {
      submitId.value = id
      step.value = 'intro'
      reviewResult.value = null
      reason.value = ''
      quota.value = null
      reviewing.value = false
      visible.value = true
      try {
        quota.value = await getAppealQuotaApi()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      }
    }

    // 发起 AI 初审（失败时停在说明步骤，次数由后端归还）
    const handleReview = async () => {
      reviewing.value = true
      try {
        const res = await reviewAppealApi(submitId.value)
        reviewResult.value = res
        quota.value = res.quota
        step.value = 'result'
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        reviewing.value = false
      }
    }

    // 提交正式申诉
    const handleSubmit = async () => {
      submitting.value = true
      try {
        await createAppealApi({ submitId: submitId.value, reason: reason.value.trim() })
        ElMessage.success('申诉已提交，管理员核实后会通过站内消息通知你')
        visible.value = false
        emit('submitted')
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        submitting.value = false
      }
    }

    // 主按钮：按当前步骤分别是开始初审、知道了、提交申诉
    const handleConfirm = () => {
      if (step.value === 'intro') {
        handleReview()
      } else if (reviewResult.value?.allowed) {
        handleSubmit()
      } else {
        visible.value = false
      }
    }

    return {
      APPEAL_REASON_MAX_LENGTH,
      visible,
      step,
      quota,
      reviewResult,
      reason,
      reviewing,
      submitting,
      footer,
      handleConfirm,
      open,
    }
  },
})
