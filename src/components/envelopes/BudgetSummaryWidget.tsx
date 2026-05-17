interface Props {
  spendingBalance: number
  reserveBalance: number
  envelopesBalance: number
  total: number
}

interface BreakdownRowProps {
  icon: string
  label: string
  balance: number
}

function BreakdownRow({ icon, label, balance }: BreakdownRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated text-sm leading-none">
          {icon}
        </span>
        <span className="truncate text-sm text-muted">{label}</span>
      </div>
      <span className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink">
        {balance.toLocaleString('ru-RU')}₽
      </span>
    </div>
  )
}

export default function BudgetSummaryWidget({ spendingBalance, reserveBalance, envelopesBalance, total }: Props) {
  return (
    <div className="card-glow overflow-hidden rounded-lg border border-hairline">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase text-muted">Всего</div>
            <div className="mt-1 break-words font-mono text-2xl font-semibold tabular-nums text-link">
              {total.toLocaleString('ru-RU')}₽
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow/10 text-xl">
            📊
          </div>
        </div>
      </div>
      <div>
        <BreakdownRow icon="🐝" label="ХаниМани" balance={spendingBalance} />
        <BreakdownRow icon="🛡️" label="Резервы" balance={reserveBalance} />
        <BreakdownRow icon="✉️" label="Конверты" balance={envelopesBalance} />
      </div>
    </div>
  )
}
