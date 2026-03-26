// 6-max Table visualization component

import { useState } from 'react'
import type { Position } from '../lib/ranges/preflop'
import { POSITIONS } from '../lib/ranges/preflop'
import type { PlayerState } from '../store/gameStore'
import { useGameStore } from '../store/gameStore'
import type { Card } from '../lib/poker'
import { CardDisplay, EmptyCardSlot } from './CardPicker'
import { CardPickerModal } from './CardPickerModal'

interface TableProps {
  onPositionClick?: (position: Position) => void
}

// Position coordinates for a 6-max table (relative positioning)
const POSITION_COORDS: Record<Position, { top: string; left: string }> = {
  UTG: { top: '15%', left: '15%' },
  HJ: { top: '15%', left: '50%' },
  CO: { top: '15%', left: '85%' },
  BTN: { top: '75%', left: '85%' },
  SB: { top: '75%', left: '50%' },
  BB: { top: '75%', left: '15%' },
}

interface SeatProps {
  player: PlayerState
  isActing: boolean
  onClick?: () => void
  heroHoleCards?: [Card, Card] | null
  onHeroCardClick?: (slotIndex: 0 | 1) => void
}

function Seat({ player, isActing, onClick, heroHoleCards, onHeroCardClick }: SeatProps) {
  const { position, isActive, isHero, range } = player

  let bgColor = 'bg-gray-700'
  let borderColor = 'border-gray-600'

  if (!isActive) {
    bgColor = 'bg-gray-800'
    borderColor = 'border-gray-700'
  } else if (isHero) {
    bgColor = 'bg-blue-900'
    borderColor = 'border-blue-500'
  } else if (range) {
    bgColor = 'bg-green-900'
    borderColor = 'border-green-500'
  }

  if (isActing) {
    borderColor = 'border-yellow-400'
  }

  const coords = POSITION_COORDS[position]

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="relative">
        <button
          className={`
            ${bgColor}
            border-2 ${borderColor}
            rounded-lg
            w-16 h-16 sm:w-20 sm:h-20
            flex flex-col items-center justify-center
            transition-all
            ${isActive ? 'hover:brightness-110' : 'opacity-50'}
            ${isActing ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
          `}
          onClick={onClick}
        >
          <span className="text-sm sm:text-base font-bold text-white">
            {position}
          </span>
          {isHero && !heroHoleCards && (
            <span className="text-[10px] text-blue-300">HERO</span>
          )}
          {!isActive && (
            <span className="text-[10px] text-gray-500">FOLD</span>
          )}
          {isActive && range && !isHero && (
            <span className="text-[10px] text-green-300">RANGE</span>
          )}
        </button>

        {/* Hero hole cards overlaid on seat */}
        {isHero && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {heroHoleCards ? (
              <>
                <CardDisplay
                  card={heroHoleCards[0]}
                  size="sm"
                  onClick={() => onHeroCardClick?.(0)}
                />
                <CardDisplay
                  card={heroHoleCards[1]}
                  size="sm"
                  onClick={() => onHeroCardClick?.(1)}
                />
              </>
            ) : (
              <>
                <EmptyCardSlot size="sm" onClick={() => onHeroCardClick?.(0)} />
                <EmptyCardSlot size="sm" onClick={() => onHeroCardClick?.(1)} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Table({ onPositionClick }: TableProps) {
  const { players, actingPosition, heroPosition, heroHoleCards, setHeroHoleCards, board } = useGameStore()
  const [showCardPicker, setShowCardPicker] = useState(false)
  const [editingSlot, setEditingSlot] = useState<0 | 1>(0)
  // Temporary storage for first card when selecting both cards
  const [pendingFirstCard, setPendingFirstCard] = useState<Card | null>(null)

  const handleHeroCardClick = (slotIndex: 0 | 1) => {
    setEditingSlot(slotIndex)
    setShowCardPicker(true)
  }

  const handleCardSelect = (card: Card) => {
    if (heroHoleCards) {
      // Editing existing cards - replace the selected slot
      const newCards: [Card, Card] = [...heroHoleCards]
      newCards[editingSlot] = card
      setHeroHoleCards(newCards)
      setShowCardPicker(false)
    } else if (pendingFirstCard) {
      // We have the first card, now we got the second
      if (editingSlot === 0) {
        setHeroHoleCards([card, pendingFirstCard])
      } else {
        setHeroHoleCards([pendingFirstCard, card])
      }
      setPendingFirstCard(null)
      setShowCardPicker(false)
    } else {
      // First card selected - store it and prompt for second
      setPendingFirstCard(card)
      setEditingSlot(1)
      // Keep picker open for second card
    }
  }

  const handlePickerClose = () => {
    setShowCardPicker(false)
    setPendingFirstCard(null)
  }

  // Cards blocked from selection (board + other hero card + pending first card)
  const blockedCards: Card[] = [...board]
  if (heroHoleCards) {
    // When editing one slot, block the other slot's card
    const otherSlot = editingSlot === 0 ? 1 : 0
    blockedCards.push(heroHoleCards[otherSlot])
  }
  if (pendingFirstCard) {
    blockedCards.push(pendingFirstCard)
  }

  const getPickerTitle = () => {
    if (pendingFirstCard) {
      return 'Select second hole card'
    }
    if (!heroHoleCards) {
      return 'Select first hole card'
    }
    return `Change hole card ${editingSlot + 1}`
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
      {/* Table felt */}
      <div className="absolute inset-4 bg-green-800 rounded-[50%] border-8 border-amber-900 shadow-lg">
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-green-600/50 text-lg font-bold">
            6-MAX
          </span>
        </div>
      </div>

      {/* Seats */}
      {POSITIONS.map((pos) => {
        const player = players.get(pos)!
        return (
          <Seat
            key={pos}
            player={player}
            isActing={pos === actingPosition}
            onClick={() => onPositionClick?.(pos)}
            heroHoleCards={player.isHero ? heroHoleCards : undefined}
            onHeroCardClick={player.isHero ? handleHeroCardClick : undefined}
          />
        )
      })}

      {/* Dealer button indicator */}
      {heroPosition && (
        <div
          className="absolute w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold shadow-lg border-2 border-gray-300"
          style={{
            top: `calc(${POSITION_COORDS.BTN.top} - 30px)`,
            left: `calc(${POSITION_COORDS.BTN.left} - 30px)`,
          }}
        >
          D
        </div>
      )}

      {/* Card picker modal */}
      {showCardPicker && (
        <CardPickerModal
          title={getPickerTitle()}
          onSelect={handleCardSelect}
          onClose={handlePickerClose}
          blockedCards={blockedCards}
        />
      )}
    </div>
  )
}
