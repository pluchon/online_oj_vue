// 竞赛新增与编辑抽屉业务逻辑
import { defineComponent, ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addExamApi,
  getExamDetailApi,
  editExamApi,
  getExamQuestionListApi,
  deleteExamQuestionApi,
  addExamQuestionApi
} from '@/api/exam'
import DifficultyTag from '@/components/DifficultyTag'
import OjEmpty from '@/components/OjEmpty'
import { Plus, Check, MagicStick } from '@element-plus/icons-vue'
import ExamQuestionDialog from '../ExamQuestionDialog'
import ExamAiPlanDialog from '../ExamAiPlanDialog'

export default defineComponent({
  name: 'ExamDrawer',
  components: {
    DifficultyTag,
    ExamQuestionDialog,
    ExamAiPlanDialog,
    OjEmpty,
    Plus,
    Check,
    MagicStick
  },
  emits: ['success'],
  setup(props, { emit }) {
    // 抽屉可见性
    const visible = ref(false)

    // 当前抽屉操作模式：add（新增）或 edit（编辑）
    const mode = ref('add')

    // 详情加载状态
    const detailLoading = ref(false)

    // 保存基本信息按钮加载态
    const saving = ref(false)

    // 保存关联题目按钮加载态
    const savingQuestions = ref(false)

    // 题目列表加载态
    const questionLoading = ref(false)

    // 本次打开是否成功新建了竞赛记录
    const isNewlyCreated = ref(false)

    // 编辑前基本信息初始快照（用于未修改时的防重复提交）
    const initialBasicData = ref(null)

    // 表单 DOM 引用
    const formRef = ref(null)

    // 题目弹窗组件引用
    const questionDialogRef = ref(null)

    // AI 帮建弹窗组件引用
    const aiPlanDialogRef = ref(null)

    // 竞赛基本信息表单数据
    const formData = reactive({
      examId: null,
      title: '',
      dateRange: [],
      startTime: '',
      endTime: ''
    })

    // 默认时间点配置
    const defaultTime = [
      new Date(2000, 0, 1, 0, 0, 0),
      new Date(2000, 0, 1, 23, 59, 59)
    ]

    // 关联题目列表（含已保存与本次新选、尚未保存的题目）
    const boundQuestionList = ref([])

    // 已保存到服务端的题目ID
    const persistedIds = ref(new Set())

    // 本次新选、尚未保存的题目ID
    const pendingIds = computed(() => boundQuestionList.value
      .map((item) => item.questionId)
      .filter((id) => !persistedIds.value.has(id)))

    // 抽屉标题动态计算
    const drawerTitle = computed(() => {
      return mode.value === 'add' ? '新增竞赛' : '编辑竞赛'
    })

    // 表单校验规则
    const formRules = {
      title: [
        { required: true, message: '请输入竞赛名称', trigger: 'blur' },
        { max: 30, message: '竞赛名称长度不能超过30个字符', trigger: 'blur' }
      ],
      dateRange: [
        {
          required: true,
          validator: (rule, value, callback) => {
            if (!formData.dateRange || formData.dateRange.length < 2 || !formData.dateRange[0] || !formData.dateRange[1]) {
              callback(new Error('请选择竞赛周期时间范围'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }
      ]
    }

    // 监听日期范围选择变更
    const handleDateChange = (val) => {
      if (val && val.length === 2) {
        formData.dateRange = val
        formData.startTime = val[0]
        formData.endTime = val[1]
      } else {
        formData.dateRange = []
        formData.startTime = ''
        formData.endTime = ''
      }
      formRef.value?.validateField('dateRange')
    }

    // 加载已保存的关联题目
    const loadBoundQuestions = async (examId) => {
      questionLoading.value = true
      try {
        const list = await getExamQuestionListApi(examId)
        boundQuestionList.value = Array.isArray(list) ? list : []
        persistedIds.value = new Set(boundQuestionList.value.map((item) => item.questionId))
      } finally {
        questionLoading.value = false
      }
    }

    // 打开抽屉
    const open = async (drawerMode = 'add', examId = null) => {
      mode.value = drawerMode
      visible.value = true
      isNewlyCreated.value = false
      formData.examId = examId
      formData.title = ''
      formData.dateRange = []
      formData.startTime = ''
      formData.endTime = ''
      boundQuestionList.value = []
      persistedIds.value = new Set()
      initialBasicData.value = null

      nextTick(() => {
        formRef.value?.clearValidate()
      })

      if (drawerMode === 'edit' && examId) {
        detailLoading.value = true
        try {
          const data = await getExamDetailApi(examId)
          formData.title = data.title || ''
          formData.startTime = data.startTime || ''
          formData.endTime = data.endTime || ''
          if (data.startTime && data.endTime) {
            formData.dateRange = [data.startTime, data.endTime]
          }
          initialBasicData.value = {
            title: (data.title || '').trim(),
            startTime: data.startTime || '',
            endTime: data.endTime || ''
          }
          await loadBoundQuestions(examId)
        } catch (err) {
          // 错误提示已由请求拦截器统一给出；加载失败时关闭抽屉，避免在空表单上误保存
          visible.value = false
        } finally {
          detailLoading.value = false
        }
      }
    }

    // 保存竞赛基本信息
    const handleSaveBasic = async () => {
      if (!formRef.value) return
      try {
        await formRef.value.validate()
      } catch (e) {
        return
      }

      saving.value = true
      try {
        if (!formData.examId) {
          const title = formData.title.trim()
          formData.examId = await addExamApi({
            title,
            startTime: formData.startTime,
            endTime: formData.endTime
          })
          isNewlyCreated.value = true
          initialBasicData.value = {
            title,
            startTime: formData.startTime,
            endTime: formData.endTime
          }
          if (pendingIds.value.length > 0) {
            // AI 帮建等方式预先选好的题目随竞赛一起保存
            ElMessage.success('竞赛基本信息保存成功')
            await handleSaveQuestions()
          } else {
            ElMessage.success('竞赛基本信息保存成功，请在下方点击添加题目')
          }
        } else {
          const currentTitle = formData.title.trim()
          if (
            initialBasicData.value &&
            currentTitle === initialBasicData.value.title &&
            formData.startTime === initialBasicData.value.startTime &&
            formData.endTime === initialBasicData.value.endTime
          ) {
            ElMessage.info('未做任何修改')
            return
          }
          await editExamApi({
            examId: formData.examId,
            title: currentTitle,
            startTime: formData.startTime,
            endTime: formData.endTime
          })
          initialBasicData.value = {
            title: currentTitle,
            startTime: formData.startTime,
            endTime: formData.endTime
          }
          ElMessage.success('竞赛基本信息修改成功')
          emit('success', 'edit')
        }
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        saving.value = false
      }
    }

    // 打开添加题目弹窗
    const handleOpenQuestionDialog = () => {
      if (!formData.examId) {
        ElMessage.warning('请先保存竞赛基本信息后再添加题目')
        return
      }
      const boundIds = boundQuestionList.value.map((item) => item.questionId)
      questionDialogRef.value?.open(boundIds)
    }

    // 题目弹窗选择确认后追加到当前列表
    const handleQuestionsSelected = (newSelectedRows) => {
      if (!Array.isArray(newSelectedRows) || newSelectedRows.length === 0) return
      const existingIds = new Set(boundQuestionList.value.map((item) => item.questionId))
      const added = newSelectedRows.filter((item) => !existingIds.has(item.questionId))
      boundQuestionList.value = [...boundQuestionList.value, ...added]
      ElMessage.success(`已添加 ${added.length} 道题目，请点击“保存题目”完成保存`)
    }

    // 点击“保存题目”：只提交本次新选的题目
    const handleSaveQuestions = async () => {
      if (!formData.examId) {
        ElMessage.warning('请先保存竞赛基本信息')
        return
      }
      if (pendingIds.value.length === 0) {
        ElMessage.info('没有待保存的新题目')
        return
      }
      savingQuestions.value = true
      try {
        await addExamQuestionApi({
          examId: formData.examId,
          questionIds: pendingIds.value
        })
        ElMessage.success('竞赛关联题目保存成功')
        await loadBoundQuestions(formData.examId)
        emit('success', mode.value)
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        savingQuestions.value = false
      }
    }

    // 打开 AI 帮建弹窗
    const openAiPlanDialog = () => {
      aiPlanDialogRef.value?.open()
    }

    // AI 帮建完成：回填竞赛名称，用生成的题目替换尚未保存的题目（已保存的保留）
    const handlePlanGenerated = (plan) => {
      if (!plan) return
      if (plan.title) {
        formData.title = plan.title.slice(0, 30)
        formRef.value?.validateField('title')
      }
      const kept = boundQuestionList.value.filter((item) => persistedIds.value.has(item.questionId))
      const keptIds = new Set(kept.map((item) => item.questionId))
      const added = (plan.questions || []).filter((item) => !keptIds.has(item.questionId))
      boundQuestionList.value = [...kept, ...added]
      if (plan.message) {
        ElMessage.warning(plan.message)
      } else if (formData.examId) {
        ElMessage.success(`已选出 ${added.length} 道题目，请点击“保存题目”完成保存`)
      } else {
        ElMessage.success(`已选出 ${added.length} 道题目，请设置竞赛周期后保存`)
      }
    }

    // 移出题目：未保存的仅从列表移除，已保存的需服务端删除成功后再移除
    const handleRemoveQuestion = (row, index) => {
      if (!persistedIds.value.has(row.questionId)) {
        boundQuestionList.value.splice(index, 1)
        return
      }
      ElMessageBox.confirm(`确定要从竞赛中移出题目【${row.title}】吗？`, '提示', {
        confirmButtonText: '确定移出',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') {
            done()
            return
          }
          instance.confirmButtonLoading = true
          try {
            await deleteExamQuestionApi(formData.examId, row.questionId)
            boundQuestionList.value = boundQuestionList.value.filter((item) => item.questionId !== row.questionId)
            persistedIds.value.delete(row.questionId)
            ElMessage.success('已移出该题目')
            emit('success', mode.value)
          } catch (err) {
            // 错误提示已由请求拦截器统一给出
          } finally {
            instance.confirmButtonLoading = false
            done()
          }
        }
      }).catch(() => {})
    }

    // 关闭抽屉：有未保存的新题目时二次确认，新建过竞赛则通知列表刷新
    const handleBeforeClose = (done) => {
      const close = () => {
        if (isNewlyCreated.value) {
          emit('success', 'add')
        }
        done()
      }
      if (pendingIds.value.length === 0) {
        close()
        return
      }
      ElMessageBox.confirm(`还有 ${pendingIds.value.length} 道新选题目未保存，确认关闭吗？`, '提示', {
        confirmButtonText: '确定关闭',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }).then(close).catch(() => {})
    }

    return {
      visible,
      mode,
      drawerTitle,
      detailLoading,
      saving,
      savingQuestions,
      questionLoading,
      formRef,
      questionDialogRef,
      aiPlanDialogRef,
      formData,
      defaultTime,
      boundQuestionList,
      pendingIds,
      formRules,
      handleDateChange,
      open,
      handleSaveBasic,
      handleOpenQuestionDialog,
      handleQuestionsSelected,
      handleSaveQuestions,
      handleRemoveQuestion,
      handleBeforeClose,
      openAiPlanDialog,
      handlePlanGenerated
    }
  }
})
