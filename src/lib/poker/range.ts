// Range representation - a set of hand types with weights

import type { Card } from './cards'
import type { Combo } from './combos'
import {
  getAllHandTypes,
  getCombosForHandType,
  getUnblockedCombos,
  handTypeToString,
  parseHandType,
} from './combos'
import { comboToKey } from './rangeAnalysis'

/**
 * A range is a 13x13 matrix of hand types with weights (0-1)
 * Weight represents the frequency this hand is played
 */
export interface Range {
  // Map from hand type string (e.g., "AKs") to weight (0-1)
  weights: Map<string, number>
}

/**
 * Create an empty range
 */
export function createEmptyRange(): Range {
  return { weights: new Map() }
}

/**
 * Create a range with all hands at a given weight
 */
export function createFullRange(weight: number = 1): Range {
  const range: Range = { weights: new Map() }
  for (const ht of getAllHandTypes()) {
    range.weights.set(handTypeToString(ht), weight)
  }
  return range
}

/**
 * Set the weight for a hand type in the range
 */
export function setWeight(range: Range, handType: string, weight: number): Range {
  const newWeights = new Map(range.weights)
  if (weight === 0) {
    newWeights.delete(handType)
  } else {
    newWeights.set(handType, Math.max(0, Math.min(1, weight)))
  }
  return { weights: newWeights }
}

/**
 * Get the weight for a hand type (0 if not in range)
 */
export function getWeight(range: Range, handType: string): number {
  return range.weights.get(handType) ?? 0
}

/**
 * Toggle a hand type in/out of the range
 */
export function toggleHandType(range: Range, handType: string): Range {
  const currentWeight = getWeight(range, handType)
  return setWeight(range, handType, currentWeight > 0 ? 0 : 1)
}

/**
 * Get all combos in the range with their weights, accounting for blockers
 */
export function getRangeCombos(
  range: Range,
  blockers: Card[] = []
): { combo: Combo; weight: number }[] {
  const result: { combo: Combo; weight: number }[] = []

  for (const [handTypeStr, weight] of range.weights) {
    if (weight === 0) continue

    const ht = parseHandType(handTypeStr)
    if (!ht) continue

    const combos = getUnblockedCombos(ht, blockers)
    for (const combo of combos) {
      result.push({ combo, weight })
    }
  }

  return result
}

/**
 * Get the total number of combos in the range (weighted)
 */
export function getRangeComboCount(range: Range, blockers: Card[] = []): number {
  let total = 0

  for (const [handTypeStr, weight] of range.weights) {
    if (weight === 0) continue

    const ht = parseHandType(handTypeStr)
    if (!ht) continue

    const combos = getUnblockedCombos(ht, blockers)
    total += combos.length * weight
  }

  return total
}

/**
 * Calculate the percentage of hands in the range (out of 1326 possible combos)
 */
export function getRangePercentage(range: Range): number {
  let totalWeight = 0

  for (const [handTypeStr, weight] of range.weights) {
    if (weight === 0) continue

    const ht = parseHandType(handTypeStr)
    if (!ht) continue

    const combos = getCombosForHandType(ht)
    totalWeight += combos.length * weight
  }

  return (totalWeight / 1326) * 100
}

/**
 * Parse a range string (comma-separated hand types)
 * e.g., "AA,KK,QQ,AKs,AKo" or "AA-TT,AKs-ATs,AKo"
 */
export function parseRangeString(str: string): Range {
  const range = createEmptyRange()
  const parts = str.split(',').map(s => s.trim()).filter(Boolean)

  for (const part of parts) {
    // Check for range notation (e.g., "AA-TT" or "AKs-ATs")
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => s.trim())
      const startHt = parseHandType(start)
      const endHt = parseHandType(end)

      if (startHt && endHt) {
        // Handle pair range (AA-TT)
        if (startHt.rank1 === startHt.rank2 && endHt.rank1 === endHt.rank2) {
          const highRank = Math.max(startHt.rank1, endHt.rank1)
          const lowRank = Math.min(startHt.rank1, endHt.rank1)

          for (let r = lowRank; r <= highRank; r++) {
            const htStr = handTypeToString({ rank1: r as any, rank2: r as any, suited: false })
            range.weights.set(htStr, 1)
          }
        }
        // Handle suited/offsuit range (AKs-ATs)
        else if (startHt.rank1 === endHt.rank1 && startHt.suited === endHt.suited) {
          const highRank2 = Math.max(startHt.rank2, endHt.rank2)
          const lowRank2 = Math.min(startHt.rank2, endHt.rank2)

          for (let r = lowRank2; r <= highRank2; r++) {
            const htStr = handTypeToString({
              rank1: startHt.rank1,
              rank2: r as any,
              suited: startHt.suited,
            })
            range.weights.set(htStr, 1)
          }
        }
      }
    } else {
      // Single hand type
      const ht = parseHandType(part)
      if (ht) {
        range.weights.set(handTypeToString(ht), 1)
      }
    }
  }

  return range
}

/**
 * Convert a range to a readable string
 */
export function rangeToString(range: Range): string {
  const handTypes: string[] = []

  for (const [handTypeStr, weight] of range.weights) {
    if (weight > 0) {
      if (weight === 1) {
        handTypes.push(handTypeStr)
      } else {
        handTypes.push(`${handTypeStr}:${Math.round(weight * 100)}%`)
      }
    }
  }

  return handTypes.join(', ')
}

/**
 * Create a weight map from range for use with calculateRangeDistribution
 */
export function rangeToComboWeights(range: Range, blockers: Card[] = []): Map<string, number> {
  const weights = new Map<string, number>()

  for (const [handTypeStr, weight] of range.weights) {
    if (weight === 0) continue

    const ht = parseHandType(handTypeStr)
    if (!ht) continue

    const combos = getUnblockedCombos(ht, blockers)
    for (const combo of combos) {
      weights.set(comboToKey(combo), weight)
    }
  }

  return weights
}
