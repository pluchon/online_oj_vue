// 申诉详情与裁定弹窗逻辑（通过即改判并通知学员；已裁定的也可以改判，提交结论跟着走）
import { defineComponent, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppealDetailApi, handleAppealApi } from '@/api/appeal'
import { APPEAL_STATUS } from '@/constants'
import { appealStatusOf, judgeStatusOf, isAppealFinal } from '@/utils/appealDisplay'
import OjDialog from '@/components/OjDialog'
import OjEmpty from '@/components/OjEmpty'
import CodeEditor from '@/components/CodeEditor'

// 裁定前的确认文案：待处理、存疑改为存疑时不需要确认；从「通过」改走时提交会恢复为原判题结论
const confirmText = (current, target) => {
  const revert = current === APPEAL_STATUS.UPHELD ? '这条提交会恢复为原判题结论，' : ''
  if (target === APPEAL_STATUS.UPHELD) {
    return '确定申诉成立吗？这条提交会改判为通过并通知学员，题目会标记为「待修题」。'
  }
  if (target === APPEAL_STATUS.REJECTED) {
    return revert ? `确定改为不通过吗？${revert}并通知学员。` : '确定驳回这条申诉吗？维持原判题结论并通知学员。'
  }
  return isAppealFinal(current) ? `确定改为存疑吗？${revert}学员会收到结果更新通知。` : ''
}

// 裁定成功提示
const SUCCESS_TEXT = {
  [APPEAL_STATUS.UPHELD]: '已判定申诉成立，提交已改判为通过',
  [APPEAL_STATUS.REJECTED]: '已驳回申诉',
  [APPEAL_STATUS.DOUBTFUL]: '已标记为存疑',
}

export default defineComponent({
  name: 'AppealDetailDialog',
  components: {
    OjDialog,
    OjEmpty,
    CodeEditor,
  },
  emits: ['handled'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 加载状态
    const loading = ref(false)

    // 加载是否失败
    const loadError = ref(false)

    // 申诉详情
    const detail = ref(null)

    // 当前查看的用例序号
    const activeIndex = ref(1)

    // 裁定提交中
    const handling = ref(false)

    // 本次打开的请求序号（快速切换时丢弃过期响应）
    let requestSeq = 0

    // 当前查看的用例
    const activeCase = computed(() => detail.value?.cases.find((item) => item.index === activeIndex.value) || null)

    // 裁定按钮是否不可点：详情未就绪、提交中，或就是当前状态
    const isCurrent = (status) => !detail.value || handling.value || detail.value.status === status

    // 用例色块样式
    const caseClass = (item) => {
      if (item.pass === true) return 'case-pass'
      if (item.pass === false) return 'case-fail'
      return 'case-skipped'
    }

    // 实际输出文案：未执行、未记录时给出说明
    const actualText = (item) => {
      if (item.pass == null) return '未执行'
      return item.actualOutput ?? '未记录（早期提交只保存了首个未通过用例的输出）'
    }

    // 打开弹窗并加载详情
    const open = async (appealId) => {
      const seq = ++requestSeq
      visible.value = true
      loading.value = true
      loadError.value = false
      detail.value = null
      activeIndex.value = 1
      try {
        const res = await getAppealDetailApi(appealId)
        if (seq !== requestSeq) return
        detail.value = res
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        if (seq === requestSeq) loadError.value = true
      } finally {
        if (seq === requestSeq) loading.value = false
      }
    }

    // 裁定：通过、不通过先确认；成功后关闭弹窗并刷新列表
    const handle = async (status) => {
      if (isCurrent(status)) return
      const text = confirmText(detail.value.status, status)
      if (text) {
        try {
          await ElMessageBox.confirm(text, '裁定确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
        } catch (err) {
          return
        }
      }
      handling.value = true
      try {
        await handleAppealApi(detail.value.appealId, status)
        ElMessage.success(SUCCESS_TEXT[status])
        visible.value = false
        emit('handled')
      } catch (err) {
        // 错误提示已由请求拦截器统一给出（例如刚被其他管理员改动）
      } finally {
        handling.value = false
      }
    }

    return {
      APPEAL_STATUS,
      visible,
      loading,
      loadError,
      detail,
      activeIndex,
      activeCase,
      handling,
      isCurrent,
      caseClass,
      actualText,
      appealStatusOf,
      judgeStatusOf,
      open,
      handle,
    }
  },
})
