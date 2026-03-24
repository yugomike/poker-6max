// Card picker component for selecting cards

import type { Card, Suit } from '../lib/poker'
import { SUITS, RANKS, SUIT_SYMBOLS, RANK_SYMBOLS, cardToString } from '../lib/poker'

interface CardPickerProps {
  onSelect: (card: Card) => void
  blockedCards?: Card[] // Cards that can't be selected (already on board or in hero's hand)
  selectedCards?: Card[] // Currently selected cards (highlighted)
}

const SUIT_COLORS: Record<Suit, string> = {
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-500',
  s: 'text-gray-300',
}

const SUIT_BG_COLORS: Record<Suit, string> = {
  h: 'bg-red-500/20 border-red-500/50',
  d: 'bg-blue-500/20 border-blue-500/50',
  c: 'bg-green-500/20 border-green-500/50',
  s: 'bg-gray-500/20 border-gray-500/50',
}

export function CardPicker({ onSelect, blockedCards = [], selectedCards = [] }: CardPickerProps) {
  const blockedSet = new Set(blockedCards.map(c => cardToString(c)))
  const selectedSet = new Set(selectedCards.map(c => cardToString(c)))

  return (
    <div className="inline-block space-y-0.5">
      {SUITS.map(suit => (
        <div key={suit} className="flex gap-0.5">
          {[...RANKS].reverse().map(rank => {
            const card: Card = { rank, suit }
            const cardStr = cardToString(card)
            const isBlocked = blockedSet.has(cardStr)
            const isSelected = selectedSet.has(cardStr)

            return (
              <button
                key={cardStr}
                className={`
                  w-6 h-7 rounded border text-xs font-bold
                  flex items-center justify-center
                  transition-all
                  ${isBlocked
                    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                    : isSelected
                      ? `${SUIT_BG_COLORS[suit]} border-2`
                      : `bg-gray-700 border-gray-600 hover:bg-gray-600 ${SUIT_COLORS[suit]}`
                  }
                `}
                onClick={() => !isBlocked && onSelect(card)}
                disabled={isBlocked}
              >
                <span className={isBlocked ? 'text-gray-600' : SUIT_COLORS[suit]}>
                  {RANK_SYMBOLS[rank]}
                </span>
              </button>
            )
          })}
          {/* Suit indicator at end of row */}
          <span className={`w-4 flex items-center justify-center text-sm ${SUIT_COLORS[suit]}`}>
            {SUIT_SYMBOLS[suit]}
          </span>
        </div>
      ))}
    </div>
  )
}

// Compact card display component
interface CardDisplayProps {
  card: Card
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function CardDisplay({ card, size = 'md', onClick }: CardDisplayProps) {
  const sizeClasses = {
    sm: 'w-6 h-8 text-xs',
    md: 'w-8 h-10 text-sm',
    lg: 'w-10 h-12 text-base',
  }

  return (
    <button
      className={`
        ${sizeClasses[size]}
        rounded border-2 font-bold
        flex flex-col items-center justify-center
        ${SUIT_BG_COLORS[card.suit]}
        ${SUIT_COLORS[card.suit]}
        ${onClick ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}
      `}
      onClick={onClick}
    >
      <span>{RANK_SYMBOLS[card.rank]}</span>
      <span className="text-[10px]">{SUIT_SYMBOLS[card.suit]}</span>
    </button>
  )
}

// Empty card slot
interface EmptyCardSlotProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function EmptyCardSlot({ label, size = 'md', onClick }: EmptyCardSlotProps) {
  const sizeClasses = {
    sm: 'w-6 h-8 text-[10px]',
    md: 'w-8 h-10 text-xs',
    lg: 'w-10 h-12 text-sm',
  }

  return (
    <button
      className={`
        ${sizeClasses[size]}
        rounded border-2 border-dashed border-gray-600
        flex items-center justify-center
        text-gray-500
        hover:border-gray-500 hover:text-gray-400
        transition-colors
      `}
      onClick={onClick}
    >
      {label || '?'}
    </button>
  )
}
