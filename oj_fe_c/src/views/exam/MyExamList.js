// C端我的竞赛列表业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyExamListApi } from '@/api/exam'
import { getUnreadCountApi } from '@/api/message'
import { useUserStore } from '@/store/user'
import Pagination from '@/components/Pagination'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import { UserFilled, User, Trophy, SwitchButton, ArrowDown, Bell } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'MyExamList',
  components: {
    Pagination,
    UserFilled,
    User,
    Trophy,
    SwitchButton,
    ArrowDown,
    Bell
  },
  setup() {
    const router = useRouter()
    const { token, nickName, headImage, resetUserAction } = useUserStore()

    // 是否已登录
    const isLogin = computed(() => Boolean(token.value))

    // 未读消息数量
    const unreadCount = ref(0)

    // 列表加载状态
    const loading = ref(false)

    // 我的竞赛原始数据列表
    const myExamList = ref([])

    // 数据总条数
    const total = ref(0)

    // 状态分类选项
    const filterTabs = [
      { label: '全部竞赛', value: 'all' },
      { label: '未开赛', value: '0' },
      { label: '进行中', value: '1' },
      { label: '已完赛', value: '2' }
    ]

    // 当前选中的 Tab 标识
    const currentTab = ref('all')

    // 查询分页参数
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 6
    })

    // 依据选中的 Tab 分类在前端进行筛选展现
    const filteredList = computed(() => {
      if (currentTab.value === 'all') {
        return myExamList.value
      }
      const targetStatus = Number(currentTab.value)
      return myExamList.value.filter(item => item.contestStatus === targetStatus)
    })

    // 获取竞赛状态徽章对应的样式类
    const getStatusBadgeClass = (status) => {
      if (status === 0) {
        return 'upcoming'
      } else if (status === 1) {
        return 'ongoing'
      } else if (status === 2) {
        return 'ended'
      }
      return 'upcoming'
    }

    // 获取竞赛状态文本描述
    const getStatusText = (status) => {
      if (status === 0) {
        return '未开赛'
      } else if (status === 1) {
        return '进行中'
      } else if (status === 2) {
        return '已完赛'
      }
      return '未知状态'
    }

    // 加载当前用户已报名的竞赛列表
    const loadMyExamList = async () => {
      loading.value = true
      try {
        const res = await getMyExamListApi({
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize
        })
        if (res) {
          myExamList.value = res.rows || []
          total.value = res.total || 0
        }
      } catch (err) {
        myExamList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 切换分类 Tab
    const handleTabChange = (tabValue) => {
      currentTab.value = tabValue
    }

    // 进入正在进行中的竞赛答题考场
    const handleStartExam = (item) => {
      ElMessage.success(`正在进入竞赛「${item.title}」答题考场...`)
    }

    // 完赛竞赛练习
    const handlePractice = (item) => {
      ElMessage.info(`「${item.title}」竞赛练习模式正在建设中，敬请期待`)
    }

    // 查看完赛排名
    const handleRank = (item) => {
      if (!item || !item.examId) return
      router.push({
        path: '/exam/rank',
        query: { examId: item.examId }
      })
    }

    // 跳转至竞赛大厅
    const goToExamList = () => {
      router.push('/exam')
    }

    // 点击导航栏品牌前往竞赛大厅
    const goToHome = () => {
      router.push('/exam')
    }

    // 跳转至登录页
    const handleLogin = () => {
      router.push('/login')
    }

    // 跳转至消息中心
    const goToMessage = () => {
      router.push('/message')
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

    // 退出登录
    const handleLogout = () => {
      resetUserAction()
      ElMessage.success('已退出登录')
      router.push('/login')
    }

    // 用户头像下拉菜单指令分发
    const handleUserCommand = (command) => {
      if (command === 'logout') {
        handleLogout()
      } else if (command === 'profile') {
        router.push('/user/profile')
      } else if (command === 'myExam') {
        router.push('/my-exam')
      } else if (command === 'message') {
        goToMessage()
      }
    }

    onMounted(() => {
      loadMyExamList()
      fetchUnreadCount()
    })

    return {
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      unreadCount,
      loading,
      filterTabs,
      currentTab,
      myExamList,
      filteredList,
      total,
      queryParams,
      getStatusBadgeClass,
      getStatusText,
      loadMyExamList,
      fetchUnreadCount,
      handleTabChange,
      handleStartExam,
      handlePractice,
      handleRank,
      goToExamList,
      goToHome,
      goToMessage,
      handleLogin,
      handleLogout,
      handleUserCommand
    }
  }
})
