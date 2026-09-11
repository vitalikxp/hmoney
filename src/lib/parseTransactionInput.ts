export interface ParsedTransactionInput {
  amount: number | null
  description: string
}

// Парсер строки «сумма и описание» из ХаниМани:
//   5*250 яблоки        → 1250, «яблоки»
//   500 молоко          → 500, «молоко»
//   5*250 молоко (х2)   → 1250, «молоко» — текст в (скобках) игнорируется
//   молоко              → null, «молоко»
export function parseTransactionInput(input: string): ParsedTransactionInput {
  let text = input.trim().replace(/\s+/g, ' ')
  if (!text) return { amount: null, description: '' }

  // Хвостовые скобки-комментарии вырезаем (только если они в конце строки)
  text = text.replace(/\s*\([^)]*\)\s*$/, '').trim()
  if (!text) return { amount: null, description: '' }

  const match = text.match(/^(\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)*)\s+(.*)$/)

  if (!match) {
    // нет суммы в начале — вся строка считается описанием
    return { amount: null, description: text }
  }

  const amountExpr = match[1].replace(/,/g, '.')
  const description = match[2].trim()

  const amount = amountExpr
    .split('*')
    .map((part) => parseFloat(part) || 0)
    .reduce((a, b) => a * b, 1)

  return { amount: amount > 0 ? amount : null, description }
}
