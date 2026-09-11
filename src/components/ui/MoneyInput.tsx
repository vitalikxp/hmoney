import { useState } from 'preact/hooks'
import type { TargetedEvent } from 'preact'

export interface MoneyValue {
  floatValue?: number
}

interface MoneyInputProps {
  id?: string
  value: number | '' | undefined
  onValueChange?: (v: MoneyValue) => void
  allowNegative?: boolean
  required?: boolean
  disabled?: boolean
  onFocus?: (e: TargetedEvent<HTMLInputElement>) => void
  className?: string
  [rest: string]: unknown
}

const INPUT_CLASS =
  'w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink font-mono outline-none focus:border-yellow transition-colors'

function groupDigits(raw: string): string {
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Собственная замена react-number-format: целые рубли, разделитель разрядов,
// опциональный минус. Нейтрально к рендеру (preact), без внешних зависимостей.
export default function MoneyInput({
  id,
  value,
  onValueChange,
  allowNegative = false,
  required,
  disabled,
  onFocus,
  className,
  ...rest
}: MoneyInputProps) {
  const [text, setText] = useState<string>(() =>
    value === undefined || value === '' ? '' : groupDigits(String(value)),
  )
  const [lastPropValue, setLastPropValue] = useState(value)

  if (value !== lastPropValue) {
    setLastPropValue(value)
    setText(value === undefined || value === '' ? '' : groupDigits(String(value)))
  }

  const handleInput = (e: TargetedEvent<HTMLInputElement>) => {
    let raw = e.currentTarget.value.replace(/\s/g, '')
    if (!allowNegative) raw = raw.replace(/-/g, '')
    raw = raw.replace(/[^\d-]/g, '')
    raw = raw.replace(/(?!^)-/g, '')

    const floatValue = raw === '' || raw === '-' ? undefined : parseInt(raw, 10)
    setText(raw === '-' ? '-' : groupDigits(raw))
    onValueChange?.({ floatValue })
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      required={required}
      disabled={disabled}
      value={text}
      onInput={handleInput}
      onFocus={onFocus}
      className={className ?? INPUT_CLASS}
      {...rest}
    />
  )
}
