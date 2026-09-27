// 按题重判：先预览影响范围并确认，确认后投递（确认按钮在投递期间保持加载）；修改题目用例后由题目抽屉调用
import { h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRejudgePreviewApi, rejudgeQuestionApi } from '@/api/question'

// 组装确认框内容：会重判多少条、涉及哪些竞赛、跳过哪些
function buildMessage(title, preview) {
  const lines = [
    h('p', { class: 'rejudge-line' }, ['题目「', h('strong', title), `」的用例已修改，是否按新用例重判 ${preview.rejudgeCount} 条提交？`]),
    h('ul', { class: 'rejudge-list' }, [
      h('li', `练习提交 ${preview.practiceCount} 条`),
      ...preview.exams.map((exam) => h('li', `竞赛「${exam.title}」${exam.count} 条（${exam.finished ? '已结束、待结算' : '进行中'}）`)),
    ]),
  ]
  const skipped = []
  if (preview.settledCount > 0) {
    skipped.push(`已结算竞赛里的 ${preview.settledCount} 条（排名已公布，保持不变）`)
  }
  if (preview.judgingCount > 0) {
    skipped.push(`正在评测的 ${preview.judgingCount} 条`)
  }
  if (skipped.length) {
    lines.push(h('p', { class: 'rejudge-line rejudge-skip' }, `跳过：${skipped.join('；')}。`))
  }
  lines.push(h('p', { class: 'rejudge-line rejudge-tip' }, '重判期间这些提交显示为评测中，学员的做题状态和未结算竞赛的成绩会按新结论更新。'))
  return h('div', { class: 'rejudge-confirm' }, lines)
}

// 询问是否按题重判；没有可重判的提交时直接返回，不打扰管理员
export async function confirmRejudge(questionId, title) {
  let preview
  try {
    preview = await getRejudgePreviewApi(questionId)
  } catch (err) {
    // 错误提示已由请求拦截器统一给出
    return
  }
  if (!preview.rejudgeCount) {
    return
  }
  try {
    await ElMessageBox.confirm(buildMessage(title || '该题', preview), '按题重判', {
      confirmButtonText: '确定重判',
      cancelButtonText: '暂不重判',
      type: 'warning',
      customClass: 'rejudge-message-box',
      beforeClose: async (action, instance, done) => {
        if (action !== 'confirm') {
          done()
          return
        }
        instance.confirmButtonLoading = true
        instance.showCancelButton = false
        try {
          const queued = await rejudgeQuestionApi(questionId)
          ElMessage.success(`已重新投递 ${queued} 条提交`)
        } catch (err) {
          // 错误提示已由请求拦截器统一给出；部分已投递的提交会正常判完
        } finally {
          instance.confirmButtonLoading = false
          done()
        }
      },
    })
  } catch (err) {
    // 暂不重判
  }
}
