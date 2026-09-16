// 用户管理业务逻辑
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserListApi, updateUserStatusApi } from '@/api/user'

export default {
  name: 'UserManage',
  setup() {
    // 表格加载状态
    const loading = ref(false)

    // 用户数据列表
    const userList = ref([])

    // 数据总条数
    const total = ref(0)

    // 查询筛选条件表单
    const queryParams = reactive({
      userId: '',
      nickName: '',
      pageNum: 1,
      pageSize: 10,
    })

    // 加载用户分页列表
    const loadUserList = async () => {
      loading.value = true
      try {
        const params = {
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize,
        }
        // 用户ID安全修剪与格式清洗
        if (queryParams.userId && queryParams.userId.trim()) {
          params.userId = queryParams.userId.trim()
        }
        // 昵称安全修剪
        if (queryParams.nickName && queryParams.nickName.trim()) {
          params.nickName = queryParams.nickName.trim()
        }

        const res = await getUserListApi(params)
        const data = res?.data || res
        userList.value = (data?.rows || []).map((item) => ({
          ...item,
          statusLoading: false,
        }))
        total.value = Number(data?.total) || 0
      } catch (err) {
        userList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 搜索过滤操作
    const handleSearch = () => {
      // 容错：如果用户输入了非纯数字作为用户ID，进行轻量格式校验
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

    // 分页页码切换
    const handlePageChange = (page) => {
      queryParams.pageNum = page
      loadUserList()
    }

    // 每页条数切换
    const handleSizeChange = (size) => {
      queryParams.pageSize = size
      queryParams.pageNum = 1
      loadUserList()
    }

    // 切换用户状态（拉黑 / 解禁）
    const handleToggleStatus = (row) => {
      const isBlacklist = row.status === 1
      const targetStatus = isBlacklist ? 0 : 1
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
          // 异常由全局拦截器捕获提示
        } finally {
          row.statusLoading = false
        }
      }).catch(() => {
        // 用户取消操作，不做处理
      })
    }

    // 页面挂载加载首屏数据
    onMounted(() => {
      loadUserList()
    })

    return {
      loading,
      userList,
      total,
      queryParams,
      loadUserList,
      handleSearch,
      handleReset,
      handlePageChange,
      handleSizeChange,
      handleToggleStatus,
    }
  },
}
