// Combo representation for hole cards

import type { Card, Rank, Suit } from './cards'
import { SUITS, cardId, RANK_SYMBOLS } from './cards'

/**
 * A combo is a specific pair of hole cards (e.g., As Kh)
 */
export interface Combo {
  cards: [Card, Card]
}

/**
 * A hand type in the 13x13 matrix (e.g., "AKs", "QQ", "T9o")
 */
export interface HandType {
  rank1: Rank // Higher rank
  rank2: Rank // Lower or equal rank
  suited: boolean // Only relevant when rank1 !== rank2
}

/**
 * Create a combo from two cards
 */
export function combo(card1: Card, card2: Card): Combo {
  // Normalize order: higher rank first, or if equal ranks, hearts > diamonds > clubs > spades
  const id1 = cardId(card1)
  const id2 = cardId(card2)
  if (id1 > id2) {
    return { cards: [card1, card2] }
  }
  return { cards: [card2, card1] }
}

/**
 * Get the hand type for a combo (e.g., AKs, QQ, T9o)
 */
export function getHandType(c: Combo): HandType {
  const [card1, card2] = c.cards
  const highRank = Math.max(card1.rank, card2.rank) as Rank
  const lowRank = Math.min(card1.rank, card2.rank) as Rank
  const suited = card1.suit === card2.suit

  return {
    rank1: highRank,
    rank2: lowRank,
    suited: highRank !== lowRank ? suited : false, // Pairs can't be suited
  }
}

/**
 * Convert a hand type to string (e.g., "AKs", "QQ", "T9o")
 */
export function handTypeToString(ht: HandType): string {
  const r1 = RANK_SYMBOLS[ht.rank1]
  const r2 = RANK_SYMBOLS[ht.rank2]
  if (ht.rank1 === ht.rank2) {
    return `${r1}${r2}` // Pair, no suffix
  }
  return `${r1}${r2}${ht.suited ? 's' : 'o'}`
}

/**
 * Parse a hand type string (e.g., "AKs", "QQ", "T9o")
 */
export function parseHandType(str: string): HandType | null {
  if (str.length < 2 || str.length > 3) return null

  const rankMap: Record<string, Rank> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  }

  const rank1 = rankMap[str[0].toUpperCase()]
  const rank2 = rankMap[str[1].toUpperCase()]
  if (!rank1 || !rank2) return null

  const highRank = Math.max(rank1, rank2) as Rank
  const lowRank = Math.min(rank1, rank2) as Rank

  // Pairs
  if (highRank === lowRank) {
    return { rank1: highRank, rank2: lowRank, suited: false }
  }

  // Non-pairs need suited/offsuit indicator
  if (str.length !== 3) return null
  const suffix = str[2].toLowerCase()
  if (suffix !== 's' && suffix !== 'o') return null

  return {
    rank1: highRank,
    rank2: lowRank,
    suited: suffix === 's',
  }
}

/**
 * Get all possible combos for a hand type
 * - Pairs: 6 combos (choose 2 from 4 suits)
 * - Suited: 4 combos (one per suit)
 * - Offsuit: 12 combos (4 * 3)
 */
export function getCombosForHandType(ht: HandType): Combo[] {
  const combos: Combo[] = []

  if (ht.rank1 === ht.rank2) {
    // Pair: all suit combinations
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        combos.push(combo(
          { rank: ht.rank1, suit: SUITS[i] },
          { rank: ht.rank2, suit: SUITS[j] }
        ))
      }
    }
  } else if (ht.suited) {
    // Suited: one combo per suit
    for (const suit of SUITS) {
      combos.push(combo(
        { rank: ht.rank1, suit },
        { rank: ht.rank2, suit }
      ))
    }
  } else {
    // Offsuit: all different suit combinations
    for (const suit1 of SUITS) {
      for (const suit2 of SUITS) {
        if (suit1 !== suit2) {
          combos.push(combo(
            { rank: ht.rank1, suit: suit1 },
            { rank: ht.rank2, suit: suit2 }
          ))
        }
      }
    }
  }

  return combos
}

/**
 * Check if a combo is blocked by a set of cards (e.g., board cards or hero's hand)
 */
export function isComboBlocked(c: Combo, blockers: Card[]): boolean {
  const blockerIds = new Set(blockers.map(cardId))
  return blockerIds.has(cardId(c.cards[0])) || blockerIds.has(cardId(c.cards[1]))
}

/**
 * Get unblocked combos for a hand type given blocking cards
 */
export function getUnblockedCombos(ht: HandType, blockers: Card[]): Combo[] {
  return getCombosForHandType(ht).filter(c => !isComboBlocked(c, blockers))
}

/**
 * Convert a combo to display string (e.g., "A♠K♠")
 */
export function comboToDisplay(c: Combo): string {
  const [card1, card2] = c.cards
  const SUIT_SYMBOLS: Record<Suit, string> = { h: '♥', d: '♦', c: '♣', s: '♠' }
  return `${RANK_SYMBOLS[card1.rank]}${SUIT_SYMBOLS[card1.suit]}${RANK_SYMBOLS[card2.rank]}${SUIT_SYMBOLS[card2.suit]}`
}

/**
 * Generate all 169 hand types in the standard matrix order
 * Returns them in row-major order: AA, AKs, AQs, ... , 32o, 22
 */
export function getAllHandTypes(): HandType[] {
  const handTypes: HandType[] = []

  // Iterate from A (14) down to 2
  for (let r1 = 14; r1 >= 2; r1--) {
    for (let r2 = 14; r2 >= 2; r2--) {
      const rank1 = r1 as Rank
      const rank2 = r2 as Rank

      if (r1 === r2) {
        // Diagonal: pairs
        handTypes.push({ rank1, rank2, suited: false })
      } else if (r1 > r2) {
        // Above diagonal: suited hands
        handTypes.push({ rank1, rank2, suited: true })
      } else {
        // Below diagonal: offsuit hands
        handTypes.push({ rank1: rank2, rank2: rank1, suited: false })
      }
    }
  }

  return handTypes
}

/**
 * Get matrix position for a hand type (row, col) in 0-12 range
 * Row 0 = Ace row, Col 0 = Ace column
 */
export function getMatrixPosition(ht: HandType): { row: number; col: number } {
  const row = 14 - ht.rank1 // A=0, K=1, ..., 2=12
  const col = 14 - ht.rank2

  if (ht.rank1 === ht.rank2) {
    // Pair: on diagonal
    return { row, col: row }
  } else if (ht.suited) {
    // Suited: above diagonal (row < col in our system)
    return { row, col }
  } else {
    // Offsuit: below diagonal (row > col)
    return { row: col, col: row }
  }
}

/**
 * Get hand type from matrix position
 */
export function getHandTypeFromPosition(row: number, col: number): HandType {
  const rank1 = (14 - row) as Rank
  const rank2 = (14 - col) as Rank

  if (row === col) {
    // Diagonal: pair
    return { rank1, rank2, suited: false }
  } else if (row < col) {
    // Above diagonal: suited
    return { rank1, rank2, suited: true }
  } else {
    // Below diagonal: offsuit
    return { rank1: rank2, rank2: rank1, suited: false }
  }
}
