import { describe, it, expect } from 'vitest'
import {
  categorizeHand,
  calculateRangeDistribution,
  distributionToPercentages,
  HandCategory,
} from './rangeAnalysis'
import { combo, getCombosForHandType, parseHandType } from './combos'
import type { Card } from './cards'
import { parseCard } from './cards'

function parseCards(str: string): Card[] {
  return str.split(' ').map(s => parseCard(s)!)
}

describe('rangeAnalysis', () => {
  describe('categorizeHand', () => {
    it('identifies monsters (sets)', () => {
      // Pocket aces on A-K-Q board = set
      const c = combo(parseCard('As')!, parseCard('Ah')!)
      const board = parseCards('Ad Kh Qc')
      expect(categorizeHand(c, board)).toBe(HandCategory.MONSTERS)
    })

    it('identifies monsters (straights)', () => {
      // JT on A-K-Q board = broadway straight
      const c = combo(parseCard('Js')!, parseCard('Th')!)
      const board = parseCards('Ad Kh Qc')
      expect(categorizeHand(c, board)).toBe(HandCategory.MONSTERS)
    })

    it('identifies monsters (flushes)', () => {
      // Two spades on three-spade board
      const c = combo(parseCard('7s')!, parseCard('2s')!)
      const board = parseCards('As Ks Qs')
      expect(categorizeHand(c, board)).toBe(HandCategory.MONSTERS)
    })

    it('identifies two pair', () => {
      // AK on A-K-2 board
      const c = combo(parseCard('As')!, parseCard('Kh')!)
      const board = parseCards('Ad Kd 2c')
      expect(categorizeHand(c, board)).toBe(HandCategory.TWO_PAIR)
    })

    it('identifies top pair', () => {
      // AQ on A-K-2 board = top pair
      const c = combo(parseCard('As')!, parseCard('Qh')!)
      const board = parseCards('Ad Kd 2c')
      expect(categorizeHand(c, board)).toBe(HandCategory.TOP_PAIR)
    })

    it('identifies overpair as top pair', () => {
      // AA on K-Q-2 board = overpair (treated as top pair equivalent)
      const c = combo(parseCard('As')!, parseCard('Ah')!)
      const board = parseCards('Kd Qd 2c')
      expect(categorizeHand(c, board)).toBe(HandCategory.TOP_PAIR)
    })

    it('identifies middle pair', () => {
      // KQ on A-K-2 board = middle pair (K)
      const c = combo(parseCard('Ks')!, parseCard('Qh')!)
      const board = parseCards('Ad Kd 2c')
      expect(categorizeHand(c, board)).toBe(HandCategory.MIDDLE_PAIR)
    })

    it('identifies bottom pair', () => {
      // 32 on A-K-2 board = bottom pair
      const c = combo(parseCard('3s')!, parseCard('2h')!)
      const board = parseCards('Ad Kd 2c')
      expect(categorizeHand(c, board)).toBe(HandCategory.BOTTOM_PAIR)
    })

    it('identifies underpair as bottom pair', () => {
      // 22 on A-K-3 board = underpair
      const c = combo(parseCard('2s')!, parseCard('2h')!)
      const board = parseCards('Ad Kd 3c')
      expect(categorizeHand(c, board)).toBe(HandCategory.BOTTOM_PAIR)
    })

    it('identifies flush draws', () => {
      // Two hearts on two-heart board
      const c = combo(parseCard('7h')!, parseCard('2h')!)
      const board = parseCards('Ah Kh Qc')
      expect(categorizeHand(c, board)).toBe(HandCategory.DRAWS)
    })

    it('identifies OESD', () => {
      // JT on 9-8-2 board = open-ended straight draw
      const c = combo(parseCard('Js')!, parseCard('Th')!)
      const board = parseCards('9d 8d 2c')
      expect(categorizeHand(c, board)).toBe(HandCategory.DRAWS)
    })

    it('identifies air', () => {
      // 72 on A-K-Q board = air
      const c = combo(parseCard('7s')!, parseCard('2h')!)
      const board = parseCards('Ad Kh Qc')
      expect(categorizeHand(c, board)).toBe(HandCategory.AIR)
    })
  })

  describe('calculateRangeDistribution', () => {
    it('calculates distribution for a simple range', () => {
      // Just pocket aces on A-K-Q board
      const aaCombos = getCombosForHandType(parseHandType('AA')!)
      const board = parseCards('Ad Kh Qc')

      // Remove combos that are blocked by the board
      const unblockedCombos = aaCombos.filter(c => {
        const cards = c.cards
        return !cards.some(card =>
          card.rank === 14 && card.suit === 'd' // Ad is on board
        )
      })

      const weights = new Map<string, number>()
      for (const c of unblockedCombos) {
        const key = `${c.cards[0].rank}${c.cards[0].suit}${c.cards[1].rank}${c.cards[1].suit}`
        weights.set(key, 1)
      }

      const dist = calculateRangeDistribution(unblockedCombos, weights, board)

      // All unblocked AA combos should be monsters (sets)
      expect(dist[HandCategory.MONSTERS]).toBe(unblockedCombos.length)
      expect(dist[HandCategory.AIR]).toBe(0)
    })
  })

  describe('distributionToPercentages', () => {
    it('converts to percentages correctly', () => {
      const dist = {
        [HandCategory.MONSTERS]: 10,
        [HandCategory.TWO_PAIR]: 5,
        [HandCategory.TOP_PAIR]: 20,
        [HandCategory.MIDDLE_PAIR]: 15,
        [HandCategory.BOTTOM_PAIR]: 10,
        [HandCategory.DRAWS]: 15,
        [HandCategory.AIR]: 25,
        totalCombos: 100,
      }

      const pct = distributionToPercentages(dist)

      expect(pct[HandCategory.MONSTERS]).toBe(10)
      expect(pct[HandCategory.TWO_PAIR]).toBe(5)
      expect(pct[HandCategory.TOP_PAIR]).toBe(20)
      expect(pct[HandCategory.AIR]).toBe(25)
    })

    it('handles empty distribution', () => {
      const dist = {
        [HandCategory.MONSTERS]: 0,
        [HandCategory.TWO_PAIR]: 0,
        [HandCategory.TOP_PAIR]: 0,
        [HandCategory.MIDDLE_PAIR]: 0,
        [HandCategory.BOTTOM_PAIR]: 0,
        [HandCategory.DRAWS]: 0,
        [HandCategory.AIR]: 0,
        totalCombos: 0,
      }

      const pct = distributionToPercentages(dist)

      expect(pct[HandCategory.MONSTERS]).toBe(0)
      expect(pct[HandCategory.AIR]).toBe(0)
    })
  })
})
