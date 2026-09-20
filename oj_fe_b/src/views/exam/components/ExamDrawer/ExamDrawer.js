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
import { Plus, Check } from '@element-plus/icons-vue'
import ExamQuestionDialog from '../ExamQuestionDialog'

export default defineComponent({
  name: 'ExamDrawer',
  components: {
    DifficultyTag,
    ExamQuestionDialog,
    OjEmpty,
    Plus,
    Check
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

    // 关联绑定的题目列表
    const boundQuestionList = ref([])

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

    // 加载已绑定的题目列表
    const loadBoundQuestions = async (examId) => {
      if (!examId) return
      questionLoading.value = true
      try {
        const res = await getExamQuestionListApi(examId)
        const list = Array.isArray(res) ? res : (res?.data || [])
        boundQuestionList.value = list
      } catch (err) {
        ElMessage.error(err?.message || '获取关联题目列表失败')
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
      initialBasicData.value = null

      nextTick(() => {
        formRef.value?.clearValidate()
      })

      if (drawerMode === 'edit' && examId) {
        detailLoading.value = true
        try {
          const detailRes = await getExamDetailApi(examId)
          const data = detailRes?.data || detailRes
          if (data && data.examId) {
            formData.examId = data.examId
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
          }
          await loadBoundQuestions(examId)
        } catch (err) {
          ElMessage.error(err?.message || '获取竞赛详情失败')
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

      if (!formData.dateRange || formData.dateRange.length < 2) {
        ElMessage.warning('请选择竞赛周期时间范围')
        return
      }

      saving.value = true
      try {
        if (!formData.examId) {
          const res = await addExamApi({
            title: formData.title.trim(),
            startTime: formData.startTime,
            endTime: formData.endTime
          })
          const newExamId = typeof res === 'string' || typeof res === 'number' ? res : (res?.data || res)
          if (newExamId) {
            formData.examId = newExamId
            isNewlyCreated.value = true
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
        ElMessage.error(err?.message || '保存竞赛基本信息失败')
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
      questionDialogRef.value?.open(formData.examId, boundIds)
    }

    // 题目弹窗选择确认后追加到当前列表
    const handleQuestionsSelected = (newSelectedRows) => {
      if (!Array.isArray(newSelectedRows) || newSelectedRows.length === 0) return
      const existingIds = new Set(boundQuestionList.value.map((item) => item.questionId))
      const added = newSelectedRows.filter((item) => !existingIds.has(item.questionId))
      boundQuestionList.value = [...boundQuestionList.value, ...added]
      ElMessage.success(`已添加 ${added.length} 道题目，请点击“保存题目”完成保存`)
    }

    // 点击“保存题目”按钮持久化关联题目
    const handleSaveQuestions = async () => {
      if (!formData.examId) {
        ElMessage.warning('请先保存竞赛基本信息')
        return
      }
      if (boundQuestionList.value.length === 0) {
        ElMessage.warning('当前暂无关联题目，请先添加题目')
        return
      }
      savingQuestions.value = true
      try {
        const questionIds = boundQuestionList.value.map((item) => item.questionId)
        await addExamQuestionApi({
          examId: formData.examId,
          questionIds
        })
        ElMessage.success('竞赛关联题目保存成功')
        await loadBoundQuestions(formData.examId)
        emit('success', mode.value)
      } catch (err) {
        ElMessage.error(err?.message || '保存题目失败')
      } finally {
        savingQuestions.value = false
      }
    }

    // 移出题目
    const handleRemoveQuestion = (row, index) => {
      ElMessageBox.confirm(`确定要从当前列表中移出题目【${row.title}】吗？`, '提示', {
        confirmButtonText: '确定移出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        boundQuestionList.value.splice(index, 1)
        if (formData.examId && row.questionId) {
          try {
            await deleteExamQuestionApi(formData.examId, row.questionId)
          } catch (e) {
            // 后端若尚未持久化则静默跳过
          }
        }
        ElMessage.success('已移出该题目')
      }).catch(() => {})
    }

    // 关闭抽屉前的清理与状态同步
    const handleBeforeClose = (done) => {
      if (isNewlyCreated.value) {
        emit('success', 'add')
      }
      done()
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
      formData,
      defaultTime,
      boundQuestionList,
      formRules,
      handleDateChange,
      open,
      handleSaveBasic,
      handleOpenQuestionDialog,
      handleQuestionsSelected,
      handleSaveQuestions,
      handleRemoveQuestion,
      handleBeforeClose
    }
  }
})
