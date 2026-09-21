// 竞赛排名弹窗逻辑
import { defineComponent, ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import OjDialog from '@/components/OjDialog'
import { getExamRankListApi } from '@/api/exam'

// 每页展示条数
const PAGE_SIZE = 8

export default defineComponent({
  name: 'ExamRankDialog',
  components: {
    OjDialog,
    Loading
  },
  props: {
    // 弹窗显隐
    modelValue: {
      type: Boolean,
      default: false
    },
    // 竞赛ID
    examId: {
      type: [String, Number],
      default: null
    },
    // 竞赛名称（作为弹窗标题）
    examTitle: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const rankList = ref([])
    const total = ref(0)
    const pageNum = ref(1)
    const loading = ref(false)
    const loadError = ref(false)

    // 分页加载榜单
    const loadRankList = async (page = 1) => {
      if (!props.examId) return
      pageNum.value = page
      loading.value = true
      loadError.value = false
      try {
        const data = await getExamRankListApi({
          examId: props.examId,
          pageNum: page,
          pageSize: PAGE_SIZE
        })
        rankList.value = data?.rows || []
        total.value = data?.total || 0
      } catch (err) {
        loadError.value = true
        rankList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 同步弹窗显隐
    const handleVisibleChange = (val) => {
      emit('update:modelValue', val)
    }

    // 每次打开时从第一页重新加载
    watch(
      () => props.modelValue,
      (visible) => {
        if (visible) {
          loadRankList(1)
        }
      }
    )

    return {
      rankList,
      total,
      pageNum,
      pageSize: PAGE_SIZE,
      loading,
      loadError,
      loadRankList,
      handleVisibleChange
    }
  }
})
