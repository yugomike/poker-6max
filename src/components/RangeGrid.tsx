// 13x13 Range Grid component

import type { Range } from '../lib/poker'
import { getWeight, getHandTypeFromPosition, handTypeToString } from '../lib/poker'

interface RangeGridProps {
  range: Range | null
  onCellClick?: (handType: string) => void
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const SIZE_CLASSES = {
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-7 h-7 text-[10px]',
  lg: 'w-9 h-9 text-xs',
}

export function RangeGrid({
  range,
  onCellClick,
  size = 'md',
  interactive = false,
}: RangeGridProps) {
  const cellClass = SIZE_CLASSES[size]

  return (
    <div className="inline-block bg-gray-800 p-1 rounded">
      <div className="grid grid-cols-13 gap-px">
        {Array.from({ length: 13 }).map((_, row) =>
          Array.from({ length: 13 }).map((_, col) => {
            const ht = getHandTypeFromPosition(row, col)
            const htStr = handTypeToString(ht)
            const weight = range ? getWeight(range, htStr) : 0

            // Determine cell type for styling
            const isPair = row === col
            const isSuited = row < col
            // const isOffsuit = row > col

            // Calculate background color based on weight
            let bgColor = 'bg-gray-700'
            if (weight > 0) {
              if (weight >= 1) {
                bgColor = 'bg-green-500'
              } else if (weight >= 0.5) {
                bgColor = 'bg-green-600'
              } else {
                bgColor = 'bg-green-700'
              }
            }

            // Add border styling for cell type
            let borderStyle = ''
            if (isPair) {
              borderStyle = 'ring-1 ring-yellow-500/30'
            } else if (isSuited) {
              borderStyle = 'ring-1 ring-blue-500/20'
            }

            return (
              <button
                key={`${row}-${col}`}
                className={`
                  ${cellClass}
                  ${bgColor}
                  ${borderStyle}
                  flex items-center justify-center
                  font-mono font-medium
                  text-white/90
                  rounded-sm
                  transition-colors
                  ${interactive ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}
                  ${weight > 0 ? '' : 'text-white/40'}
                `}
                onClick={() => interactive && onCellClick?.(htStr)}
                disabled={!interactive}
              >
                {htStr.replace('s', '').replace('o', '')}
                {!isPair && (
                  <span className="text-[6px] opacity-60">
                    {isSuited ? 's' : 'o'}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
