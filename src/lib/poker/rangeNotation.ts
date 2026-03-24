// Convert ranges to poker shorthand notation (e.g., "88+, A2s+, ATo+")

import type { Range } from './range'
import { getWeight } from './range'
import { RANK_SYMBOLS, type Rank } from './cards'

const RANKS_DESC: Rank[] = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]

function rankToSymbol(rank: Rank): string {
  return RANK_SYMBOLS[rank]
}

/**
 * Convert a range to poker shorthand notation
 * Examples: "88+", "A2s+", "ATo+", "KJs-KTs", "77-55"
 */
export function rangeToShorthand(range: Range): string {
  const parts: string[] = []

  // 1. Process pairs
  const pairRanks: Rank[] = []
  for (const rank of RANKS_DESC) {
    const ht = `${rankToSymbol(rank)}${rankToSymbol(rank)}`
    if (getWeight(range, ht) > 0) {
      pairRanks.push(rank)
    }
  }
  parts.push(...formatPairRanges(pairRanks))

  // 2. Process suited hands (grouped by high card)
  for (const highRank of RANKS_DESC) {
    const suitedRanks: Rank[] = []
    for (const lowRank of RANKS_DESC) {
      if (lowRank >= highRank) continue
      const ht = `${rankToSymbol(highRank)}${rankToSymbol(lowRank)}s`
      if (getWeight(range, ht) > 0) {
        suitedRanks.push(lowRank)
      }
    }
    if (suitedRanks.length > 0) {
      parts.push(...formatConnectedRanges(highRank, suitedRanks, 's'))
    }
  }

  // 3. Process offsuit hands (grouped by high card)
  for (const highRank of RANKS_DESC) {
    const offsuitRanks: Rank[] = []
    for (const lowRank of RANKS_DESC) {
      if (lowRank >= highRank) continue
      const ht = `${rankToSymbol(highRank)}${rankToSymbol(lowRank)}o`
      if (getWeight(range, ht) > 0) {
        offsuitRanks.push(lowRank)
      }
    }
    if (offsuitRanks.length > 0) {
      parts.push(...formatConnectedRanges(highRank, offsuitRanks, 'o'))
    }
  }

  return parts.join(', ')
}

/**
 * Format pair ranges into shorthand
 * e.g., [14,13,12,11,10,9,8] -> ["88+"]
 * e.g., [14,13,12,8,7,6] -> ["QQ+", "66-88"]
 */
function formatPairRanges(ranks: Rank[]): string[] {
  if (ranks.length === 0) return []

  const results: string[] = []
  const sortedRanks = [...ranks].sort((a, b) => b - a) // Descending

  let i = 0
  while (i < sortedRanks.length) {
    const startRank = sortedRanks[i]
    let endRank = startRank

    // Find consecutive run
    while (i + 1 < sortedRanks.length && sortedRanks[i] - sortedRanks[i + 1] === 1) {
      i++
      endRank = sortedRanks[i]
    }

    // Format the range
    if (startRank === 14) {
      // Starts from AA
      if (startRank === endRank) {
        results.push('AA')
      } else {
        results.push(`${rankToSymbol(endRank)}${rankToSymbol(endRank)}+`)
      }
    } else if (startRank === endRank) {
      // Single pair
      results.push(`${rankToSymbol(startRank)}${rankToSymbol(startRank)}`)
    } else {
      // Range of pairs not starting from AA
      results.push(`${rankToSymbol(endRank)}${rankToSymbol(endRank)}-${rankToSymbol(startRank)}${rankToSymbol(startRank)}`)
    }

    i++
  }

  return results
}

/**
 * Format suited/offsuit ranges for a given high card
 * e.g., highRank=14, ranks=[13,12,11,10,9], suffix='s' -> ["A9s+"]
 * e.g., highRank=14, ranks=[13,12,5,4], suffix='s' -> ["AQs+", "A4s-A5s"]
 */
function formatConnectedRanges(highRank: Rank, ranks: Rank[], suffix: 's' | 'o'): string[] {
  if (ranks.length === 0) return []

  const results: string[] = []
  const sortedRanks = [...ranks].sort((a, b) => b - a) // Descending
  const highSymbol = rankToSymbol(highRank)
  const maxLowRank = highRank - 1 // e.g., for A, max is K (13)

  let i = 0
  while (i < sortedRanks.length) {
    const startRank = sortedRanks[i]
    let endRank = startRank

    // Find consecutive run
    while (i + 1 < sortedRanks.length && sortedRanks[i] - sortedRanks[i + 1] === 1) {
      i++
      endRank = sortedRanks[i]
    }

    // Format the range
    if (startRank === maxLowRank) {
      // Starts from the highest possible (e.g., AKs)
      if (startRank === endRank) {
        results.push(`${highSymbol}${rankToSymbol(startRank)}${suffix}`)
      } else {
        results.push(`${highSymbol}${rankToSymbol(endRank)}${suffix}+`)
      }
    } else if (startRank === endRank) {
      // Single hand
      results.push(`${highSymbol}${rankToSymbol(startRank)}${suffix}`)
    } else {
      // Range not starting from highest
      results.push(`${highSymbol}${rankToSymbol(endRank)}${suffix}-${highSymbol}${rankToSymbol(startRank)}${suffix}`)
    }

    i++
  }

  return results
}

/**
 * Get a compact summary of the range
 * Returns just the key hands if range is large
 */
export function rangeToCompactSummary(range: Range, maxLength: number = 60): string {
  const full = rangeToShorthand(range)
  if (full.length <= maxLength) {
    return full
  }

  // Truncate and add ellipsis
  const parts = full.split(', ')
  let result = ''
  for (const part of parts) {
    if (result.length + part.length + 2 > maxLength - 3) {
      return result + '...'
    }
    result = result ? `${result}, ${part}` : part
  }
  return result
}
