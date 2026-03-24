import { describe, it, expect } from 'vitest'
import {
  combo,
  getHandType,
  handTypeToString,
  parseHandType,
  getCombosForHandType,
  getUnblockedCombos,
  getAllHandTypes,
  getMatrixPosition,
  getHandTypeFromPosition,
} from './combos'
import { parseCard } from './cards'

describe('combos', () => {
  describe('getHandType', () => {
    it('identifies pairs', () => {
      const c = combo(parseCard('As')!, parseCard('Ah')!)
      const ht = getHandType(c)
      expect(ht.rank1).toBe(14)
      expect(ht.rank2).toBe(14)
      expect(ht.suited).toBe(false)
    })

    it('identifies suited hands', () => {
      const c = combo(parseCard('As')!, parseCard('Ks')!)
      const ht = getHandType(c)
      expect(ht.rank1).toBe(14)
      expect(ht.rank2).toBe(13)
      expect(ht.suited).toBe(true)
    })

    it('identifies offsuit hands', () => {
      const c = combo(parseCard('As')!, parseCard('Kh')!)
      const ht = getHandType(c)
      expect(ht.rank1).toBe(14)
      expect(ht.rank2).toBe(13)
      expect(ht.suited).toBe(false)
    })

    it('normalizes rank order', () => {
      const c = combo(parseCard('Kh')!, parseCard('As')!)
      const ht = getHandType(c)
      expect(ht.rank1).toBe(14) // Ace is higher
      expect(ht.rank2).toBe(13)
    })
  })

  describe('handTypeToString', () => {
    it('formats pairs correctly', () => {
      expect(handTypeToString({ rank1: 14, rank2: 14, suited: false })).toBe('AA')
      expect(handTypeToString({ rank1: 2, rank2: 2, suited: false })).toBe('22')
    })

    it('formats suited hands correctly', () => {
      expect(handTypeToString({ rank1: 14, rank2: 13, suited: true })).toBe('AKs')
      expect(handTypeToString({ rank1: 10, rank2: 9, suited: true })).toBe('T9s')
    })

    it('formats offsuit hands correctly', () => {
      expect(handTypeToString({ rank1: 14, rank2: 13, suited: false })).toBe('AKo')
      expect(handTypeToString({ rank1: 7, rank2: 6, suited: false })).toBe('76o')
    })
  })

  describe('parseHandType', () => {
    it('parses pairs', () => {
      const ht = parseHandType('AA')
      expect(ht).toEqual({ rank1: 14, rank2: 14, suited: false })
    })

    it('parses suited hands', () => {
      const ht = parseHandType('AKs')
      expect(ht).toEqual({ rank1: 14, rank2: 13, suited: true })
    })

    it('parses offsuit hands', () => {
      const ht = parseHandType('AKo')
      expect(ht).toEqual({ rank1: 14, rank2: 13, suited: false })
    })

    it('normalizes rank order', () => {
      const ht = parseHandType('KAs')
      expect(ht).toEqual({ rank1: 14, rank2: 13, suited: true })
    })

    it('returns null for invalid strings', () => {
      expect(parseHandType('')).toBeNull()
      expect(parseHandType('A')).toBeNull()
      expect(parseHandType('AK')).toBeNull() // Missing s/o for non-pair
      expect(parseHandType('AXs')).toBeNull()
    })
  })

  describe('getCombosForHandType', () => {
    it('returns 6 combos for pairs', () => {
      const ht = parseHandType('AA')!
      const combos = getCombosForHandType(ht)
      expect(combos.length).toBe(6)
    })

    it('returns 4 combos for suited hands', () => {
      const ht = parseHandType('AKs')!
      const combos = getCombosForHandType(ht)
      expect(combos.length).toBe(4)

      // All should be same suit
      for (const c of combos) {
        expect(c.cards[0].suit).toBe(c.cards[1].suit)
      }
    })

    it('returns 12 combos for offsuit hands', () => {
      const ht = parseHandType('AKo')!
      const combos = getCombosForHandType(ht)
      expect(combos.length).toBe(12)

      // All should be different suits
      for (const c of combos) {
        expect(c.cards[0].suit).not.toBe(c.cards[1].suit)
      }
    })
  })

  describe('getUnblockedCombos', () => {
    it('removes blocked combos', () => {
      const ht = parseHandType('AA')!
      const blockers = [parseCard('As')!]
      const combos = getUnblockedCombos(ht, blockers)

      // AA has 6 combos, blocking As removes 3 (AsAh, AsAd, AsAc)
      expect(combos.length).toBe(3)

      // None should contain As
      for (const c of combos) {
        expect(c.cards[0].suit).not.toBe('s')
        expect(c.cards[1].suit).not.toBe('s')
      }
    })

    it('handles multiple blockers', () => {
      const ht = parseHandType('AKs')!
      const blockers = [parseCard('As')!, parseCard('Ks')!]
      const combos = getUnblockedCombos(ht, blockers)

      // AKs has 4 combos, blocking As and Ks removes 1 (AsKs)
      expect(combos.length).toBe(3)
    })
  })

  describe('getAllHandTypes', () => {
    it('returns 169 hand types', () => {
      const handTypes = getAllHandTypes()
      expect(handTypes.length).toBe(169)
    })

    it('contains correct distribution', () => {
      const handTypes = getAllHandTypes()

      const pairs = handTypes.filter(ht => ht.rank1 === ht.rank2)
      const suited = handTypes.filter(ht => ht.rank1 !== ht.rank2 && ht.suited)
      const offsuit = handTypes.filter(ht => ht.rank1 !== ht.rank2 && !ht.suited)

      expect(pairs.length).toBe(13) // AA, KK, ..., 22
      expect(suited.length).toBe(78) // C(13,2) = 78 suited combos
      expect(offsuit.length).toBe(78) // C(13,2) = 78 offsuit combos
    })
  })

  describe('matrix position', () => {
    it('maps hand types to correct positions', () => {
      // AA should be at (0, 0)
      expect(getMatrixPosition({ rank1: 14, rank2: 14, suited: false }))
        .toEqual({ row: 0, col: 0 })

      // AKs should be at (0, 1) - above diagonal
      expect(getMatrixPosition({ rank1: 14, rank2: 13, suited: true }))
        .toEqual({ row: 0, col: 1 })

      // AKo should be at (1, 0) - below diagonal
      expect(getMatrixPosition({ rank1: 14, rank2: 13, suited: false }))
        .toEqual({ row: 1, col: 0 })

      // 22 should be at (12, 12)
      expect(getMatrixPosition({ rank1: 2, rank2: 2, suited: false }))
        .toEqual({ row: 12, col: 12 })
    })

    it('round-trips correctly', () => {
      for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
          const ht = getHandTypeFromPosition(row, col)
          const pos = getMatrixPosition(ht)
          expect(pos).toEqual({ row, col })
        }
      }
    })
  })
})
