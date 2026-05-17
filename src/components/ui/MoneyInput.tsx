import { NumericFormat, type NumericFormatProps } from 'react-number-format'

const INPUT_CLASS =
  'w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink font-mono outline-none focus:border-yellow transition-colors'

export default function MoneyInput(props: NumericFormatProps) {
  return <NumericFormat thousandSeparator=" " decimalScale={0} className={INPUT_CLASS} {...props} />
}
