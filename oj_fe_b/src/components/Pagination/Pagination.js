// 通用表格底部分页器业务逻辑
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'Pagination',
  props: {
    // 总条数
    total: {
      type: Number,
      required: true,
      default: 0
    },
    // 当前页码 (v-model:page)
    page: {
      type: Number,
      default: 1
    },
    // 每页条数 (v-model:limit)
    limit: {
      type: Number,
      default: 10
    },
    // 分页大小选项
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50]
    },
    // 布局组件
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    // 是否带背景色
    background: {
      type: Boolean,
      default: true
    },
    // 隐藏条件（如无数据时是否隐藏外层）
    hidden: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:page', 'update:limit', 'pagination'],
  setup(props, { emit }) {
    // 当前页码代理
    const currentPage = computed({
      get() {
        return props.page
      },
      set(val) {
        emit('update:page', val)
      }
    })

    // 每页条数代理
    const pageSize = computed({
      get() {
        return props.limit
      },
      set(val) {
        emit('update:limit', val)
      }
    })

    // 是否隐藏
    const isHidden = computed(() => {
      return props.hidden || props.total <= 0
    })

    // 每页条数变更：用户切换每页大小时强制重置回第1页，避免因页容量放大导致中间数据被漏看
    const handleSizeChange = (val) => {
      currentPage.value = 1
      emit('update:limit', val)
      emit('update:page', 1)
      emit('pagination', { page: 1, limit: val })
    }

    // 当前页码变更
    const handleCurrentChange = (val) => {
      emit('update:page', val)
      emit('pagination', { page: val, limit: props.limit })
    }

    return {
      currentPage,
      pageSize,
      isHidden,
      handleSizeChange,
      handleCurrentChange
    }
  }
})
