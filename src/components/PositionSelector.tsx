// Position selector for choosing hero's seat

import { POSITIONS, POSITION_LABELS } from '../lib/ranges/preflop'
import { useGameStore } from '../store/gameStore'

export function PositionSelector() {
  const { heroPosition, setHeroPosition } = useGameStore()

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">
        Select Your Position
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            className={`
              px-4 py-2 rounded-lg font-medium
              transition-colors
              ${heroPosition === pos
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
            onClick={() => setHeroPosition(pos)}
          >
            {pos}
          </button>
        ))}
      </div>
      {heroPosition && (
        <p className="text-center text-sm text-gray-500 mt-2">
          You are in the {POSITION_LABELS[heroPosition]} ({heroPosition})
        </p>
      )}
    </div>
  )
}
