// Range vs board analysis - categorizing hands and calculating distributions

import type { Card } from './cards'
import type { Combo } from './combos'
import { HandRanking, findBestHand } from './handRank'

/**
 * Hand categories for range distribution analysis
 */
export const HandCategory = {
  MONSTERS: 'monsters',       // Sets, straights, flushes, full houses, quads
  TWO_PAIR: 'twoPair',       // Two pair
  TOP_PAIR: 'topPair',       // Pair with the highest board card
  MIDDLE_PAIR: 'middlePair', // Pair with a middle board card
  BOTTOM_PAIR: 'bottomPair', // Pair with the lowest board card or underpair
  DRAWS: 'draws',            // Flush draws, open-ended straight draws
  AIR: 'air',                // High card only, no significant draw
} as const

export type HandCategory = (typeof HandCategory)[keyof typeof HandCategory]

export const CATEGORY_LABELS: Record<HandCategory, string> = {
  [HandCategory.MONSTERS]: 'Monsters (Sets+)',
  [HandCategory.TWO_PAIR]: 'Two Pair',
  [HandCategory.TOP_PAIR]: 'Top Pair',
  [HandCategory.MIDDLE_PAIR]: 'Middle Pair',
  [HandCategory.BOTTOM_PAIR]: 'Weak Pair',
  [HandCategory.DRAWS]: 'Draws',
  [HandCategory.AIR]: 'Air',
}

export const CATEGORY_COLORS: Record<HandCategory, string> = {
  [HandCategory.MONSTERS]: '#22c55e',    // Green
  [HandCategory.TWO_PAIR]: '#84cc16',    // Lime
  [HandCategory.TOP_PAIR]: '#eab308',    // Yellow
  [HandCategory.MIDDLE_PAIR]: '#f97316', // Orange
  [HandCategory.BOTTOM_PAIR]: '#ef4444', // Red
  [HandCategory.DRAWS]: '#3b82f6',       // Blue
  [HandCategory.AIR]: '#6b7280',         // Gray
}

/**
 * Check if cards form a flush draw (4 cards of same suit)
 */
function hasFlushDraw(holeCards: Card[], board: Card[]): boolean {
  const allCards = [...holeCards, ...board]
  const suitCounts = new Map<string, number>()

  for (const card of allCards) {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1)
  }

  // Check if we have exactly 4 of a suit with at least one hole card contributing
  for (const [suit, count] of suitCounts) {
    if (count === 4) {
      const holeCardsOfSuit = holeCards.filter(c => c.suit === suit).length
      if (holeCardsOfSuit >= 1) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if cards form an open-ended straight draw (8 outs)
 */
function hasOESD(holeCards: Card[], board: Card[]): boolean {
  const allCards = [...holeCards, ...board]
  const ranks = [...new Set(allCards.map(c => c.rank))].sort((a, b) => a - b)

  // Need to use at least one hole card
  const holeRanks = new Set(holeCards.map(c => c.rank))

  // Check for 4 consecutive cards with both ends open
  for (let i = 0; i <= ranks.length - 4; i++) {
    const sequence = ranks.slice(i, i + 4)
    if (sequence.length === 4) {
      // Check if they're consecutive
      let consecutive = true
      for (let j = 1; j < sequence.length; j++) {
        if (sequence[j] - sequence[j - 1] !== 1) {
          consecutive = false
          break
        }
      }

      if (consecutive) {
        // Check that it's open-ended (not at the edges)
        const low = sequence[0]
        const high = sequence[3]
        const openEnded = low > 2 && high < 14 // Can't be A-2-3-4 or J-Q-K-A

        // Check that at least one hole card is in the sequence
        const usesHoleCard = sequence.some(r => holeRanks.has(r))

        if (openEnded && usesHoleCard) {
          return true
        }
      }
    }
  }

  // Also check wheel draw (A-2-3-4) - technically a special case
  const hasAce = ranks.includes(14)
  const has2 = ranks.includes(2)
  const has3 = ranks.includes(3)
  const has4 = ranks.includes(4)
  const has5 = ranks.includes(5)

  if (hasAce && has2 && has3 && has4 && !has5) {
    // A-2-3-4 needs a 5 (4 outs, technically a gutshot but often played as draw)
    const usesHoleCard = holeRanks.has(14) || holeRanks.has(2) || holeRanks.has(3) || holeRanks.has(4)
    if (usesHoleCard) return true
  }

  return false
}

/**
 * Categorize a combo against a board
 */
export function categorizeHand(combo: Combo, board: Card[]): HandCategory {
  if (board.length < 3) {
    return HandCategory.AIR // Can't categorize without flop
  }

  const holeCards = combo.cards
  const allCards = [...holeCards, ...board]
  const { value } = findBestHand(allCards)

  // Sort board cards by rank (descending) to determine top/middle/bottom
  const boardRanks = [...board].map(c => c.rank).sort((a, b) => b - a)
  const topBoardRank = boardRanks[0]
  const bottomBoardRank = boardRanks[boardRanks.length - 1]
  const middleBoardRanks = boardRanks.slice(1, -1)

  // Monsters: sets or better
  if (value.ranking >= HandRanking.THREE_OF_A_KIND && value.ranking !== HandRanking.THREE_OF_A_KIND) {
    return HandCategory.MONSTERS
  }

  // Three of a kind needs special handling - could be set or trips
  if (value.ranking === HandRanking.THREE_OF_A_KIND) {
    const tripRank = value.kickers[0]
    const holeRanks = holeCards.map(c => c.rank)

    // It's a set if we have a pocket pair that made trips
    const isPocketPair = holeRanks[0] === holeRanks[1]
    if (isPocketPair && holeRanks[0] === tripRank) {
      return HandCategory.MONSTERS // Set
    }

    // Otherwise it's trips (one hole card + board pair) - categorize as top/middle/bottom pair
    // depending on where the trips rank falls
  }

  // Two pair
  if (value.ranking === HandRanking.TWO_PAIR) {
    // Check if at least one pair uses a hole card
    const holeRanks = new Set(holeCards.map(c => c.rank))
    const pairRanks = [value.kickers[0], value.kickers[1]]

    const usesHoleCard = pairRanks.some(r => holeRanks.has(r))
    if (usesHoleCard) {
      return HandCategory.TWO_PAIR
    }
    // Board two pair - categorize based on kicker
  }

  // One pair - categorize by position
  if (value.ranking === HandRanking.ONE_PAIR) {
    const pairRank = value.kickers[0]
    const holeRanks = holeCards.map(c => c.rank)

    // Check if the pair uses a hole card
    const usesHoleCard = holeRanks.includes(pairRank)

    if (usesHoleCard) {
      // Pocket pair below board (underpair)
      if (holeRanks[0] === holeRanks[1] && pairRank < bottomBoardRank) {
        return HandCategory.BOTTOM_PAIR
      }

      // Pocket pair above board (overpair) - treat as top pair equivalent
      if (holeRanks[0] === holeRanks[1] && pairRank > topBoardRank) {
        return HandCategory.TOP_PAIR
      }

      // Pair with board card
      if (pairRank === topBoardRank) {
        return HandCategory.TOP_PAIR
      } else if (pairRank === bottomBoardRank) {
        return HandCategory.BOTTOM_PAIR
      } else if (middleBoardRanks.includes(pairRank)) {
        return HandCategory.MIDDLE_PAIR
      }

      // Pocket pair between board cards
      return HandCategory.MIDDLE_PAIR
    }
  }

  // Check for draws
  if (hasFlushDraw(holeCards, board) || hasOESD(holeCards, board)) {
    return HandCategory.DRAWS
  }

  // Air - high card only
  return HandCategory.AIR
}

/**
 * Distribution of hand categories for a range
 */
export interface RangeDistribution {
  [HandCategory.MONSTERS]: number
  [HandCategory.TWO_PAIR]: number
  [HandCategory.TOP_PAIR]: number
  [HandCategory.MIDDLE_PAIR]: number
  [HandCategory.BOTTOM_PAIR]: number
  [HandCategory.DRAWS]: number
  [HandCategory.AIR]: number
  totalCombos: number
}

/**
 * Calculate the distribution of hand categories for a range against a board
 */
export function calculateRangeDistribution(
  combos: Combo[],
  weights: Map<string, number>, // combo key -> weight (0-1)
  board: Card[]
): RangeDistribution {
  const distribution: RangeDistribution = {
    [HandCategory.MONSTERS]: 0,
    [HandCategory.TWO_PAIR]: 0,
    [HandCategory.TOP_PAIR]: 0,
    [HandCategory.MIDDLE_PAIR]: 0,
    [HandCategory.BOTTOM_PAIR]: 0,
    [HandCategory.DRAWS]: 0,
    [HandCategory.AIR]: 0,
    totalCombos: 0,
  }

  for (const combo of combos) {
    const key = comboToKey(combo)
    const weight = weights.get(key) ?? 1

    if (weight === 0) continue

    const category = categorizeHand(combo, board)
    distribution[category] += weight
    distribution.totalCombos += weight
  }

  return distribution
}

/**
 * Convert distribution to percentages
 */
export function distributionToPercentages(dist: RangeDistribution): Record<HandCategory, number> {
  const total = dist.totalCombos
  if (total === 0) {
    return {
      [HandCategory.MONSTERS]: 0,
      [HandCategory.TWO_PAIR]: 0,
      [HandCategory.TOP_PAIR]: 0,
      [HandCategory.MIDDLE_PAIR]: 0,
      [HandCategory.BOTTOM_PAIR]: 0,
      [HandCategory.DRAWS]: 0,
      [HandCategory.AIR]: 0,
    }
  }

  return {
    [HandCategory.MONSTERS]: (dist[HandCategory.MONSTERS] / total) * 100,
    [HandCategory.TWO_PAIR]: (dist[HandCategory.TWO_PAIR] / total) * 100,
    [HandCategory.TOP_PAIR]: (dist[HandCategory.TOP_PAIR] / total) * 100,
    [HandCategory.MIDDLE_PAIR]: (dist[HandCategory.MIDDLE_PAIR] / total) * 100,
    [HandCategory.BOTTOM_PAIR]: (dist[HandCategory.BOTTOM_PAIR] / total) * 100,
    [HandCategory.DRAWS]: (dist[HandCategory.DRAWS] / total) * 100,
    [HandCategory.AIR]: (dist[HandCategory.AIR] / total) * 100,
  }
}

/**
 * Create a unique key for a combo (for use in Maps/Sets)
 */
function comboToKey(combo: Combo): string {
  const [c1, c2] = combo.cards
  // Normalize order by card ID
  const id1 = c1.rank * 10 + ['h', 'd', 'c', 's'].indexOf(c1.suit)
  const id2 = c2.rank * 10 + ['h', 'd', 'c', 's'].indexOf(c2.suit)

  if (id1 > id2) {
    return `${c1.rank}${c1.suit}${c2.rank}${c2.suit}`
  }
  return `${c2.rank}${c2.suit}${c1.rank}${c1.suit}`
}

export { comboToKey }
