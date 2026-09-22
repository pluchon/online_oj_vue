// 用户管理业务逻辑（墨衡后台管理）
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getUserListApi, updateUserStatusApi } from '@/api/user'
import { USER_STATUS, USER_SEX_OPTIONS, PAGE_SIZE } from '@/constants'
import Pagination from '@/components/Pagination'
import OjEmpty from '@/components/OjEmpty'
import UserEditDialog from './components/UserEditDialog/UserEditDialog.vue'

// 性别对应的展示样式
const SEX_CLASS = {
  1: 'gender-male',
  2: 'gender-female'
}

export default defineComponent({
  name: 'UserManage',
  components: {
    Search,
    Refresh,
    Pagination,
    UserEditDialog,
    OjEmpty,
  },
  setup() {
    // 表格加载状态
    const loading = ref(false)

    // 最近一次加载是否失败（用于区分空数据与加载失败）
    const loadError = ref(false)

    // 用户数据列表
    const userList = ref([])

    // 数据总条数
    const total = ref(0)

    // 弹窗引用
    const editDialogRef = ref(null)

    // 查询筛选条件表单
    const queryParams = reactive({
      userId: '',
      nickName: '',
      pageNum: 1,
      pageSize: PAGE_SIZE,
    })

    // 加载用户分页列表
    const loadUserList = async () => {
      loading.value = true
      loadError.value = false
      try {
        const params = {
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize,
        }
        if (queryParams.userId && queryParams.userId.trim()) {
          params.userId = queryParams.userId.trim()
        }
        if (queryParams.nickName && queryParams.nickName.trim()) {
          params.nickName = queryParams.nickName.trim()
        }

        const res = await getUserListApi(params)
        userList.value = res.rows.map((item) => ({
          ...item,
          statusLoading: false,
        }))
        total.value = res.total
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        userList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 搜索过滤操作
    const handleSearch = () => {
      if (queryParams.userId && queryParams.userId.trim() && !/^\d+$/.test(queryParams.userId.trim())) {
        ElMessage.warning('用户ID必须为纯数字')
        return
      }
      queryParams.pageNum = 1
      loadUserList()
    }

    // 重置筛选条件
    const handleReset = () => {
      queryParams.userId = ''
      queryParams.nickName = ''
      queryParams.pageNum = 1
      loadUserList()
    }

    // 用户是否处于正常状态
    const isNormal = (row) => row.status === USER_STATUS.NORMAL

    // 性别展示文案
    const sexLabel = (sex) => USER_SEX_OPTIONS.find((item) => item.value === sex)?.label || '保密'

    // 性别展示样式
    const sexClass = (sex) => SEX_CLASS[sex] || 'gender-secret'

    // 点击编辑用户，唤起弹窗
    const handleEdit = (row) => {
      editDialogRef.value?.open(row)
    }

    // 切换用户状态（拉黑 / 解禁）
    const handleToggleStatus = (row) => {
      const isBlacklist = isNormal(row)
      const targetStatus = isBlacklist ? USER_STATUS.BANNED : USER_STATUS.NORMAL
      const actionText = isBlacklist ? '拉黑' : '解禁'
      const confirmMessage = isBlacklist
        ? `确定要拉黑用户 "${row.nickName || row.userId}" 吗？拉黑后该用户将无法正常使用平台。`
        : `确定要解禁用户 "${row.nickName || row.userId}" 吗？解禁后将恢复该用户的正常访问权限。`

      ElMessageBox.confirm(confirmMessage, '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: isBlacklist ? 'warning' : 'info',
      }).then(async () => {
        row.statusLoading = true
        try {
          await updateUserStatusApi({
            userId: row.userId,
            status: targetStatus,
          })
          ElMessage.success(`用户已成功${actionText}`)
          loadUserList()
        } catch (error) {
          // 错误提示已由请求拦截器统一给出
        } finally {
          row.statusLoading = false
        }
      }).catch(() => {})
    }

    // 页面挂载加载首屏数据
    onMounted(() => {
      loadUserList()
    })

    return {
      loading,
      loadError,
      userList,
      total,
      queryParams,
      editDialogRef,
      loadUserList,
      handleSearch,
      handleReset,
      handleEdit,
      handleToggleStatus,
      isNormal,
      sexLabel,
      sexClass,
    }
  },
})
