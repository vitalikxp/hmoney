interface Props {
  spendingBalance: number
  reserveBalance: number
  goalsBalance: number
  total: number
}

interface TileProps {
  icon: string
  label: string
  balance: number
  accent?: boolean
}

function Tile({ icon, label, balance, accent }: TileProps) {
  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-4 ${accent ? 'bg-elevated/70' : ''}`}>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-sm font-mono font-semibold tabular-nums ${accent ? 'text-ink' : 'text-ink'}`}>
        {balance.toLocaleString('ru-RU')}₽
      </span>
    </div>
  )
}

export default function BudgetSummaryWidget({ spendingBalance, reserveBalance, goalsBalance, total }: Props) {
  return (
    <div className="border border-hairline rounded-lg overflow-hidden">
            <div className="flex flex-nowrap overflow-x-auto divide-x divide-hairline">
        <Tile icon="🧃" label="ХаниМани" balance={spendingBalance} />
        <Tile icon="🛡️" label="Резервы" balance={reserveBalance} />
        <Tile icon="🏦" label="Накопления" balance={goalsBalance} />
        <Tile icon="📊" label="Всего" balance={total} accent />
      </div>
    </div>
  )
}
