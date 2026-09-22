// 通用古典弹窗组件逻辑
import { defineComponent } from 'vue'
import { Close } from '@element-plus/icons-vue'
import AiGlowBorder from '@/components/AiGlowBorder'

export default defineComponent({
  name: 'OjDialog',
  components: {
    AiGlowBorder,
    Close,
  },
  props: {
    // 弹窗可见性绑定
    modelValue: {
      type: Boolean,
      default: false,
    },
    // 弹窗标题（加粗并居中展示）
    title: {
      type: String,
      default: '',
    },
    // 弹窗宽度
    width: {
      type: String,
      default: '520px',
    },
    // 底部主按钮文字（默认为“保存”）
    confirmText: {
      type: String,
      default: '保存',
    },
    // 提交加载中文字
    loadingText: {
      type: String,
      default: '保存中...',
    },
    // 按钮加载中状态
    confirmLoading: {
      type: Boolean,
      default: false,
    },
    // 是否展示底部区域
    showFooter: {
      type: Boolean,
      default: true,
    },
    // 是否展示默认主按钮
    showConfirm: {
      type: Boolean,
      default: true,
    },
    // 点击遮罩是否关闭弹窗
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    // 是否在弹窗边框播放 AI 生成中光效
    glowing: {
      type: Boolean,
      default: false,
    },
    // 关闭时是否销毁内容
    destroyOnClose: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'confirm', 'close'],
  setup(props, { emit }) {
    // 更新可见性
    const handleUpdateModelValue = (val) => {
      emit('update:modelValue', val)
    }

    // 点击右上角关闭按钮
    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    // 点击主按钮
    const handleConfirm = () => {
      if (props.confirmLoading) return
      emit('confirm')
    }

    return {
      handleUpdateModelValue,
      handleClose,
      handleConfirm,
    }
  },
})
