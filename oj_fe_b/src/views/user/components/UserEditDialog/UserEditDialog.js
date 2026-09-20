// 编辑用户弹窗逻辑
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserInfoApi } from '@/api/user'
import OjDialog from '@/components/OjDialog'

export default {
  name: 'UserEditDialog',
  components: {
    OjDialog,
  },
  emits: ['success'],
  setup(props, { emit }) {
    const visible = ref(false)
    const submitting = ref(false)
    const formRef = ref(null)

    // 表单提示弹窗状态与内容
    const promptVisible = ref(false)
    const promptMessage = ref('')

    // 表单模型
    const formData = reactive({
      userId: '',
      nickName: '',
      sex: 0,
      phone: '',
      email: '',
      wechat: '',
      schoolName: '',
      majorName: '',
      introduce: '',
    })

    // 表单校验规则
    const formRules = {
      nickName: [
        { required: true, message: '请输入用户昵称', trigger: 'blur' },
        { min: 1, max: 30, message: '昵称长度在 1 到 30 个字符', trigger: 'blur' },
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号', trigger: 'blur' },
      ],
      email: [
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
      ],
    }

    // 打开编辑弹窗并回填数据
    const open = (row) => {
      formData.userId = row.userId || ''
      formData.nickName = row.nickName || ''
      formData.sex = Number(row.sex) || 0
      formData.phone = row.phone || ''
      formData.email = row.email || ''
      formData.wechat = row.wechat || ''
      formData.schoolName = row.schoolName || ''
      formData.majorName = row.majorName || ''
      formData.introduce = row.introduce || ''
      visible.value = true
    }

    // 提交保存
    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async (valid, fields) => {
        if (!valid) {
          // 校验未通过时唤起公共模板提示弹窗
          const fieldKeys = Object.keys(fields || {})
          const firstField = fieldKeys[0]
          promptMessage.value = fields?.[firstField]?.[0]?.message || '请检查表单填写是否完整正确'
          promptVisible.value = true
          return
        }
        submitting.value = true
        try {
          await updateUserInfoApi({
            userId: formData.userId,
            nickName: formData.nickName?.trim(),
            sex: formData.sex,
            phone: formData.phone?.trim(),
            email: formData.email?.trim(),
            wechat: formData.wechat?.trim(),
            schoolName: formData.schoolName?.trim(),
            majorName: formData.majorName?.trim(),
            introduce: formData.introduce?.trim(),
          })
          ElMessage.success('用户信息修改成功')
          visible.value = false
          emit('success')
        } catch (err) {
          // 异常统一由全局拦截器提示
        } finally {
          submitting.value = false
        }
      })
    }

    return {
      visible,
      submitting,
      formRef,
      formData,
      formRules,
      promptVisible,
      promptMessage,
      open,
      handleSubmit,
    }
  },
}
