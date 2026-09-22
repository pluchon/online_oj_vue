// 题面拆分：与 C 端做题页一致，把描述拆成正文、示例与提示三部分

// 示例与提示在描述中的起始位置
const EXAMPLE_START = /示例\s*[1一]|Example\s*1|提示[\s:：]/i

// 单个示例块
const EXAMPLE_BLOCK = /示例\s*(\d+)[\s:：]*([\s\S]*?)(?=示例\s*\d+|提示|$)/gi

// 最多展示的示例数
const MAX_EXAMPLES = 4

// 正文（示例与提示之前的部分）
export function extractDescription(content) {
  const raw = content || ''
  const index = raw.search(EXAMPLE_START)
  return index > -1 ? raw.slice(0, index).trim() : raw
}

// 示例：优先从描述中解析，没有时用公开示例用例
export function extractExamples(content, sampleCases = []) {
  const raw = content || ''
  const examples = []
  let match
  EXAMPLE_BLOCK.lastIndex = 0
  while ((match = EXAMPLE_BLOCK.exec(raw)) !== null) {
    const block = match[2]
    const input = block.match(/输入[\s:：]*([^\n\r]*)/)
    const output = block.match(/输出[\s:：]*([^\n\r]*)/)
    const explain = block.match(/解释[\s:：]*([^\n\r]*)/)
    if (input || output) {
      examples.push({
        input: input ? input[1].trim() : '',
        output: output ? output[1].trim() : '',
        explain: explain ? explain[1].trim() : ''
      })
    }
  }
  if (examples.length > 0) {
    return examples.slice(0, MAX_EXAMPLES)
  }
  return sampleCases.slice(0, MAX_EXAMPLES).map((item) => ({
    input: item.input || '',
    output: item.output || '',
    explain: ''
  }))
}

// 提示：描述中"提示"之后的各行
export function extractHints(content) {
  const raw = content || ''
  const index = raw.search(/提示[\s:：]/)
  if (index === -1) return []
  return raw.slice(index)
    .replace(/提示[\s:：]/, '')
    .trim()
    .split('\n')
    .map((line) => line.replace(/^[•\-*\d.]\s*/, '').trim())
    .filter(Boolean)
}

// 长示例独占整行
export function isLongExample(item) {
  const text = `${item.input || ''}${item.output || ''}`
  return text.length > 48 || text.includes('\n')
}
