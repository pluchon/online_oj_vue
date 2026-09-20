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
    // 每页条数 (v-model:limit) 固定10条
    limit: {
      type: Number,
      default: 10
    },
    // 布局组件（移除 sizes，固定 10 条/页）
    layout: {
      type: String,
      default: 'total, prev, pager, next, jumper'
    },
    // 是否带背景色
    background: {
      type: Boolean,
      default: true
    },
    // 隐藏条件
    hidden: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:page', 'update:limit', 'pagination'],
  setup(props, { emit }) {
    const currentPage = computed({
      get() {
        return props.page
      },
      set(val) {
        emit('update:page', val)
      }
    })

    const pageSize = computed({
      get() {
        return props.limit
      },
      set(val) {
        emit('update:limit', val)
      }
    })

    const isHidden = computed(() => {
      return props.hidden || props.total <= 0
    })

    const handleCurrentChange = (val) => {
      emit('update:page', val)
      emit('pagination', { page: val, limit: props.limit })
    }

    return {
      currentPage,
      pageSize,
      isHidden,
      handleCurrentChange
    }
  }
})
