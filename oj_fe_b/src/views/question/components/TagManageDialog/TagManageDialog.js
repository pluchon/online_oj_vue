// 标签管理弹窗：新增、修改、删除标签，有变更时通知父组件刷新标签选项与题目列表
import { defineComponent, ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import OjDialog from '@/components/OjDialog'
import { getTagListApi, addTagApi, editTagApi, deleteTagApi } from '@/api/tag'
import { TAG_CATEGORY_OPTIONS, MAX_TAG_NAME_LENGTH } from '@/constants'

// 新增表单默认分类（数据结构）
const DEFAULT_CATEGORY = TAG_CATEGORY_OPTIONS[0].value

export default defineComponent({
  name: 'TagManageDialog',
  components: {
    OjDialog,
    Plus,
  },
  emits: ['changed'],
  setup(props, { emit }) {
    // 弹窗可见性
    const visible = ref(false)

    // 标签列表与加载状态
    const tags = ref([])
    const loading = ref(false)
    const loadError = ref(false)

    // 新增、修改、删除提交中
    const saving = ref(false)

    // 本次打开期间是否有变更（关闭时通知父组件刷新）
    let changed = false

    // 新增表单
    const addForm = reactive({ tagName: '', category: DEFAULT_CATEGORY })

    // 正在编辑的标签ID与编辑表单
    const editingId = ref(null)
    const editForm = reactive({ tagName: '', category: DEFAULT_CATEGORY })

    // 按分类分组，空分类不展示
    const groupedTags = computed(() => TAG_CATEGORY_OPTIONS
      .map(category => ({
        value: category.value,
        label: category.label,
        tags: tags.value.filter(tag => tag.category === category.value)
      }))
      .filter(group => group.tags.length > 0))

    // 加载标签列表
    const loadTags = async () => {
      loading.value = true
      loadError.value = false
      try {
        const list = await getTagListApi()
        tags.value = Array.isArray(list) ? list : []
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
        loadError.value = true
        tags.value = []
      } finally {
        loading.value = false
      }
    }

    // 打开弹窗
    const open = () => {
      visible.value = true
      changed = false
      addForm.tagName = ''
      addForm.category = DEFAULT_CATEGORY
      editingId.value = null
      loadTags()
    }

    // 标签名称校验：非空且不超长
    const validateName = (name) => {
      const text = (name || '').trim()
      if (!text) {
        ElMessage.warning('请输入标签名称')
        return null
      }
      if (text.length > MAX_TAG_NAME_LENGTH) {
        ElMessage.warning(`标签名称不能超过 ${MAX_TAG_NAME_LENGTH} 个字`)
        return null
      }
      return text
    }

    // 新增标签
    const handleAdd = async () => {
      if (saving.value) return
      const tagName = validateName(addForm.tagName)
      if (!tagName) return
      saving.value = true
      try {
        await addTagApi({ tagName, category: addForm.category })
        ElMessage.success('标签已添加')
        addForm.tagName = ''
        changed = true
        await loadTags()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        saving.value = false
      }
    }

    // 进入编辑态
    const startEdit = (tag) => {
      editingId.value = tag.tagId
      editForm.tagName = tag.tagName
      editForm.category = tag.category
    }

    // 退出编辑态
    const cancelEdit = () => {
      editingId.value = null
    }

    // 保存修改（未改动时直接退出编辑态）
    const handleSaveEdit = async (tag) => {
      if (saving.value) return
      const tagName = validateName(editForm.tagName)
      if (!tagName) return
      if (tagName === tag.tagName && editForm.category === tag.category) {
        cancelEdit()
        return
      }
      saving.value = true
      try {
        await editTagApi(tag.tagId, { tagName, category: editForm.category })
        ElMessage.success('标签已修改')
        cancelEdit()
        changed = true
        await loadTags()
      } catch (err) {
        // 错误提示已由请求拦截器统一给出
      } finally {
        saving.value = false
      }
    }

    // 删除标签（二次确认，提示受影响的题目数）
    const handleDelete = (tag) => {
      const impact = tag.questionCount > 0
        ? `已有 ${tag.questionCount} 道题使用该标签，删除后会从这些题目上移除。`
        : '该标签还没有题目使用。'
      ElMessageBox.confirm(`确定删除标签【${tag.tagName}】吗？${impact}`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') {
            done()
            return
          }
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '删除中...'
          saving.value = true
          try {
            await deleteTagApi(tag.tagId)
            ElMessage.success('标签已删除')
            changed = true
            if (editingId.value === tag.tagId) {
              cancelEdit()
            }
            await loadTags()
            done()
          } catch (err) {
            // 错误提示已由请求拦截器统一给出
          } finally {
            saving.value = false
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确定删除'
          }
        }
      }).catch(() => {})
    }

    // 弹窗关闭（叉号或 Esc）时，有变更则通知父组件
    watch(visible, (val) => {
      if (!val && changed) {
        changed = false
        emit('changed')
      }
    })

    return {
      visible,
      tags,
      loading,
      loadError,
      saving,
      addForm,
      editingId,
      editForm,
      groupedTags,
      TAG_CATEGORY_OPTIONS,
      MAX_TAG_NAME_LENGTH,
      open,
      loadTags,
      handleAdd,
      startEdit,
      cancelEdit,
      handleSaveEdit,
      handleDelete,
    }
  },
})
