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

// 按顶层块渲染，每块外包一层 div 并记录它在源文本中的起始行号（data-line），供编辑器左右滚动对齐
export function renderMarkdownBlocks(raw) {
  if (!raw || !raw.trim()) {
    return ''
  }
  const tokens = marked.lexer(raw)
  const parts = []
  let line = 0
  for (const token of tokens) {
    const startLine = line
    line += (token.raw.match(/\n/g) || []).length
    if (token.type === 'space') {
      continue
    }
    const html = marked.parser(Object.assign([token], { links: tokens.links }))
    parts.push(`<div class="md-block" data-line="${startLine}">${html}</div>`)
  }
  return DOMPurify.sanitize(parts.join(''))
}
