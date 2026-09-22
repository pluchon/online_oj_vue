// 页面内确认弹窗：配合 OjDialog 使用，ask 返回用户的选择（confirm 主操作 / cancel 次操作 / close 关闭叉号、遮罩或 Esc）
import { reactive, watch } from 'vue'

// 弹窗默认配置
const DEFAULTS = {
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showClose: false
}

export function useConfirmDialog() {
  // 绑定到 OjDialog 的状态
  const state = reactive({ ...DEFAULTS, visible: false })

  // 当前等待结果的回调
  let resolver = null

  // 结束本次询问并关闭弹窗
  const settle = (result) => {
    if (!resolver) return
    const resolve = resolver
    resolver = null
    state.visible = false
    resolve(result)
  }

  // 弹出确认框，返回用户的选择
  const ask = (options) => {
    settle('close')
    Object.assign(state, DEFAULTS, options, { visible: true })
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  // 由关闭叉号、遮罩或 Esc 关闭时视为 close
  watch(() => state.visible, (visible) => {
    if (!visible) settle('close')
  })

  return {
    state,
    ask,
    onConfirm: () => settle('confirm'),
    onCancel: () => settle('cancel')
  }
}
