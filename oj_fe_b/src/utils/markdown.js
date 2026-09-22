// Markdown 渲染：题目描述以 Markdown 编写，渲染后经 DOMPurify 过滤脚本再交给 v-html
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  gfm: true,
  breaks: true
})

// 将 Markdown 文本渲染为安全的 HTML
export function renderMarkdown(raw) {
  if (!raw || !raw.trim()) {
    return ''
  }
  return DOMPurify.sanitize(marked.parse(raw))
}
