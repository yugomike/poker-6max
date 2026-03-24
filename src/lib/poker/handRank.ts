// Hand evaluation for 5-card poker hands

import type { Card, Rank } from './cards'

export const HandRanking = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
} as const

export type HandRanking = (typeof HandRanking)[keyof typeof HandRanking]

export const HAND_RANKING_NAMES: Record<HandRanking, string> = {
  [HandRanking.HIGH_CARD]: 'High Card',
  [HandRanking.ONE_PAIR]: 'One Pair',
  [HandRanking.TWO_PAIR]: 'Two Pair',
  [HandRanking.THREE_OF_A_KIND]: 'Three of a Kind',
  [HandRanking.STRAIGHT]: 'Straight',
  [HandRanking.FLUSH]: 'Flush',
  [HandRanking.FULL_HOUSE]: 'Full House',
  [HandRanking.FOUR_OF_A_KIND]: 'Four of a Kind',
  [HandRanking.STRAIGHT_FLUSH]: 'Straight Flush',
}

export interface HandValue {
  ranking: HandRanking
  // Kickers for tiebreaking, ordered by importance
  // For pair: [pair rank, kicker1, kicker2, kicker3]
  // For two pair: [high pair, low pair, kicker]
  // etc.
  kickers: Rank[]
}

/**
 * Evaluate a 5-card hand and return its value
 */
export function evaluateHand(cards: Card[]): HandValue {
  if (cards.length !== 5) {
    throw new Error('Hand must have exactly 5 cards')
  }

  const ranks = cards.map(c => c.rank).sort((a, b) => b - a) // Descending
  const suits = cards.map(c => c.suit)

  // Check for flush
  const isFlush = suits.every(s => s === suits[0])

  // Check for straight (including wheel: A-2-3-4-5)
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a)
  let isStraight = false
  let straightHighCard: Rank = ranks[0]

  if (uniqueRanks.length === 5) {
    // Check normal straight
    if (uniqueRanks[0] - uniqueRanks[4] === 4) {
      isStraight = true
      straightHighCard = uniqueRanks[0]
    }
    // Check wheel (A-2-3-4-5)
    else if (
      uniqueRanks[0] === 14 &&
      uniqueRanks[1] === 5 &&
      uniqueRanks[2] === 4 &&
      uniqueRanks[3] === 3 &&
      uniqueRanks[4] === 2
    ) {
      isStraight = true
      straightHighCard = 5 as Rank // 5-high straight
    }
  }

  // Count rank frequencies
  const rankCounts = new Map<Rank, number>()
  for (const rank of ranks) {
    rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1)
  }

  const counts = [...rankCounts.entries()].sort((a, b) => {
    // Sort by count descending, then by rank descending
    if (b[1] !== a[1]) return b[1] - a[1]
    return b[0] - a[0]
  })

  // Straight flush
  if (isFlush && isStraight) {
    return { ranking: HandRanking.STRAIGHT_FLUSH, kickers: [straightHighCard] }
  }

  // Four of a kind
  if (counts[0][1] === 4) {
    return {
      ranking: HandRanking.FOUR_OF_A_KIND,
      kickers: [counts[0][0], counts[1][0]],
    }
  }

  // Full house
  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return {
      ranking: HandRanking.FULL_HOUSE,
      kickers: [counts[0][0], counts[1][0]],
    }
  }

  // Flush
  if (isFlush) {
    return { ranking: HandRanking.FLUSH, kickers: ranks as Rank[] }
  }

  // Straight
  if (isStraight) {
    return { ranking: HandRanking.STRAIGHT, kickers: [straightHighCard] }
  }

  // Three of a kind
  if (counts[0][1] === 3) {
    return {
      ranking: HandRanking.THREE_OF_A_KIND,
      kickers: [counts[0][0], counts[1][0], counts[2][0]],
    }
  }

  // Two pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    return {
      ranking: HandRanking.TWO_PAIR,
      kickers: [counts[0][0], counts[1][0], counts[2][0]],
    }
  }

  // One pair
  if (counts[0][1] === 2) {
    return {
      ranking: HandRanking.ONE_PAIR,
      kickers: [counts[0][0], counts[1][0], counts[2][0], counts[3][0]],
    }
  }

  // High card
  return { ranking: HandRanking.HIGH_CARD, kickers: ranks as Rank[] }
}

/**
 * Compare two hand values. Returns:
 * - Positive if hand1 wins
 * - Negative if hand2 wins
 * - Zero if tie
 */
export function compareHandValues(hand1: HandValue, hand2: HandValue): number {
  // Compare rankings first
  if (hand1.ranking !== hand2.ranking) {
    return hand1.ranking - hand2.ranking
  }

  // Compare kickers
  for (let i = 0; i < Math.min(hand1.kickers.length, hand2.kickers.length); i++) {
    if (hand1.kickers[i] !== hand2.kickers[i]) {
      return hand1.kickers[i] - hand2.kickers[i]
    }
  }

  return 0 // Tie
}

/**
 * Find the best 5-card hand from 7 cards (hole cards + board)
 * Uses brute force combination generation (C(7,5) = 21 combinations)
 */
export function findBestHand(cards: Card[]): { hand: Card[]; value: HandValue } {
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards')
  }

  if (cards.length === 5) {
    return { hand: cards, value: evaluateHand(cards) }
  }

  let bestHand: Card[] = []
  let bestValue: HandValue | null = null

  // Generate all 5-card combinations
  const n = cards.length
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            const hand = [cards[i], cards[j], cards[k], cards[l], cards[m]]
            const value = evaluateHand(hand)

            if (!bestValue || compareHandValues(value, bestValue) > 0) {
              bestHand = hand
              bestValue = value
            }
          }
        }
      }
    }
  }

  return { hand: bestHand, value: bestValue! }
}
