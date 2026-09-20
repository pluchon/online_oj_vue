// 竞赛排行榜视图交互业务逻辑
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  UserFilled,
  User,
  Trophy,
  SwitchButton,
  ArrowDown,
  ArrowLeft,
  Calendar,
  Refresh,
  Medal,
  Histogram
} from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import { useUserStore } from '@/store/user'
import { getExamRankListApi, getMyExamRankApi, getExamDetailApi } from '@/api/exam'
import { getUnreadCountApi } from '@/api/message'

export default defineComponent({
  name: 'ExamRank',
  components: {
    Bell,
    UserFilled,
    User,
    Trophy,
    SwitchButton,
    ArrowDown,
    ArrowLeft,
    Calendar,
    Refresh,
    Medal,
    Histogram
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()

    // 页面与表格加载状态
    const loading = ref(false)

    // 用户登录态与基础信息
    const isLogin = computed(() => Boolean(userStore.token))
    const nickName = computed(() => userStore.nickName || '算法爱好者')
    const headImage = computed(() => userStore.headImage)
    const unreadCount = ref(0)

    // 从路由获取竞赛ID
    const examId = computed(() => {
      const id = route.query.examId || route.params.examId
      return id ? String(id) : ''
    })

    // 竞赛基本详情
    const examDetail = reactive({
      examId: '',
      title: '',
      startTime: '',
      endTime: '',
      contestStatus: 2,
      contestStatusDesc: '已完赛'
    })

    // 排名榜单全量列表与分页参数
    const rankList = ref([])
    const total = ref(0)
    const pageQuery = reactive({
      pageNum: 1,
      pageSize: 20
    })

    // 当前登录用户的个人成绩战报
    const myRank = ref(null)

    // 领奖台前三名
    const topThreeList = computed(() => {
      if (pageQuery.pageNum === 1 && rankList.value.length > 0) {
        return rankList.value.slice(0, 3)
      }
      return []
    })

    // 加载竞赛基本信息
    const fetchExamDetail = async () => {
      if (!examId.value) return
      try {
        const res = await getExamDetailApi({ examId: examId.value })
        const data = res && res.data ? res.data : res
        if (data) {
          examDetail.examId = data.examId
          examDetail.title = data.title
          examDetail.startTime = data.startTime
          examDetail.endTime = data.endTime
          examDetail.contestStatus = data.contestStatus
          examDetail.contestStatusDesc = data.contestStatusDesc
        }
      } catch (err) {
        ElMessage.error(err.message || '获取竞赛详情失败')
      }
    }

    // 分页加载排名总榜
    const fetchRankList = async () => {
      if (!examId.value) return
      loading.value = true
      try {
        const res = await getExamRankListApi({
          examId: examId.value,
          pageNum: pageQuery.pageNum,
          pageSize: pageQuery.pageSize
        })
        const data = res && res.data ? res.data : res
        if (data && data.rows !== undefined) {
          rankList.value = data.rows || []
          total.value = data.total || 0
        } else if (Array.isArray(data)) {
          rankList.value = data
          total.value = data.length
        } else {
          rankList.value = []
          total.value = 0
        }
      } catch (err) {
        ElMessage.error(err.message || '获取排名榜单失败')
      } finally {
        loading.value = false
      }
    }

    // 获取当前登录选手战绩
    const fetchMyRank = async () => {
      if (!isLogin.value || !examId.value) {
        myRank.value = null
        return
      }
      try {
        const res = await getMyExamRankApi({ examId: examId.value })
        myRank.value = res && res.data ? res.data : res
      } catch (err) {
        myRank.value = null
      }
    }

    // 获取未读消息数
    const fetchUnreadCount = async () => {
      if (!isLogin.value) return
      try {
        const res = await getUnreadCountApi()
        const count = res && res.data !== undefined ? res.data : res
        unreadCount.value = typeof count === 'number' ? count : 0
      } catch (err) {
        unreadCount.value = 0
      }
    }

    // 状态标签色彩类别映射
    const getStatusTagType = (status) => {
      switch (status) {
        case 0:
          return 'info'
        case 1:
          return 'success'
        case 2:
          return 'danger'
        default:
          return 'primary'
      }
    }

    // 分页数量改变
    const handleSizeChange = (val) => {
      pageQuery.pageSize = val
      pageQuery.pageNum = 1
      fetchRankList()
    }

    // 页码改变
    const handleCurrentChange = (val) => {
      pageQuery.pageNum = val
      fetchRankList()
    }

    // 手动刷新榜单
    const refreshData = () => {
      fetchRankList()
      fetchMyRank()
      ElMessage.success('榜单数据已同步刷新')
    }

    // 导航跳转
    const goBack = () => router.push('/exam')
    const goToHome = () => router.push('/exam')
    const goToLogin = () => router.push({ path: '/login', query: { redirect: route.fullPath } })
    const goToMessage = () => router.push('/message')

    // 用户下拉菜单指令处理
    const handleUserCommand = (command) => {
      if (command === 'profile') {
        router.push('/user/profile')
      } else if (command === 'myExam') {
        router.push('/my-exam')
      } else if (command === 'message') {
        goToMessage()
      } else if (command === 'logout') {
        ElMessageBox.confirm('确定要退出当前登录账号吗？', '退出提示', {
          confirmButtonText: '确定退出',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          userStore.resetUserAction()
          ElMessage.success('已安全退出登录')
          router.push('/login')
        }).catch(() => {})
      }
    }

    onMounted(() => {
      if (!examId.value) {
        ElMessage.warning('未提供有效的竞赛ID，正在返回竞赛大厅')
        router.push('/exam')
        return
      }
      fetchExamDetail()
      fetchRankList()
      fetchMyRank()
      fetchUnreadCount()
    })

    return {
      loading,
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      unreadCount,
      examDetail,
      rankList,
      total,
      pageQuery,
      myRank,
      topThreeList,
      getStatusTagType,
      handleSizeChange,
      handleCurrentChange,
      refreshData,
      goBack,
      goToHome,
      goToLogin,
      goToMessage,
      handleUserCommand
    }
  }
})
