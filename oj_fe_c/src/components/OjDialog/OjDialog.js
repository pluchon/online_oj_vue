// 通用古典学者风骨弹窗组件交互逻辑
import { defineComponent } from 'vue'
import AiGlowBorder from '@/components/AiGlowBorder'

export default defineComponent({
  name: 'OjDialog',
  components: {
    AiGlowBorder
  },
  props: {
    // 弹窗显隐状态双向绑定
    modelValue: {
      type: Boolean,
      default: false
    },
    // 弹窗标题（居中加粗展示）
    title: {
      type: String,
      default: ''
    },
    // 弹窗宽度
    width: {
      type: String,
      default: '640px'
    },
    // 纯文本正文（未使用默认插槽时展示）
    message: {
      type: String,
      default: ''
    },
    // 确认/行动按钮文字
    confirmText: {
      type: String,
      default: '确定'
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      default: '取消'
    },
    // 提交加载中文字
    loadingText: {
      type: String,
      default: '处理中...'
    },
    // 按钮加载中状态
    confirmLoading: {
      type: Boolean,
      default: false
    },
    // 是否展示底部区域
    showFooter: {
      type: Boolean,
      default: true
    },
    // 是否展示确认按钮
    showConfirm: {
      type: Boolean,
      default: true
    },
    // 是否展示取消按钮
    showCancel: {
      type: Boolean,
      default: true
    },
    // 点击遮罩是否关闭弹窗
    closeOnClickModal: {
      type: Boolean,
      default: false
    },
    // 关闭时是否销毁内容
    destroyOnClose: {
      type: Boolean,
      default: true
    },
    // 是否展示右上角关闭叉号按钮
    showClose: {
      type: Boolean,
      default: false
    },
    // 确认按钮是否禁用（如必填项未填）
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    // 是否在弹窗边框上播放 AI 处理中的环绕光效
    glowing: {
      type: Boolean,
      default: false
    },
    // 底部按钮是否铺满一行（多个按钮平分宽度）
    blockFooter: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    // 更新可见性
    const handleUpdateModelValue = (val) => {
      emit('update:modelValue', val)
    }

    // 取消并关闭
    const handleCancel = () => {
      emit('update:modelValue', false)
      emit('cancel')
      emit('close')
    }

    // 右上角叉号关闭（不视为取消）
    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    // 确认执行
    const handleConfirm = () => {
      if (props.confirmLoading || props.confirmDisabled) return
      emit('confirm')
    }

    return {
      handleUpdateModelValue,
      handleCancel,
      handleClose,
      handleConfirm
    }
  }
})
