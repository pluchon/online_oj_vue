// v-html 渲染的 Markdown 代码块复制：给每个 pre 加右上角复制按钮，点击由容器统一处理
import { ElMessage } from 'element-plus'

// 复制图标（两张叠放的纸）
const COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V5a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'

// 复制成功后的对勾图标
const DONE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// 复制成功后恢复原图标的时间（毫秒）
const RESTORE_DELAY_MS = 1500

// 给容器里还没有复制按钮的代码块加上按钮
export function addCopyButtons(container) {
  if (!container) return
  container.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy-btn')) return
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy-btn'
    button.title = '复制代码'
    button.setAttribute('aria-label', '复制代码')
    button.innerHTML = COPY_ICON
    pre.appendChild(button)
  })
}

// 容器点击处理：点中复制按钮时复制所在代码块的文本
export async function handleCopyClick(event) {
  const button = event.target.closest?.('.code-copy-btn')
  if (!button) return
  const pre = button.closest('pre')
  const code = pre?.querySelector('code')
  const text = (code || pre)?.textContent || ''
  try {
    await navigator.clipboard.writeText(text.replace(/\n$/, ''))
    button.innerHTML = DONE_ICON
    button.classList.add('is-done')
    setTimeout(() => {
      button.innerHTML = COPY_ICON
      button.classList.remove('is-done')
    }, RESTORE_DELAY_MS)
    ElMessage.success('已复制')
  } catch (err) {
    ElMessage.error('复制失败，请手动选择代码复制')
  }
}
