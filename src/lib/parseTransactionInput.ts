export interface ParsedTransactionInput {
  amount: number | null
  description: string
}

const AMOUNT_EXPR = /^\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)*$/

// Разбивка ввода на позиции по запятым.
// Запятая-разделитель позиций: «89 flash up, 120 gorilla mango».
// Запятая-десятичный разделитель: «1,5*100 пирожок» — левый сегмент без описания,
// склеиваем с правым через точку.
function splitPositions(text: string): string[] {
  const raw = text.split(',')
  const out: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const part = raw[i].trim()
    if (!part) continue
    const bareNumber = AMOUNT_EXPR.test(part)
    const nextIsDigit = i + 1 < raw.length && /^\d/.test(raw[i + 1].trim())
    if (bareNumber && nextIsDigit) {
      raw[i + 1] = `${part}.${raw[i + 1].trim()}`
      continue
    }
    out.push(part)
  }
  return out
}

// Парсер строки «сумма и описание» из ХаниМани (позиции через запятую):
//   500 молоко                     → 500, «молоко»
//   5*250 яблоки (х2)              → 1250, «яблоки» — (скобки) игнорируются
//   89 flash up, 120 gorilla mango → 209, «flash up, gorilla mango»
//   3*150 кофе, 2*200 пирожки      → 850, «кофе, пирожки»
export function parseTransactionInput(input: string): ParsedTransactionInput {
  const text = input.trim().replace(/\s+/g, ' ')
  if (!text) return { amount: null, description: '' }

  let total = 0
  let hasAmount = false
  const descriptions: string[] = []

  for (const position of splitPositions(text)) {
    // хвостовые скобки-комментарии игнорируются
    const stripped = position.replace(/\s*\([^)]*\)\s*$/, '').trim()
    if (!stripped) continue

    const match = stripped.match(/^(\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)*)\s+(.+)$/)

    if (match) {
      const amount = match[1]
        .replace(/,/g, '.')
        .split('*')
        .map((part) => parseFloat(part) || 0)
        .reduce((a, b) => a * b, 1)
      total += amount
      hasAmount = true
      const description = match[2].trim()
      if (description) descriptions.push(description)
    } else {
      descriptions.push(stripped)
    }
  }

  return { amount: hasAmount && total > 0 ? total : null, description: descriptions.join(', ') }
}
