// AI 做题辅导面板：加载会话、快捷操作与自由提问，流式渲染回复
import { defineComponent, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Loading } from '@element-plus/icons-vue'
import { getAiTutorSessionApi, askAiTutorStreamApi } from '@/api/aiTutor'
import { renderMarkdown } from '@/utils/markdown'
import { AI_TUTOR_ACTION, AI_STREAM_EVENT, JUDGE_STATUS_AC, JUDGE_STATUS_CE } from '@/constants'

// 快捷操作文案（与后端 AiTutorActionEnum 一致）
const ACTION_LABELS = {
  [AI_TUTOR_ACTION.HINT]: '给我一点思路',
  [AI_TUTOR_ACTION.ANALYZE_SUBMIT]: '分析我最近一次提交',
  [AI_TUTOR_ACTION.EXPLAIN_COMPILE]: '解释编译错误',
  [AI_TUTOR_ACTION.REVIEW_CODE]: '点评我的代码'
}

export default defineComponent({
  name: 'AiTutorPanel',
  components: {
    Close,
    Loading,
  },
  props: {
    // 当前题目ID
    questionId: {
      type: [String, Number],
      required: true,
    },
    // 读取编辑器当前代码
    getUserCode: {
      type: Function,
      default: () => '',
    },
    // 父组件在提交完成后递增，用于刷新快捷操作状态
    refreshKey: {
      type: Number,
      default: 0,
    },
  },
  emits: ['close'],
  setup(props) {
    // 会话数据与加载状态
    const session = ref(null)
    const loading = ref(false)
    const loadError = ref(false)

    // 消息列表（含流式中的临时消息）
    const messages = ref([])

    // 输入框内容与提问中状态
    const draft = ref('')
    const asking = ref(false)

    // 消息列表容器
    const listRef = ref(null)

    // 当前请求的中止控制器
    let controller = null

    // 渲染 AI 回复（Markdown 经 DOMPurify 过滤）
    const render = (content) => renderMarkdown(content)

    // 按提交状态显示的快捷操作
    const quickActions = computed(() => {
      const status = session.value?.latestJudgeStatus
      const list = [AI_TUTOR_ACTION.HINT]
      if (status && status !== JUDGE_STATUS_AC) list.push(AI_TUTOR_ACTION.ANALYZE_SUBMIT)
      if (status === JUDGE_STATUS_CE) list.push(AI_TUTOR_ACTION.EXPLAIN_COMPILE)
      if (session.value?.accepted) list.push(AI_TUTOR_ACTION.REVIEW_CODE)
      return list.map(code => ({ code, label: ACTION_LABELS[code] }))
    })

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
      })
    }

    // 加载会话
    const loadSession = async () => {
      loading.value = true
      loadError.value = false
      try {
        const data = await getAiTutorSessionApi(props.questionId)
        session.value = data
        messages.value = data.messages || []
        scrollToBottom()
      } catch (err) {
        loadError.value = true
      } finally {
        loading.value = false
      }
    }

    // 只刷新次数与提交状态，不覆盖正在显示的消息
    const refreshStatus = async () => {
      if (!session.value || asking.value) return
      try {
        const data = await getAiTutorSessionApi(props.questionId)
        session.value = { ...data, messages: undefined }
      } catch (err) {
        // 静默失败，沿用旧状态
      }
    }

    // 提问：先追加用户消息与空的 AI 消息，再按事件逐段填充
    const ask = async (action, content) => {
      if (asking.value) return
      const text = (content || '').trim()
      messages.value.push({ fromUser: true, action, content: text || ACTION_LABELS[action] })
      const reply = { fromUser: false, action, content: '', streaming: true, failed: '' }
      messages.value.push(reply)
      const replyIndex = messages.value.length - 1
      scrollToBottom()

      asking.value = true
      controller = new AbortController()
      try {
        await askAiTutorStreamApi(props.questionId, {
          action,
          content: text || null,
          userCode: props.getUserCode() || null
        }, {
          signal: controller.signal,
          onEvent: ({ event, data }) => {
            const payload = JSON.parse(data)
            const target = messages.value[replyIndex]
            if (event === AI_STREAM_EVENT.DELTA) {
              target.content += payload.text || ''
              scrollToBottom()
            } else if (event === AI_STREAM_EVENT.DONE) {
              target.messageId = payload.messageId
              session.value.remaining = payload.remaining
            } else if (event === AI_STREAM_EVENT.ERROR) {
              target.failed = payload.msg || 'AI 服务繁忙，请稍后重试'
            }
          }
        })
      } catch (err) {
        const target = messages.value[replyIndex]
        if (err.name === 'AbortError') {
          target.failed = '已停止'
        } else {
          // 请求未进入流式阶段（如次数用完、竞赛中）：撤回本轮消息并提示
          messages.value.splice(replyIndex - 1, 2)
          ElMessage.error(err.message || '请求失败')
          refreshStatus()
        }
      } finally {
        const target = messages.value[replyIndex]
        if (target) target.streaming = false
        asking.value = false
        controller = null
      }
    }

    // 发送输入框中的问题
    const handleSend = () => {
      const text = draft.value.trim()
      if (!text || asking.value) return
      draft.value = ''
      ask(AI_TUTOR_ACTION.CHAT, text)
    }

    // 停止接收当前回复
    const stop = () => {
      controller?.abort()
    }

    onMounted(loadSession)

    onBeforeUnmount(stop)

    // 切换题目时重新加载
    watch(() => props.questionId, () => {
      stop()
      draft.value = ''
      loadSession()
    })

    // 提交完成后刷新快捷操作状态
    watch(() => props.refreshKey, refreshStatus)

    return {
      session,
      loading,
      loadError,
      messages,
      draft,
      asking,
      listRef,
      quickActions,
      render,
      loadSession,
      ask,
      handleSend,
      stop,
    }
  },
})
