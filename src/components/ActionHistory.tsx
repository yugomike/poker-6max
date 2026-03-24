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
      <div className="p-4 text-center text-gray-500 text-sm">
        No actions yet
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Preflop Action</h3>
      <div className="flex flex-wrap gap-1">
        {actions.map((action, idx) => (
          <span
            key={idx}
            className={`
              inline-flex items-center gap-1
              px-2 py-1 rounded
              bg-gray-800 text-sm
            `}
          >
            <span className="font-medium text-white">{action.position}</span>
            <span className={ACTION_COLORS[action.action]}>
              {ACTION_LABELS[action.action]}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
