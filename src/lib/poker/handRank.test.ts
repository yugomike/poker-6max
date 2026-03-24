import { describe, it, expect } from 'vitest'
import {
  evaluateHand,
  compareHandValues,
  findBestHand,
  HandRanking,
} from './handRank'
import type { Card } from './cards'
import { parseCard } from './cards'

function parseCards(str: string): Card[] {
  return str.split(' ').map(s => parseCard(s)!)
}

describe('handRank', () => {
  describe('evaluateHand', () => {
    it('identifies high card', () => {
      const hand = parseCards('As Kd Qh Tc 8s')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.HIGH_CARD)
      expect(value.kickers).toEqual([14, 13, 12, 10, 8])
    })

    it('identifies one pair', () => {
      const hand = parseCards('As Ah Kd Qh Tc')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.ONE_PAIR)
      expect(value.kickers[0]).toBe(14) // Pair of aces
    })

    it('identifies two pair', () => {
      const hand = parseCards('As Ah Kd Kh Tc')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.TWO_PAIR)
      expect(value.kickers[0]).toBe(14) // High pair
      expect(value.kickers[1]).toBe(13) // Low pair
    })

    it('identifies three of a kind', () => {
      const hand = parseCards('As Ah Ad Kh Tc')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.THREE_OF_A_KIND)
      expect(value.kickers[0]).toBe(14) // Trips
    })

    it('identifies a straight', () => {
      const hand = parseCards('As Kd Qh Jc Ts')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.STRAIGHT)
      expect(value.kickers[0]).toBe(14) // Ace-high straight
    })

    it('identifies the wheel (A-2-3-4-5)', () => {
      const hand = parseCards('As 2d 3h 4c 5s')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.STRAIGHT)
      expect(value.kickers[0]).toBe(5) // 5-high straight
    })

    it('identifies a flush', () => {
      const hand = parseCards('As Ks Qs Ts 8s')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.FLUSH)
    })

    it('identifies a full house', () => {
      const hand = parseCards('As Ah Ad Kh Kc')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.FULL_HOUSE)
      expect(value.kickers[0]).toBe(14) // Trips
      expect(value.kickers[1]).toBe(13) // Pair
    })

    it('identifies four of a kind', () => {
      const hand = parseCards('As Ah Ad Ac Kh')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.FOUR_OF_A_KIND)
      expect(value.kickers[0]).toBe(14) // Quads
    })

    it('identifies a straight flush', () => {
      const hand = parseCards('Ts Js Qs Ks As')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.STRAIGHT_FLUSH)
      expect(value.kickers[0]).toBe(14) // Royal flush
    })

    it('identifies a wheel straight flush', () => {
      const hand = parseCards('As 2s 3s 4s 5s')
      const value = evaluateHand(hand)
      expect(value.ranking).toBe(HandRanking.STRAIGHT_FLUSH)
      expect(value.kickers[0]).toBe(5) // 5-high straight flush
    })
  })

  describe('compareHandValues', () => {
    it('higher ranking beats lower', () => {
      const pair = evaluateHand(parseCards('As Ah Kd Qh Tc'))
      const highCard = evaluateHand(parseCards('As Kd Qh Tc 8s'))
      expect(compareHandValues(pair, highCard)).toBeGreaterThan(0)
    })

    it('compares kickers for same ranking', () => {
      const acesPair = evaluateHand(parseCards('As Ah Kd Qh Tc'))
      const kingsPair = evaluateHand(parseCards('Ks Kh Ad Qh Tc'))
      expect(compareHandValues(acesPair, kingsPair)).toBeGreaterThan(0)
    })

    it('returns 0 for identical hands', () => {
      const hand1 = evaluateHand(parseCards('As Kd Qh Jc Ts'))
      const hand2 = evaluateHand(parseCards('Ah Kc Qs Jd Tc'))
      expect(compareHandValues(hand1, hand2)).toBe(0)
    })
  })

  describe('findBestHand', () => {
    it('finds the best 5-card hand from 7 cards', () => {
      // Hero has AK, board is A K Q J T - best hand is the Broadway straight
      const cards = parseCards('As Kh Ah Kd Qc Jd Ts')
      const { value } = findBestHand(cards)
      expect(value.ranking).toBe(HandRanking.STRAIGHT)
      expect(value.kickers[0]).toBe(14) // Ace-high straight
    })

    it('finds full house over flush', () => {
      // Cards that could make both flush and full house
      const cards = parseCards('As Ah Ac Ks Qs Js Kd')
      const { value } = findBestHand(cards)
      expect(value.ranking).toBe(HandRanking.FULL_HOUSE)
    })

    it('handles exactly 5 cards', () => {
      const cards = parseCards('As Kd Qh Jc Ts')
      const { value } = findBestHand(cards)
      expect(value.ranking).toBe(HandRanking.STRAIGHT)
    })
  })
})
