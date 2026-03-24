import { describe, it, expect } from 'vitest'
import {
  card,
  parseCard,
  cardToString,
  cardToDisplay,
  cardsEqual,
  cardId,
  cardFromId,
  createDeck,
} from './cards'

describe('cards', () => {
  describe('card creation', () => {
    it('creates a card with rank and suit', () => {
      const c = card(14, 's')
      expect(c.rank).toBe(14)
      expect(c.suit).toBe('s')
    })
  })

  describe('parseCard', () => {
    it('parses valid card strings', () => {
      expect(parseCard('As')).toEqual({ rank: 14, suit: 's' })
      expect(parseCard('Kh')).toEqual({ rank: 13, suit: 'h' })
      expect(parseCard('Td')).toEqual({ rank: 10, suit: 'd' })
      expect(parseCard('2c')).toEqual({ rank: 2, suit: 'c' })
    })

    it('handles case insensitivity', () => {
      expect(parseCard('aS')).toEqual({ rank: 14, suit: 's' })
      expect(parseCard('kH')).toEqual({ rank: 13, suit: 'h' })
    })

    it('returns null for invalid strings', () => {
      expect(parseCard('')).toBeNull()
      expect(parseCard('A')).toBeNull()
      expect(parseCard('Xx')).toBeNull()
      expect(parseCard('Az')).toBeNull()
    })
  })

  describe('cardToString', () => {
    it('converts cards to standard notation', () => {
      expect(cardToString({ rank: 14, suit: 's' })).toBe('As')
      expect(cardToString({ rank: 13, suit: 'h' })).toBe('Kh')
      expect(cardToString({ rank: 10, suit: 'd' })).toBe('Td')
    })
  })

  describe('cardToDisplay', () => {
    it('converts cards to display format with symbols', () => {
      expect(cardToDisplay({ rank: 14, suit: 's' })).toBe('A♠')
      expect(cardToDisplay({ rank: 13, suit: 'h' })).toBe('K♥')
      expect(cardToDisplay({ rank: 10, suit: 'd' })).toBe('T♦')
    })
  })

  describe('cardsEqual', () => {
    it('correctly compares cards', () => {
      expect(cardsEqual({ rank: 14, suit: 's' }, { rank: 14, suit: 's' })).toBe(true)
      expect(cardsEqual({ rank: 14, suit: 's' }, { rank: 14, suit: 'h' })).toBe(false)
      expect(cardsEqual({ rank: 14, suit: 's' }, { rank: 13, suit: 's' })).toBe(false)
    })
  })

  describe('cardId', () => {
    it('generates unique IDs for all cards', () => {
      const ids = new Set<number>()
      const deck = createDeck()

      for (const c of deck) {
        const id = cardId(c)
        expect(id).toBeGreaterThanOrEqual(0)
        expect(id).toBeLessThan(52)
        expect(ids.has(id)).toBe(false)
        ids.add(id)
      }

      expect(ids.size).toBe(52)
    })
  })

  describe('cardFromId', () => {
    it('round-trips with cardId', () => {
      const deck = createDeck()

      for (const c of deck) {
        const id = cardId(c)
        const recovered = cardFromId(id)
        expect(cardsEqual(c, recovered)).toBe(true)
      }
    })
  })

  describe('createDeck', () => {
    it('creates a 52-card deck', () => {
      const deck = createDeck()
      expect(deck.length).toBe(52)
    })

    it('contains all combinations of ranks and suits', () => {
      const deck = createDeck()
      const cards = new Set(deck.map(c => cardToString(c)))
      expect(cards.size).toBe(52)
    })
  })
})
