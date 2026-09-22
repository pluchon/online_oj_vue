// 通用表格底部分页器业务逻辑
import { defineComponent, computed } from 'vue'
import { PAGE_SIZE } from '@/constants'

export default defineComponent({
  name: 'Pagination',
  props: {
    // 总条数
    total: {
      type: Number,
      required: true
    },
    // 当前页码 (v-model:page)
    page: {
      type: Number,
      default: 1
    },
    // 每页条数（固定，不提供切换）
    limit: {
      type: Number,
      default: PAGE_SIZE
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
  emits: ['update:page', 'pagination'],
  setup(props, { emit }) {
    // 无数据或显式隐藏时不展示分页器
    const isHidden = computed(() => {
      return props.hidden || props.total <= 0
    })

    // 翻页：同步页码并通知父组件重新加载
    const handleCurrentChange = (val) => {
      emit('update:page', val)
      emit('pagination', { page: val, limit: props.limit })
    }

    return {
      isHidden,
      handleCurrentChange
    }
  }
})
