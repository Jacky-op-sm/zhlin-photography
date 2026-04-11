const TARGET_CJK_CHARS = 100
const MIN_CJK_CHARS = 85
const MAX_CJK_CHARS = 120

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function splitBySentence(text: string): string[] {
  const matches = normalizeText(text).match(/[^。！？.!?]+[。！？.!?]+[”"』」）)]*|[^。！？.!?]+$/g)
  if (!matches) return []
  return matches.map((part) => part.trim()).filter(Boolean)
}

function cjkLength(text: string): number {
  const matched = text.match(/[\u3400-\u9FFF]/g)
  return matched ? matched.length : 0
}

export function extractDigestExcerpt(text: string): string {
  const source = normalizeText(text)
  if (!source) return ''

  const sentences = splitBySentence(source)
  if (!sentences.length) return source

  const selected: string[] = []
  let joined = ''
  let currentCjk = 0

  for (const sentence of sentences) {
    const next = selected.length ? `${joined} ${sentence}` : sentence
    const nextCjk = cjkLength(next)

    if (selected.length > 0 && currentCjk >= MIN_CJK_CHARS && nextCjk > MAX_CJK_CHARS) {
      break
    }

    selected.push(sentence)
    joined = next
    currentCjk = nextCjk

    if (currentCjk >= TARGET_CJK_CHARS) {
      break
    }
  }

  return joined || source
}

