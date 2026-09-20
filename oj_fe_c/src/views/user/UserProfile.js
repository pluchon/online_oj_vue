// C端个人中心业务逻辑实现
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserProfileApi, updateUserProfileApi, uploadAvatarApi } from '@/api/user'
import { useUserStore } from '@/store/user'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import {
  UserFilled,
  User,
  Trophy,
  SwitchButton,
  ArrowDown,
  Camera,
  Phone,
  InfoFilled,
  QuestionFilled
} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'UserProfile',
  components: {
    UserFilled,
    User,
    Trophy,
    SwitchButton,
    ArrowDown,
    Camera,
    Phone,
    InfoFilled,
    QuestionFilled
  },
  setup() {
    const router = useRouter()
    const { token, nickName, headImage, updateUserInfoAction, resetUserAction } = useUserStore()

    // 登录态计算
    const isLogin = computed(() => Boolean(token.value))

    // 页面状态
    const pageLoading = ref(false)
    const hasError = ref(false)
    const saving = ref(false)
    const avatarUploading = ref(false)
    const profileFormRef = ref(null)

    // 用户详细资料（后端原始快照）
    const userProfile = ref({})

    // 表单编辑响应式数据
    const formData = reactive({
      nickName: '',
      headImage: '',
      sex: 0,
      email: '',
      wechat: '',
      schoolName: '',
      majorName: '',
      introduce: ''
    })

    // 表单校验规则
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

    // 将服务端数据同步至表单
    const syncProfileToForm = (profile) => {
      formData.nickName = profile.nickName || ''
      formData.headImage = profile.headImage || ''
      formData.sex = profile.sex !== undefined && profile.sex !== null ? profile.sex : 0
      formData.email = profile.email || ''
      formData.wechat = profile.wechat || ''
      formData.schoolName = profile.schoolName || ''
      formData.majorName = profile.majorName || ''
      formData.introduce = profile.introduce || ''
    }

    // 加载当前登录用户个人资料
    const loadUserProfile = async () => {
      pageLoading.value = true
      hasError.value = false
      try {
        const data = await getUserProfileApi()
        userProfile.value = data || {}
        syncProfileToForm(userProfile.value)
        // 同步全局状态中的昵称与头像
        updateUserInfoAction({
          nickName: data.nickName,
          headImage: data.headImage
        })
      } catch (err) {
        hasError.value = true
      } finally {
        pageLoading.value = false
      }
    }

    // 头像上传前置校验
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

    // 自定义头像上传实现
    const handleAvatarUpload = async (options) => {
      const uploadData = new FormData()
      uploadData.append('file', options.file)

      avatarUploading.value = true
      try {
        const avatarUrl = await uploadAvatarApi(uploadData)
        if (avatarUrl) {
          formData.headImage = avatarUrl
          userProfile.value.headImage = avatarUrl
          // 同步更新 Pinia / LocalStorage 用户状态
          updateUserInfoAction({ headImage: avatarUrl })
          ElMessage.success('头像上传成功')
        }
      } catch (err) {
        // 异常已由请求拦截器统一提示
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
        ElMessage.warning('请检查表单输入项是否符合规范')
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
          schoolName: formData.schoolName,
          majorName: formData.majorName,
          introduce: formData.introduce
        })

        ElMessage.success('个人资料已成功保存')
        userProfile.value = { ...userProfile.value, ...formData }

        // 性别描述同步更新
        if (formData.sex === 1) {
          userProfile.value.sexDesc = '男'
        } else if (formData.sex === 2) {
          userProfile.value.sexDesc = '女'
        } else {
          userProfile.value.sexDesc = '保密'
        }

        // 联动全局 Store 与 LocalStorage
        updateUserInfoAction({
          nickName: formData.nickName,
          headImage: formData.headImage
        })
      } catch (err) {
        // 异常已由拦截器处理
      } finally {
        saving.value = false
      }
    }

    // 重置表单为当前资料
    const handleResetForm = () => {
      syncProfileToForm(userProfile.value)
      if (profileFormRef.value) {
        profileFormRef.value.clearValidate()
      }
      ElMessage.info('已恢复初始资料内容')
    }

    // 导航跳转
    const goToHome = () => {
      router.push('/question')
    }

    const handleLogin = () => {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }

    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出当前账号登录状态吗？', '退出登录确认', {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetUserAction()
        ElMessage.success('已退出登录')
        router.push('/login')
      }).catch(() => {})
    }

    // 用户下拉菜单命令
    const handleUserCommand = (command) => {
      if (command === 'logout') {
        handleLogout()
      } else if (command === 'myExam') {
        router.push('/my-exam')
      } else if (command === 'profile') {
        // 已在当前页面，平滑滚动至顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    onMounted(() => {
      loadUserProfile()
    })

    return {
      isLogin,
      nickName,
      headImage,
      defaultAvatar,
      pageLoading,
      hasError,
      saving,
      avatarUploading,
      profileFormRef,
      userProfile,
      formData,
      formRules,
      loadUserProfile,
      beforeAvatarUpload,
      handleAvatarUpload,
      handleSaveProfile,
      handleResetForm,
      goToHome,
      handleLogin,
      handleLogout,
      handleUserCommand
    }
  }
})
