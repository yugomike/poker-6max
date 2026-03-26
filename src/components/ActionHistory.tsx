// Action history display component

import type { ActionType } from '../store/gameStore'
import { useGameStore } from '../store/gameStore'

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'folds',
  call: 'calls',
  raise: 'raises',
  '3bet': '3-bets',
  '4bet': '4-bets',
  allin: 'all-in',
}

const ACTION_COLORS: Record<ActionType, string> = {
  fold: 'text-red-400',
  call: 'text-gray-300',
  raise: 'text-green-400',
  '3bet': 'text-yellow-400',
  '4bet': 'text-orange-400',
  allin: 'text-purple-400',
}

export function ActionHistory() {
  const { actions } = useGameStore()

  if (actions.length === 0) {
    return (
      <div className="px-3 py-2 text-center text-gray-500 text-xs">
        No actions yet
      </div>
    )
  }

  return (
    <div className="px-3 py-2">
      <h3 className="text-xs font-medium text-gray-500 mb-1">Preflop</h3>
      <div className="space-y-0.5">
        {actions.map((action, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="font-medium text-white w-8">{action.position}</span>
            <span className={ACTION_COLORS[action.action]}>
              {ACTION_LABELS[action.action]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
