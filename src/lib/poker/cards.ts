// Card representation for poker

export type Suit = 'h' | 'd' | 'c' | 's'
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export const SUITS: readonly Suit[] = ['h', 'd', 'c', 's'] as const
export const RANKS: readonly Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const

export const SUIT_SYMBOLS: Record<Suit, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
}

export const RANK_SYMBOLS: Record<Rank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: 'T',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
}

export interface Card {
  rank: Rank
  suit: Suit
}

/**
 * Create a card from rank and suit
 */
export function card(rank: Rank, suit: Suit): Card {
  return { rank, suit }
}

/**
 * Parse a card string like "As", "Kh", "Td" into a Card object
 */
export function parseCard(str: string): Card | null {
  if (str.length < 2) return null

  const rankChar = str[0].toUpperCase()
  const suitChar = str[1].toLowerCase()

  const rankMap: Record<string, Rank> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  }

  const rank = rankMap[rankChar]
  if (!rank) return null

  if (!['h', 'd', 'c', 's'].includes(suitChar)) return null

  return { rank, suit: suitChar as Suit }
}

/**
 * Convert a card to its string representation (e.g., "As", "Kh")
 */
export function cardToString(c: Card): string {
  return `${RANK_SYMBOLS[c.rank]}${c.suit}`
}

/**
 * Convert a card to display format with suit symbol (e.g., "A♠", "K♥")
 */
export function cardToDisplay(c: Card): string {
  return `${RANK_SYMBOLS[c.rank]}${SUIT_SYMBOLS[c.suit]}`
}

/**
 * Check if two cards are equal
 */
export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit
}

/**
 * Create a unique numeric ID for a card (0-51)
 * Used for efficient set operations and hashing
 */
export function cardId(c: Card): number {
  const suitIndex = SUITS.indexOf(c.suit)
  const rankIndex = c.rank - 2 // 0-12
  return rankIndex * 4 + suitIndex
}

/**
 * Create a card from its numeric ID (0-51)
 */
export function cardFromId(id: number): Card {
  const rankIndex = Math.floor(id / 4)
  const suitIndex = id % 4
  return {
    rank: (rankIndex + 2) as Rank,
    suit: SUITS[suitIndex],
  }
}

/**
 * Generate a full deck of 52 cards
 */
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit })
    }
  }
  return deck
}
