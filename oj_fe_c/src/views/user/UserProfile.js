// C端个人中心学者长卷业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Edit,
  CopyDocument,
  Calendar,
  Female,
  Male,
  School,
  Message,
  ChatDotRound,
  ChatLineRound,
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
  Close,
  User,
  Trophy
} from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/images/c_user_avatar.png'
import AppNavbar from '@/components/AppNavbar'
import OjDialog from '@/components/OjDialog'
import { getUserProfileApi, updateUserProfileApi, uploadAvatarApi, getUserOverviewApi, getUserCalendarApi } from '@/api/user'
import { useUserStore } from '@/store/user'
import { USER_SEX, USER_SEX_OPTIONS } from '@/constants'

// 雷达图维度顺序（与模板中五个维度文字的位置一致，从顶部顺时针）
const RADAR_AXES = ['dataStructure', 'algorithm', 'implementation', 'math', 'competition']
// 雷达图空数据
const RADAR_EMPTY = { dataStructure: 0, algorithm: 0, implementation: 0, math: 0, competition: 0 }
// 雷达图中心与最外圈半径（与模板中网格坐标一致）
const RADAR_CENTER_X = 120
const RADAR_CENTER_Y = 102
const RADAR_RADIUS = 64
// 热力图分档阈值：提交次数达到对应值即进入该档
const HEAT_LEVEL_THRESHOLDS = [1, 3, 6, 10]

// 将当日提交次数映射为热力图色阶（0~4）
const toHeatLevel = (count) => HEAT_LEVEL_THRESHOLDS.filter(t => count >= t).length

export default defineComponent({
  name: 'UserProfile',
  components: {
    AppNavbar,
    OjDialog,
    Edit,
    CopyDocument,
    Calendar,
    Female,
    Male,
    School,
    Message,
    ChatDotRound,
    ChatLineRound,
    ArrowRight,
    ArrowLeft,
    Camera,
    Check,
    Close,
    User,
    Trophy
  },
  setup() {
    const { updateUserInfoAction } = useUserStore()

    // 页面主资料与加载状态
    const pageLoading = ref(false)
    const hasError = ref(false)
    const saving = ref(false)
    const avatarUploading = ref(false)
    const profileFormRef = ref(null)

    // 用户详细档案原始快照
    const userProfile = ref({})

    // 资料卡头像（加载失败时回退默认头像）
    const profileAvatarError = ref(false)
    const profileAvatar = computed(() => (!profileAvatarError.value && formData.headImage) || defaultAvatar)
    const handleProfileAvatarError = () => {
      profileAvatarError.value = true
    }

    // 个人资料编辑表单数据（扩充qq号）
    const formData = reactive({
      nickName: '',
      headImage: '',
      sex: USER_SEX.SECRET,
      email: '',
      wechat: '',
      qq: '',
      schoolName: '',
      majorName: '',
      introduce: ''
    })

    // 弹窗表单校验规则
    const formRules = {
      nickName: [
        { required: true, message: '请输入用户昵称', trigger: 'blur' },
        { min: 2, max: 32, message: '昵称长度为2至32个字符', trigger: 'blur' }
      ],
      sex: [
        { required: true, message: '请选择性别', trigger: 'change' }
      ],
      email: [
        {
          pattern: /^$|^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,
          message: '电子邮箱格式不正确',
          trigger: 'blur'
        }
      ],
      wechat: [
        { max: 50, message: '微信号不能超过50个字符', trigger: 'blur' }
      ],
      qq: [
        { max: 20, message: 'QQ号不能超过20个字符', trigger: 'blur' }
      ],
      schoolName: [
        { max: 100, message: '学校名称不能超过100个字符', trigger: 'blur' }
      ],
      majorName: [
        { max: 100, message: '专业名称不能超过100个字符', trigger: 'blur' }
      ],
      introduce: [
        { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
      ]
    }

    // 个人简介默认一句话格言
    const defaultIntroduce = '在代码中寻找答案，也在生活中收集温柔的瞬间。'

    // 编辑弹窗显隐控制
    const editDialogVisible = ref(false)
    const openEditDialog = () => {
      syncProfileToForm(userProfile.value)
      editDialogVisible.value = true
    }
    const closeEditDialog = () => {
      editDialogVisible.value = false
    }

    // 数据总览筛选与统计（数据来自后端个人总览接口）
    const overviewTimeRange = ref('all')
    const statsData = reactive({
      solvedCount: 0,
      tryingCount: 0,
      submitCount: 0,
      passRate: '0%'
    })
    const radarScores = reactive({
      dataStructure: 0,
      algorithm: 0,
      implementation: 0,
      math: 0,
      competition: 0
    })

    // 加载指定时间范围的做题统计与能力雷达
    const loadOverview = async (timeRange) => {
      try {
        const data = await getUserOverviewApi(timeRange)
        statsData.solvedCount = data?.solvedCount ?? 0
        statsData.tryingCount = data?.tryingCount ?? 0
        statsData.submitCount = data?.submitCount ?? 0
        statsData.passRate = data?.passRate || '0%'
        Object.assign(radarScores, RADAR_EMPTY, data?.abilityRadar || {})
      } catch (e) {
        // 错误提示已由请求拦截器统一处理
      }
    }

    // 时间范围筛选变更逻辑
    const handleTimeRangeChange = (val) => {
      loadOverview(val)
    }

    // 雷达图多边形顶点（五个维度分值 0~100，按正五边形从顶部顺时针排列）
    const radarPoints = computed(() => {
      return RADAR_AXES.map((key, i) => {
        const value = Math.min(100, Math.max(0, Number(radarScores[key]) || 0))
        const angle = (-90 + i * 72) * Math.PI / 180
        const r = RADAR_RADIUS * value / 100
        return `${(RADAR_CENTER_X + r * Math.cos(angle)).toFixed(1)},${(RADAR_CENTER_Y + r * Math.sin(angle)).toFixed(1)}`
      }).join(' ')
    })

    // 解题日历热力图生成与年份切换（52周全自然年，精准对齐12个月份标尺）
    const calendarYear = ref(new Date().getFullYear())
    const calendarCountMap = ref({})
    const calendarYearLabel = computed(() => `${calendarYear.value}年`)
    const calendarHeatmap = ref([])

    // 悬浮黑色小"v"箭头提示框状态
    const tooltipState = reactive({
      visible: false,
      x: 0,
      y: 0,
      text: ''
    })

    const onCellMouseEnter = (event, day) => {
      const cell = event.currentTarget
      const parent = cell.closest('.heatmap-matrix-flow')
      if (!parent) return
      const cellRect = cell.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      tooltipState.x = cellRect.left - parentRect.left + cellRect.width / 2
      tooltipState.y = cellRect.top - parentRect.top
      tooltipState.text = `${day.date}：${day.count > 0 ? `${day.count} 次提交` : '无提交'}`
      tooltipState.visible = true
    }

    const onCellMouseLeave = () => {
      tooltipState.visible = false
    }

    const generateCalendarHeatmap = () => {
      const yr = calendarYear.value
      const startDate = new Date(yr, 0, 1)
      const startDay = startDate.getDay()
      const offset = (startDay + 6) % 7
      const firstMonday = new Date(yr, 0, 1 - offset)

      const countMap = calendarCountMap.value
      const weeks = []
      for (let w = 0; w < 52; w++) {
        let monthName = ''
        const days = []
        for (let d = 0; d < 7; d++) {
          const cur = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + w * 7 + d)
          const y = cur.getFullYear()
          const m = String(cur.getMonth() + 1).padStart(2, '0')
          const dayStr = String(cur.getDate()).padStart(2, '0')

          if (w === 0 && d === 0) {
            monthName = `${cur.getMonth() + 1}月`
          } else if (cur.getDate() === 1 && cur.getFullYear() === yr) {
            monthName = `${cur.getMonth() + 1}月`
          }

          const date = `${y}-${m}-${dayStr}`
          const count = countMap[date] || 0
          days.push({
            date,
            level: toHeatLevel(count),
            count
          })
        }
        weeks.push({
          monthName,
          days
        })
      }
      calendarHeatmap.value = weeks
    }

    // 加载指定年份的每日提交次数并重绘热力图
    const loadCalendar = async () => {
      try {
        const data = await getUserCalendarApi(calendarYear.value)
        const map = {}
        for (const item of data?.calendarData || []) {
          map[item.date] = item.count || 0
        }
        calendarCountMap.value = map
      } catch (e) {
        calendarCountMap.value = {}
      }
      generateCalendarHeatmap()
    }

    const prevCalendarYear = () => {
      calendarYear.value--
      loadCalendar()
    }

    const nextCalendarYear = () => {
      calendarYear.value++
      loadCalendar()
    }

    // 复制 ID 标识
    const copyOjId = async () => {
      const id = userProfile.value?.userId
      if (!id) {
        return
      }
      try {
        await navigator.clipboard.writeText(String(id))
        ElMessage.success('已复制 ID')
      } catch (e) {
        ElMessage.info(`ID: ${id}`)
      }
    }

    // 格式化注册日期
    const formatRegisterTime = (timeStr) => {
      if (!timeStr) return '-'
      return timeStr
    }

    // 性别是否为女（资料卡图标）
    const isFemale = computed(() => formData.sex === USER_SEX.FEMALE)

    // 获取性别描述文本
    const getSexText = (val) => USER_SEX_OPTIONS.find((item) => item.value === val)?.label || '保密'

    // 同步服务端快照至表单
    const syncProfileToForm = (profile) => {
      formData.nickName = profile.nickName || ''
      formData.headImage = profile.headImage || ''
      formData.sex = profile.sex ?? USER_SEX.SECRET
      formData.email = profile.email || ''
      formData.wechat = profile.wechat || ''
      formData.qq = profile.qq || ''
      formData.schoolName = profile.schoolName || ''
      formData.majorName = profile.majorName || ''
      formData.introduce = profile.introduce || ''
    }

    // 加载当前登录用户档案
    const loadUserProfile = async () => {
      pageLoading.value = true
      hasError.value = false
      try {
        const data = await getUserProfileApi()
        userProfile.value = data
        syncProfileToForm(data)
        updateUserInfoAction({
          nickName: data.nickName,
          headImage: data.headImage
        })
      } catch (err) {
        // 错误提示已由请求拦截器统一给出，页面展示重新加载入口
        hasError.value = true
      } finally {
        pageLoading.value = false
      }
    }

    // 头像上传校验
    const beforeAvatarUpload = (rawFile) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(rawFile.type)) {
        ElMessage.error('头像仅支持 JPG、PNG、WebP 或 GIF 格式图片')
        return false
      }
      const isLt2M = rawFile.size / 1024 / 1024 < 2
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB')
        return false
      }
      return true
    }

    // 上传头像请求
    const handleAvatarUpload = async (options) => {
      const uploadData = new FormData()
      uploadData.append('file', options.file)

      avatarUploading.value = true
      try {
        const avatarUrl = await uploadAvatarApi(uploadData)
        if (avatarUrl) {
          formData.headImage = avatarUrl
          userProfile.value.headImage = avatarUrl
          profileAvatarError.value = false
          updateUserInfoAction({ headImage: avatarUrl })
          ElMessage.success('学者头像已更新')
        }
      } catch (err) {
        // 异常已由拦截器处理
      } finally {
        avatarUploading.value = false
      }
    }

    // 保存资料修改
    const handleSaveProfile = async () => {
      if (!profileFormRef.value) return
      try {
        await profileFormRef.value.validate()
      } catch (e) {
        ElMessage.warning('请检查输入内容是否符合规范')
        return
      }

      saving.value = true
      try {
        await updateUserProfileApi({
          nickName: formData.nickName,
          headImage: formData.headImage,
          sex: formData.sex,
          email: formData.email,
          wechat: formData.wechat,
          qq: formData.qq,
          schoolName: formData.schoolName,
          majorName: formData.majorName,
          introduce: formData.introduce
        })

        ElMessage.success('个人档案已成功保存')
        userProfile.value = { ...userProfile.value, ...formData }

        userProfile.value.sexDesc = getSexText(formData.sex)

        updateUserInfoAction({
          nickName: formData.nickName,
          headImage: formData.headImage
        })

        editDialogVisible.value = false
      } catch (err) {
        // 异常已由拦截器处理
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadUserProfile()
      loadOverview(overviewTimeRange.value)
      loadCalendar()
    })

    return {
      profileAvatar,
      handleProfileAvatarError,
      pageLoading,
      hasError,
      saving,
      avatarUploading,
      profileFormRef,
      userProfile,
      formData,
      formRules,
      defaultIntroduce,
      editDialogVisible,
      openEditDialog,
      closeEditDialog,
      overviewTimeRange,
      handleTimeRangeChange,
      statsData,
      radarPoints,
      calendarYearLabel,
      calendarHeatmap,
      prevCalendarYear,
      nextCalendarYear,
      tooltipState,
      onCellMouseEnter,
      onCellMouseLeave,
      copyOjId,
      formatRegisterTime,
      getSexText,
      isFemale,
      sexOptions: USER_SEX_OPTIONS,
      loadUserProfile,
      beforeAvatarUpload,
      handleAvatarUpload,
      handleSaveProfile
    }
  }
})
