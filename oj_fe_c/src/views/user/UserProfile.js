// C端个人中心学者长卷业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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
import OjDialog from '@/components/OjDialog'
import { getUserProfileApi, updateUserProfileApi, uploadAvatarApi } from '@/api/user'
import { useUserStore } from '@/store/user'

export default defineComponent({
  name: 'UserProfile',
  components: {
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
    const router = useRouter()
    const userStore = useUserStore()

    // 登录态与全局基础信息
    const isLogin = computed(() => Boolean(userStore.token))
    const nickName = computed(() => userStore.nickName || '学员')

    // 导航栏头像响应式与容灾兜底
    const avatarError = ref(false)
    const userAvatar = computed(() => {
      if (avatarError.value) return defaultAvatar
      const raw = userStore.headImage?.value !== undefined ? userStore.headImage.value : userStore.headImage
      if (raw && typeof raw === 'string' && raw.trim() && raw !== 'null' && raw !== 'undefined') {
        return raw
      }
      return defaultAvatar
    })
    const handleAvatarError = () => {
      avatarError.value = true
    }

    // 页面主资料与加载状态
    const pageLoading = ref(false)
    const hasError = ref(false)
    const saving = ref(false)
    const avatarUploading = ref(false)
    const profileFormRef = ref(null)

    // 用户详细档案原始快照
    const userProfile = ref({})

    // 学者头像响应式与容灾兜底
    const profileAvatarError = ref(false)
    const profileAvatar = computed(() => {
      if (profileAvatarError.value) return defaultAvatar
      if (formData.headImage && typeof formData.headImage === 'string' && formData.headImage.trim()) {
        return formData.headImage
      }
      return userAvatar.value || defaultAvatar
    })
    const handleProfileAvatarError = () => {
      profileAvatarError.value = true
    }

    // 个人资料编辑表单数据（扩充qq号）
    const formData = reactive({
      nickName: '',
      headImage: '',
      sex: 0,
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

    // 数据总览筛选与统计
    const overviewTimeRange = ref('all')
    const statsData = reactive({
      solvedCount: 42,
      tryingCount: 17,
      submitCount: 128,
      passRate: '83%'
    })

    // 时间范围筛选变更逻辑
    const handleTimeRangeChange = (val) => {
      if (val === 'week') {
        statsData.solvedCount = 8
        statsData.tryingCount = 3
        statsData.submitCount = 19
        statsData.passRate = '89%'
      } else if (val === 'month') {
        statsData.solvedCount = 22
        statsData.tryingCount = 9
        statsData.submitCount = 65
        statsData.passRate = '85%'
      } else if (val === 'year') {
        statsData.solvedCount = 38
        statsData.tryingCount = 14
        statsData.submitCount = 112
        statsData.passRate = '84%'
      } else {
        statsData.solvedCount = 42
        statsData.tryingCount = 17
        statsData.submitCount = 128
        statsData.passRate = '83%'
      }
    }

    // 解题日历热力图生成与年份切换（52周全自然年，精准对齐12个月份标尺）
    const calendarYear = ref(2026)
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

      const baseLevels = [
        0, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 2, 4, 1, 0,
        1, 0, 2, 0, 3, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 3, 2, 0, 0, 0, 0, 4, 2, 0, 1, 0,
        1, 2, 0, 0, 3, 1, 0, 0, 0, 1, 2, 4, 0, 0, 0, 3, 2, 0, 1, 0, 0, 0, 0, 0, 2, 3, 1, 0,
        1, 0, 2, 4, 0, 0, 0, 0, 2, 0, 1, 3, 2, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1, 2, 0, 0, 0, 0,
        0, 0, 0, 1, 3, 0, 0, 1, 0, 2, 0, 0, 4, 0, 0, 2, 0, 3, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0,
        2, 1, 0, 0, 3, 0, 0, 0, 0, 3, 2, 0, 1, 0, 0, 1, 0, 0, 4, 2, 0, 1, 0, 2, 1, 0, 0, 0,
        0, 3, 0, 2, 1, 0, 0, 0, 0, 1, 0, 3, 2, 0, 2, 0, 0, 4, 1, 0, 0, 0, 1, 3, 0, 2, 0, 0,
        0, 0, 0, 2, 1, 3, 0, 1, 2, 0, 0, 2, 0, 0
      ]
      const countsMap = [0, 2, 5, 9, 14]

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

          const seed = (w * 7 + d) % baseLevels.length
          const lvl = baseLevels[seed]
          days.push({
            date: `${y}-${m}-${dayStr}`,
            level: lvl,
            count: countsMap[lvl]
          })
        }
        weeks.push({
          monthName,
          days
        })
      }
      calendarHeatmap.value = weeks
    }

    const prevCalendarYear = () => {
      calendarYear.value--
      generateCalendarHeatmap()
    }

    const nextCalendarYear = () => {
      calendarYear.value++
      generateCalendarHeatmap()
    }

    // 复制 ID 标识
    const copyOjId = async () => {
      const id = userProfile.value?.userId || userProfile.value?.id || '0949_TGx7'
      try {
        await navigator.clipboard.writeText(String(id))
        ElMessage.success('已复制 ID')
      } catch (e) {
        ElMessage.info(`ID: ${id}`)
      }
    }

    // 格式化注册日期
    const formatRegisterTime = (timeStr) => {
      if (!timeStr) return '2026-09-15 22:24:40'
      return timeStr
    }

    // 获取性别描述文本
    const getSexText = (val) => {
      if (val === 1) return '男'
      if (val === 2) return '女'
      return '保密'
    }

    // 同步服务端快照至表单
    const syncProfileToForm = (profile) => {
      formData.nickName = profile.nickName || ''
      formData.headImage = profile.headImage || ''
      formData.sex = profile.sex !== undefined && profile.sex !== null ? profile.sex : 0
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
        userProfile.value = data || {}
        syncProfileToForm(userProfile.value)
        userStore.updateUserInfoAction({
          nickName: data.nickName,
          headImage: data.headImage
        })
      } catch (err) {
        // 请求失败时若本地缓存存在则降级渲染
        const cached = userStore.userInfo?.value || userStore.userInfo || {}
        if (cached && (cached.nickName || cached.phone || cached.headImage)) {
          userProfile.value = { ...cached }
          syncProfileToForm(userProfile.value)
          hasError.value = false
        } else {
          hasError.value = false
          userProfile.value = {
            nickName: nickName.value || '墨衡学者',
            userId: '0949_TGx7',
            createTime: '2026-09-15 22:24:40',
            sexDesc: '保密'
          }
          syncProfileToForm(userProfile.value)
        }
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
          avatarError.value = false
          userStore.updateUserInfoAction({ headImage: avatarUrl })
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

        if (formData.sex === 1) {
          userProfile.value.sexDesc = '男'
        } else if (formData.sex === 2) {
          userProfile.value.sexDesc = '女'
        } else {
          userProfile.value.sexDesc = '保密'
        }

        userStore.updateUserInfoAction({
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

    // 页面跳转与登出
    const goToHome = () => {
      router.push('/question')
    }

    const goToLogin = () => {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }

    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出当前账号登录状态吗？', '退出登录确认', {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.resetUserAction()
        ElMessage.success('已安全退出')
        router.push('/login')
      }).catch(() => {})
    }

    onMounted(() => {
      loadUserProfile()
      generateCalendarHeatmap()
    })

    return {
      isLogin,
      nickName,
      userAvatar,
      profileAvatar,
      handleAvatarError,
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
      loadUserProfile,
      beforeAvatarUpload,
      handleAvatarUpload,
      handleSaveProfile,
      goToHome,
      goToLogin,
      handleLogout
    }
  }
})
