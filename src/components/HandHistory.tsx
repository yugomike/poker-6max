// Hand history browser component

import { useState } from 'react'
import { useHandHistory } from '../hooks/useHandHistory'
import type { SavedHand } from '../lib/storage/db'
import { SUIT_SYMBOLS, RANK_SYMBOLS } from '../lib/poker'
import type { Card } from '../lib/poker'

function formatCard(card: Card): string {
  return `${RANK_SYMBOLS[card.rank]}${SUIT_SYMBOLS[card.suit]}`
}

function formatBoard(board: Card[]): string {
  if (board.length === 0) return '-'
  const flop = board.slice(0, 3).map(formatCard).join(' ')
  const turn = board[3] ? ` | ${formatCard(board[3])}` : ''
  const river = board[4] ? ` | ${formatCard(board[4])}` : ''
  return flop + turn + river
}

function formatActions(actions: SavedHand['actions']): string {
  return actions
    .filter(a => a.action !== 'fold')
    .map(a => `${a.position} ${a.action}`)
    .join(', ')
}

function formatDate(date: Date): string {
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface HandRowProps {
  hand: SavedHand
  onDelete: (id: number) => void
}

function HandRow({ hand, onDelete }: HandRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Header: position + timestamp */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-white">{hand.heroPosition}</span>
            <span className="text-gray-500">{formatDate(hand.timestamp)}</span>
          </div>

          {/* Actions summary */}
          <div className="text-xs text-gray-400 mt-1 truncate">
            {formatActions(hand.actions)}
          </div>

          {/* Board */}
          <div className="text-sm font-mono text-green-400 mt-1">
            {formatBoard(hand.board)}
          </div>

          {/* Tags */}
          {hand.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {hand.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Delete button */}
        <div>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded"
                onClick={() => hand.id && onDelete(hand.id)}
              >
                Yes
              </button>
              <button
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="text-gray-500 hover:text-red-400 text-xs"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function HandHistory() {
  const { hands, loading, removeHand } = useHandHistory()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white"
        onClick={() => setIsOpen(true)}
      >
        Hand History ({hands.length})
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">
          Hand History ({hands.length})
        </h3>
        <button
          className="text-xs text-gray-500 hover:text-gray-400"
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      ) : hands.length === 0 ? (
        <div className="text-center text-gray-500 py-4 text-sm">
          No saved hands yet
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {hands.map(hand => (
            <HandRow
              key={hand.id}
              hand={hand}
              onDelete={removeHand}
            />
          ))}
        </div>
      )}
    </div>
  )
}
