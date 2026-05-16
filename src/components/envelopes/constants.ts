import type { EnvelopeType } from '../../types/envelope'

export const TYPE_LABELS: Record<EnvelopeType, string> = {
  spending: 'ХаниМани',
  reserve: 'Резервы',
  fund: 'Фонды',
  goal: 'Цели',
}

export const TYPE_ICONS: Record<EnvelopeType, string> = {
  spending: '🧃',
  reserve: '🛡️',
  fund: '🏦',
  goal: '🎯',
}

export const TYPE_ORDER: EnvelopeType[] = ['spending', 'reserve', 'fund', 'goal']
