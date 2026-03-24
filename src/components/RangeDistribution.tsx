// Range distribution display - shows how a range hits the board

import type { Range } from '../lib/poker'
import type { Card } from '../lib/poker'
import {
  HandCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  calculateRangeDistribution,
  distributionToPercentages,
} from '../lib/poker'
import { getRangeCombos, rangeToComboWeights } from '../lib/poker'

interface RangeDistributionProps {
  range: Range
  board: Card[]
}

const CATEGORY_ORDER: HandCategory[] = [
  HandCategory.MONSTERS,
  HandCategory.TWO_PAIR,
  HandCategory.TOP_PAIR,
  HandCategory.MIDDLE_PAIR,
  HandCategory.BOTTOM_PAIR,
  HandCategory.DRAWS,
  HandCategory.AIR,
]

export function RangeDistribution({ range, board }: RangeDistributionProps) {
  if (board.length < 3) {
    return (
      <div className="text-xs text-gray-500">
        Enter flop to see distribution
      </div>
    )
  }

  // Get all combos and their weights
  const comboData = getRangeCombos(range, board)
  const combos = comboData.map(c => c.combo)
  const weights = rangeToComboWeights(range, board)

  // Calculate distribution
  const distribution = calculateRangeDistribution(combos, weights, board)
  const percentages = distributionToPercentages(distribution)

  return (
    <div className="space-y-1">
      {CATEGORY_ORDER.map(category => {
        const pct = percentages[category]
        if (pct === 0) return null

        return (
          <div key={category} className="flex items-center gap-2">
            {/* Bar */}
            <div className="flex-1 h-4 bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{
                  width: `${pct}%`,
                  backgroundColor: CATEGORY_COLORS[category],
                }}
              />
            </div>
            {/* Label and percentage */}
            <div className="w-24 text-xs text-right">
              <span className="text-gray-400">{CATEGORY_LABELS[category].split(' ')[0]}</span>
            </div>
            <div className="w-12 text-xs text-right font-mono">
              {pct.toFixed(1)}%
            </div>
          </div>
        )
      })}

      {/* Total combos */}
      <div className="text-xs text-gray-500 mt-2">
        {distribution.totalCombos.toFixed(0)} combos
      </div>
    </div>
  )
}

// Compact version for inline display
interface CompactDistributionProps {
  range: Range
  board: Card[]
}

export function CompactDistribution({ range, board }: CompactDistributionProps) {
  if (board.length < 3) {
    return null
  }

  const comboData = getRangeCombos(range, board)
  const combos = comboData.map(c => c.combo)
  const weights = rangeToComboWeights(range, board)
  const distribution = calculateRangeDistribution(combos, weights, board)
  const percentages = distributionToPercentages(distribution)

  // Show as stacked bar
  return (
    <div className="space-y-1">
      <div className="flex h-3 rounded overflow-hidden">
        {CATEGORY_ORDER.map(category => {
          const pct = percentages[category]
          if (pct < 1) return null

          return (
            <div
              key={category}
              className="h-full"
              style={{
                width: `${pct}%`,
                backgroundColor: CATEGORY_COLORS[category],
              }}
              title={`${CATEGORY_LABELS[category]}: ${pct.toFixed(1)}%`}
            />
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        {CATEGORY_ORDER.map(category => {
          const pct = percentages[category]
          if (pct < 1) return null

          return (
            <div key={category} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <span className="text-gray-400">
                {CATEGORY_LABELS[category].split(' ')[0]} {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
