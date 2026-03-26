import { useCallback, useMemo } from 'react'
import type { Card } from '../../lib/poker/cards'
import {
  getHandTypeFromPosition,
  handTypeToString,
  getCombosForHandType,
  getUnblockedCombos,
  parseHandType,
} from '../../lib/poker/combos'
import { getWeight, setWeight } from '../../lib/poker/range'
import type { RangeVisualizerProps, ComboInfo } from './types'
import { RangeCell } from './RangeCell'
import { useDragSelection } from './useDragSelection'

function getComboInfo(handType: string, blockers: Card[]): ComboInfo | null {
  if (blockers.length === 0) return null

  const ht = parseHandType(handType)
  if (!ht) return null

  const total = getCombosForHandType(ht).length
  const available = getUnblockedCombos(ht, blockers).length
  const blocked = total - available

  return { total, blocked, available }
}

export function RangeVisualizer({
  range,
  onChange,
  blockers = [],
  readonly = false,
  size = 'md',
  showComboCount = false,
}: RangeVisualizerProps) {
  const isReadonly = readonly || !onChange

  // Memoize combo info calculations
  const comboInfoMap = useMemo(() => {
    if (blockers.length === 0) return null

    const map = new Map<string, ComboInfo>()
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const ht = getHandTypeFromPosition(row, col)
        const htStr = handTypeToString(ht)
        const info = getComboInfo(htStr, blockers)
        if (info) {
          map.set(htStr, info)
        }
      }
    }
    return map
  }, [blockers])

  const getCellWeight = useCallback(
    (row: number, col: number): number => {
      const ht = getHandTypeFromPosition(row, col)
      const htStr = handTypeToString(ht)
      return getWeight(range, htStr)
    },
    [range]
  )

  const handleSelectionComplete = useCallback(
    (cells: Array<{ row: number; col: number }>, mode: 'add' | 'remove') => {
      if (isReadonly || !onChange) return

      let newRange = range
      for (const { row, col } of cells) {
        const ht = getHandTypeFromPosition(row, col)
        const htStr = handTypeToString(ht)
        newRange = setWeight(newRange, htStr, mode === 'add' ? 1 : 0)
      }
      onChange(newRange)
    },
    [range, onChange, isReadonly]
  )

  const { handleMouseDown, handleMouseEnter, isCellSelected } = useDragSelection({
    onSelectionComplete: handleSelectionComplete,
    getWeight: getCellWeight,
  })

  return (
    <div
      className="inline-block bg-gray-800 p-1 rounded select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 13 }).map((_, row) =>
          Array.from({ length: 13 }).map((_, col) => {
            const ht = getHandTypeFromPosition(row, col)
            const htStr = handTypeToString(ht)
            const weight = getWeight(range, htStr)
            const comboInfo = comboInfoMap?.get(htStr) ?? null

            return (
              <RangeCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                handType={htStr}
                weight={weight}
                comboInfo={comboInfo}
                isSelected={isCellSelected(row, col)}
                readonly={isReadonly}
                size={size}
                showComboCount={showComboCount}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
