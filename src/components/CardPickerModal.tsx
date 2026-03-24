// Card picker modal - fullscreen overlay for selecting cards

import type { Card, Suit } from '../lib/poker'
import { SUITS, RANKS, SUIT_SYMBOLS, RANK_SYMBOLS, cardToString } from '../lib/poker'

interface CardPickerModalProps {
  onSelect: (card: Card) => void
  onClose: () => void
  blockedCards?: Card[]
  title?: string
}

const SUIT_COLORS: Record<Suit, string> = {
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-500',
  s: 'text-gray-100',
}

const SUIT_BG: Record<Suit, string> = {
  h: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50',
  d: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50',
  c: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50',
  s: 'bg-gray-500/20 hover:bg-gray-500/30 border-gray-400/50',
}

export function CardPickerModal({
  onSelect,
  onClose,
  blockedCards = [],
  title = 'Select a card'
}: CardPickerModalProps) {
  const blockedSet = new Set(blockedCards.map(c => cardToString(c)))

  const handleSelect = (card: Card) => {
    onSelect(card)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 w-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button
            className="text-gray-400 hover:text-white text-xl px-2"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Card grid */}
        <div className="space-y-2">
          {SUITS.map(suit => (
            <div key={suit} className="flex items-center gap-1">
              {/* Suit indicator */}
              <span className={`w-6 text-lg ${SUIT_COLORS[suit]}`}>
                {SUIT_SYMBOLS[suit]}
              </span>

              {/* Cards for this suit */}
              <div className="flex gap-1">
                {[...RANKS].reverse().map(rank => {
                  const card: Card = { rank, suit }
                  const cardStr = cardToString(card)
                  const isBlocked = blockedSet.has(cardStr)

                  return (
                    <button
                      key={cardStr}
                      className={`
                        w-8 h-10 rounded border font-bold text-sm
                        flex items-center justify-center
                        transition-all
                        ${isBlocked
                          ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed'
                          : `${SUIT_BG[suit]} ${SUIT_COLORS[suit]} cursor-pointer`
                        }
                      `}
                      onClick={() => !isBlocked && handleSelect(card)}
                      disabled={isBlocked}
                    >
                      {RANK_SYMBOLS[rank]}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Cancel button */}
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
