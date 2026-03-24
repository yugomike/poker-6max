// Action input component for preflop actions

import type { ActionType } from '../store/gameStore'
import { useGameStore } from '../store/gameStore'

interface ActionButtonProps {
  label: string
  action: ActionType
  onClick: () => void
  variant?: 'default' | 'danger' | 'success'
  disabled?: boolean
}

function ActionButton({
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: ActionButtonProps) {
  const variantClasses = {
    default: 'bg-gray-700 hover:bg-gray-600 text-white',
    danger: 'bg-red-700 hover:bg-red-600 text-white',
    success: 'bg-green-700 hover:bg-green-600 text-white',
  }

  return (
    <button
      className={`
        ${variantClasses[variant]}
        px-4 py-3 rounded-lg font-medium
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[80px]
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export function ActionInput() {
  const { actingPosition, actions, addAction, undoLastAction, resetHand } = useGameStore()

  if (!actingPosition) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <p className="text-gray-400">Action complete for this round</p>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
          onClick={resetHand}
        >
          New Hand
        </button>
      </div>
    )
  }

  // Determine available actions based on prior action
  const hasRaise = actions.some(
    a => a.action === 'raise' || a.action === '3bet' || a.action === '4bet'
  )
  const has3Bet = actions.some(a => a.action === '3bet')
  const has4Bet = actions.some(a => a.action === '4bet')

  const handleAction = (action: ActionType) => {
    addAction({ position: actingPosition, action })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-center">
        <span className="text-gray-400">Action on: </span>
        <span className="text-yellow-400 font-bold">{actingPosition}</span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <ActionButton
          label="Fold"
          action="fold"
          onClick={() => handleAction('fold')}
          variant="danger"
        />

        {!hasRaise && (
          <ActionButton
            label="Raise"
            action="raise"
            onClick={() => handleAction('raise')}
            variant="success"
          />
        )}

        {hasRaise && !has3Bet && (
          <>
            <ActionButton
              label="Call"
              action="call"
              onClick={() => handleAction('call')}
            />
            <ActionButton
              label="3-Bet"
              action="3bet"
              onClick={() => handleAction('3bet')}
              variant="success"
            />
          </>
        )}

        {has3Bet && !has4Bet && (
          <>
            <ActionButton
              label="Call"
              action="call"
              onClick={() => handleAction('call')}
            />
            <ActionButton
              label="4-Bet"
              action="4bet"
              onClick={() => handleAction('4bet')}
              variant="success"
            />
          </>
        )}

        {has4Bet && (
          <>
            <ActionButton
              label="Call"
              action="call"
              onClick={() => handleAction('call')}
            />
            <ActionButton
              label="All-in"
              action="allin"
              onClick={() => handleAction('allin')}
              variant="success"
            />
          </>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex justify-center gap-2 mt-2">
          <button
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
            onClick={undoLastAction}
          >
            ← Undo
          </button>
          <button
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
            onClick={resetHand}
          >
            Reset Hand
          </button>
        </div>
      )}
    </div>
  )
}
