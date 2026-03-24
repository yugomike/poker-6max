// IndexedDB setup using Dexie

import Dexie, { type EntityTable } from 'dexie'
import type { Card } from '../poker'
import type { Position } from '../ranges/preflop'
import type { ActionType } from '../../store/gameStore'

// Stored action (serializable version)
export interface StoredAction {
  position: Position
  action: ActionType
}

// Stored range (serializable version - just the weights object)
export interface StoredPlayerRange {
  position: Position
  weights: Record<string, number> // handType -> weight
}

// Saved hand record
export interface SavedHand {
  id?: number // Auto-incremented by Dexie
  timestamp: Date
  heroPosition: Position
  actions: StoredAction[]
  board: Card[]
  playerRanges: StoredPlayerRange[]
  tags: string[]
  notes: string
}

// Database definition
const db = new Dexie('PokerRangeAnalyzer') as Dexie & {
  hands: EntityTable<SavedHand, 'id'>
}

// Schema
db.version(1).stores({
  hands: '++id, timestamp, heroPosition, *tags'
})

export { db }

// Helper functions

export async function saveHand(hand: Omit<SavedHand, 'id'>): Promise<number> {
  const id = await db.hands.add(hand as SavedHand)
  return id as number
}

export async function getAllHands(): Promise<SavedHand[]> {
  return await db.hands.orderBy('timestamp').reverse().toArray()
}

export async function getHand(id: number): Promise<SavedHand | undefined> {
  return await db.hands.get(id)
}

export async function deleteHand(id: number): Promise<void> {
  await db.hands.delete(id)
}

export async function updateHandNotes(id: number, notes: string): Promise<void> {
  await db.hands.update(id, { notes })
}

export async function updateHandTags(id: number, tags: string[]): Promise<void> {
  await db.hands.update(id, { tags })
}

export async function getHandCount(): Promise<number> {
  return await db.hands.count()
}
