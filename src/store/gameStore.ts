// Game state store using Zustand

import { create } from 'zustand'
import type { Card, Range } from '../lib/poker'
import type { Position } from '../lib/ranges/preflop'
import {
  POSITIONS,
  getRFIRange,
  getCallRange,
  getThreeBetRange,
} from '../lib/ranges/preflop'

export type ActionType = 'fold' | 'call' | 'raise' | '3bet' | '4bet' | 'allin'

export interface PlayerAction {
  position: Position
  action: ActionType
  amount?: number // For raises, in big blinds
}

export interface PlayerState {
  position: Position
  isActive: boolean // Still in the hand
  range: Range | null // Current estimated range
  isHero: boolean
  hasActed: boolean // Has acted since last raise
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river'

interface GameState {
  // Hand setup
  heroPosition: Position | null
  players: Map<Position, PlayerState>

  // Action tracking
  actions: PlayerAction[]
  currentStreet: Street
  actingPosition: Position | null
  lastAggressor: Position | null // Who made the last raise

  // Board
  board: Card[]

  // Actions
  setHeroPosition: (position: Position) => void
  resetHand: () => void
  addAction: (action: PlayerAction) => void
  undoLastAction: () => void
  setBoard: (cards: Card[]) => void
  updatePlayerRange: (position: Position, range: Range) => void
}

function getNextPosition(current: Position, activePlayers: Position[]): Position | null {
  const currentIndex = POSITIONS.indexOf(current)
  for (let i = 1; i <= POSITIONS.length; i++) {
    const nextIndex = (currentIndex + i) % POSITIONS.length
    const nextPos = POSITIONS[nextIndex]
    if (activePlayers.includes(nextPos)) {
      return nextPos
    }
  }
  return null
}

function initializePlayers(heroPosition: Position | null): Map<Position, PlayerState> {
  const players = new Map<Position, PlayerState>()
  for (const pos of POSITIONS) {
    players.set(pos, {
      position: pos,
      isActive: true,
      range: null,
      isHero: pos === heroPosition,
      hasActed: false,
    })
  }
  return players
}

export const useGameStore = create<GameState>((set, get) => ({
  heroPosition: null,
  players: initializePlayers(null),
  actions: [],
  currentStreet: 'preflop',
  actingPosition: 'UTG', // Preflop starts with UTG
  lastAggressor: null,
  board: [],

  setHeroPosition: (position) => {
    set({
      heroPosition: position,
      players: initializePlayers(position),
      actions: [],
      currentStreet: 'preflop',
      actingPosition: 'UTG',
      lastAggressor: null,
      board: [],
    })
  },

  resetHand: () => {
    const heroPosition = get().heroPosition
    set({
      players: initializePlayers(heroPosition),
      actions: [],
      currentStreet: 'preflop',
      actingPosition: 'UTG',
      lastAggressor: null,
      board: [],
    })
  },

  addAction: (action) => {
    const { players, actions, actingPosition, lastAggressor } = get()

    if (action.position !== actingPosition) {
      console.warn('Action from wrong position')
      return
    }

    const newPlayers = new Map(players)
    const playerState = newPlayers.get(action.position)!
    let newLastAggressor = lastAggressor

    // Update player state based on action
    if (action.action === 'fold') {
      newPlayers.set(action.position, {
        ...playerState,
        isActive: false,
        range: null,
        hasActed: true,
      })
    } else {
      // Calculate the range based on the action
      let range: Range | null = null
      const isRaise = action.action === 'raise' || action.action === '3bet' || action.action === '4bet' || action.action === 'allin'

      if (isRaise) {
        // This is a raise - they become the last aggressor and everyone else needs to act again
        newLastAggressor = action.position

        // Reset hasActed for all other active players
        for (const [pos, state] of newPlayers) {
          if (pos !== action.position && state.isActive) {
            newPlayers.set(pos, { ...state, hasActed: false })
          }
        }
      }

      // Determine the range
      const priorRaises = actions.filter(
        a => a.action === 'raise' || a.action === '3bet' || a.action === '4bet'
      )

      if (priorRaises.length === 0 && !isRaise) {
        // No prior raises and this isn't a raise - shouldn't happen in standard play
      } else if (priorRaises.length === 0 && action.action === 'raise') {
        // First raise (RFI)
        range = getRFIRange(action.position)
      } else {
        // There's been a raise already
        const lastRaiseAction = [...actions].reverse().find(
          a => a.action === 'raise' || a.action === '3bet' || a.action === '4bet'
        )

        if (lastRaiseAction) {
          if (action.action === 'call') {
            range = getCallRange(action.position, lastRaiseAction.position)
          } else if (action.action === '3bet') {
            range = getThreeBetRange(action.position, lastRaiseAction.position)
          } else if (action.action === '4bet') {
            // For 4bet, we'd need 4bet ranges - for now use 3bet as approximation
            range = getThreeBetRange(action.position, lastRaiseAction.position)
          } else if (action.action === 'raise') {
            // This shouldn't happen if there's already been a raise
            range = getRFIRange(action.position)
          }
        }
      }

      newPlayers.set(action.position, {
        ...playerState,
        range: range || playerState.range,
        hasActed: true,
      })
    }

    // Find active players
    const activePlayers = Array.from(newPlayers.values())
      .filter(p => p.isActive)
      .map(p => p.position)

    // Determine if action is complete
    let nextPosition: Position | null = null

    if (activePlayers.length <= 1) {
      // Everyone folded except one - hand over
      nextPosition = null
    } else {
      // Check if all active players have acted since the last raise
      const allHaveActed = activePlayers.every(pos => {
        const state = newPlayers.get(pos)!
        return state.hasActed
      })

      if (allHaveActed) {
        // Preflop action complete - ready for flop
        nextPosition = null
      } else {
        // Find next player who hasn't acted
        nextPosition = getNextPosition(action.position, activePlayers)

        // Skip players who have already acted
        let attempts = 0
        while (nextPosition && newPlayers.get(nextPosition)!.hasActed && attempts < 6) {
          nextPosition = getNextPosition(nextPosition, activePlayers)
          attempts++
        }

        // If we looped back to someone who has acted, action is complete
        if (nextPosition && newPlayers.get(nextPosition)!.hasActed) {
          nextPosition = null
        }
      }
    }

    set({
      players: newPlayers,
      actions: [...actions, action],
      actingPosition: nextPosition,
      lastAggressor: newLastAggressor,
    })
  },

  undoLastAction: () => {
    const { actions, heroPosition } = get()
    if (actions.length === 0) return

    // Remove last action and recalculate state from scratch
    const newActions = actions.slice(0, -1)

    // Replay all actions to rebuild state
    const newPlayers = initializePlayers(heroPosition)
    let actingPosition: Position | null = 'UTG'
    let lastAggressor: Position | null = null

    for (const action of newActions) {
      const playerState = newPlayers.get(action.position)!
      const isRaise = action.action === 'raise' || action.action === '3bet' || action.action === '4bet' || action.action === 'allin'

      if (action.action === 'fold') {
        newPlayers.set(action.position, {
          ...playerState,
          isActive: false,
          range: null,
          hasActed: true,
        })
      } else {
        if (isRaise) {
          lastAggressor = action.position
          // Reset hasActed for all other active players
          for (const [pos, state] of newPlayers) {
            if (pos !== action.position && state.isActive) {
              newPlayers.set(pos, { ...state, hasActed: false })
            }
          }
        }

        // Calculate range
        let range: Range | null = null
        const priorActions = newActions.slice(0, newActions.indexOf(action))
        const priorRaises = priorActions.filter(
          a => a.action === 'raise' || a.action === '3bet' || a.action === '4bet'
        )

        if (priorRaises.length === 0 && action.action === 'raise') {
          range = getRFIRange(action.position)
        } else if (priorRaises.length > 0) {
          const lastRaiseAction = [...priorActions].reverse().find(
            a => a.action === 'raise' || a.action === '3bet' || a.action === '4bet'
          )
          if (lastRaiseAction) {
            if (action.action === 'call') {
              range = getCallRange(action.position, lastRaiseAction.position)
            } else if (action.action === '3bet' || action.action === '4bet') {
              range = getThreeBetRange(action.position, lastRaiseAction.position)
            }
          }
        }

        newPlayers.set(action.position, {
          ...playerState,
          range: range || playerState.range,
          hasActed: true,
        })
      }
    }

    // Determine next acting position
    const activePlayers = Array.from(newPlayers.values())
      .filter(p => p.isActive)
      .map(p => p.position)

    if (activePlayers.length <= 1) {
      actingPosition = null
    } else {
      const allHaveActed = activePlayers.every(pos => newPlayers.get(pos)!.hasActed)

      if (allHaveActed) {
        actingPosition = null
      } else if (newActions.length === 0) {
        actingPosition = 'UTG'
      } else {
        const lastAction = newActions[newActions.length - 1]
        actingPosition = getNextPosition(lastAction.position, activePlayers)

        // Skip players who have already acted
        let attempts = 0
        while (actingPosition && newPlayers.get(actingPosition)!.hasActed && attempts < 6) {
          actingPosition = getNextPosition(actingPosition, activePlayers)
          attempts++
        }

        if (actingPosition && newPlayers.get(actingPosition)!.hasActed) {
          actingPosition = null
        }
      }
    }

    set({
      players: newPlayers,
      actions: newActions,
      actingPosition,
      lastAggressor,
    })
  },

  setBoard: (cards) => {
    let street: Street = 'preflop'
    if (cards.length >= 3) street = 'flop'
    if (cards.length >= 4) street = 'turn'
    if (cards.length >= 5) street = 'river'

    set({ board: cards, currentStreet: street })
  },

  updatePlayerRange: (position, range) => {
    const { players } = get()
    const newPlayers = new Map(players)
    const playerState = newPlayers.get(position)

    if (playerState) {
      newPlayers.set(position, { ...playerState, range })
      set({ players: newPlayers })
    }
  },
}))
