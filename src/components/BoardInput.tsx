// Board input component for entering flop/turn/river

import { useState } from 'react'
import type { Card } from '../lib/poker'
import { useGameStore } from '../store/gameStore'
import { CardDisplay, EmptyCardSlot } from './CardPicker'
import { CardPickerModal } from './CardPickerModal'

export function BoardInput() {
  const { board, setBoard, heroHoleCards } = useGameStore()
  const [showPicker, setShowPicker] = useState(false)

  const handleSelectCard = (card: Card) => {
    const newBoard = [...board, card]
    setBoard(newBoard)

    // Auto-close picker when street is complete
    if (newBoard.length === 3 || newBoard.length === 4 || newBoard.length === 5) {
      setShowPicker(false)
    }
  }

  const handleRemoveCard = (index: number) => {
    // Remove this card and all cards after it
    const newBoard = board.slice(0, index)
    setBoard(newBoard)
  }

  const getPickerTitle = () => {
    if (board.length < 3) return `Select flop card ${board.length + 1} of 3`
    if (board.length === 3) return 'Select turn card'
    if (board.length === 4) return 'Select river card'
    return 'Select card'
  }

  const getNextStreetLabel = () => {
    if (board.length === 0) return 'Deal Flop'
    if (board.length === 3) return '+ Turn'
    if (board.length === 4) return '+ River'
    return null
  }

  const nextStreetLabel = getNextStreetLabel()

  return (
    <div className="space-y-3">
      {/* Board display - all cards in one row */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Show existing cards */}
        {board.map((card, i) => (
          <CardDisplay
            key={i}
            card={card}
            size="md"
            onClick={() => handleRemoveCard(i)}
          />
        ))}

        {/* Show empty slots for current street */}
        {board.length < 3 && (
          // Flop slots
          [...Array(3 - board.length)].map((_, i) => (
            <EmptyCardSlot
              key={`empty-${i}`}
              size="md"
              onClick={() => setShowPicker(true)}
            />
          ))
        )}

        {/* Next street button */}
        {nextStreetLabel && board.length >= 3 && (
          <button
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs font-medium h-10"
            onClick={() => setShowPicker(true)}
          >
            {nextStreetLabel}
          </button>
        )}
      </div>

      {/* Deal flop button when no cards */}
      {board.length === 0 && (
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium"
          onClick={() => setShowPicker(true)}
        >
          Deal Flop
        </button>
      )}

      {/* Card picker modal */}
      {showPicker && (
        <CardPickerModal
          title={getPickerTitle()}
          onSelect={handleSelectCard}
          onClose={() => setShowPicker(false)}
          blockedCards={heroHoleCards ? [...board, ...heroHoleCards] : board}
        />
      )}

      {/* Clear board */}
      {board.length > 0 && (
        <button
          className="text-xs text-gray-500 hover:text-gray-400"
          onClick={() => setBoard([])}
        >
          Clear board
        </button>
      )}
    </div>
  )
}
