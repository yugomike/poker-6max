// Panel displaying a player's range in shorthand notation with distribution

import type { Position } from '../lib/ranges/preflop'
import { useGameStore } from '../store/gameStore'
import { getRangePercentage, rangeToShorthand } from '../lib/poker'
import { CompactDistribution } from './RangeDistribution'

interface PlayerRangePanelProps {
  position: Position
}

export function PlayerRangePanel({ position }: PlayerRangePanelProps) {
  const { players, board } = useGameStore()
  const player = players.get(position)

  if (!player) return null

  const { range, isActive, isHero } = player

  if (!isActive) {
    return (
      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-500">{position}</span>
          <span className="text-xs text-red-400">Folded</span>
        </div>
      </div>
    )
  }

  if (!range) {
    return (
      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{position}</span>
          {isHero && <span className="text-xs text-blue-400">HERO</span>}
        </div>
        <p className="text-xs text-gray-500 mt-1">Waiting for action...</p>
      </div>
    )
  }

  const rangePercent = getRangePercentage(range)
  const shorthand = rangeToShorthand(range)
  const hasBoard = board.length >= 3

  return (
    <div className={`
      p-3 rounded-lg border
      ${isHero
        ? 'bg-blue-900/30 border-blue-700'
        : 'bg-gray-800/50 border-gray-700'
      }
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{position}</span>
        <span className="text-xs text-gray-400">
          {rangePercent.toFixed(1)}%
        </span>
      </div>

      {/* Shorthand notation */}
      <p className="text-sm text-green-400 font-mono leading-relaxed break-words mb-2">
        {shorthand}
      </p>

      {/* Distribution when board is available */}
      {hasBoard && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <CompactDistribution range={range} board={board} />
        </div>
      )}
    </div>
  )
}

export function ActivePlayersRanges() {
  const { players } = useGameStore()

  // Get positions that have acted (not folded)
  const activeWithRange = Array.from(players.values())
    .filter(p => p.isActive && p.range)
    .map(p => p.position)

  if (activeWithRange.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Enter preflop actions to see player ranges</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400">Player Ranges</h3>
      <div className="space-y-3">
        {activeWithRange.map(pos => (
          <PlayerRangePanel key={pos} position={pos} />
        ))}
      </div>
    </div>
  )
}
