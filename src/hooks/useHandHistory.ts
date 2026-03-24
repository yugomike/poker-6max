// Hook for managing hand history

import { useState, useEffect, useCallback } from 'react'
import {
  saveHand,
  getAllHands,
  deleteHand,
  type SavedHand,
  type StoredPlayerRange,
} from '../lib/storage/db'
import { useGameStore } from '../store/gameStore'

export function useHandHistory() {
  const [hands, setHands] = useState<SavedHand[]>([])
  const [loading, setLoading] = useState(true)

  const { heroPosition, actions, board, players } = useGameStore()

  // Load hands on mount
  useEffect(() => {
    loadHands()
  }, [])

  const loadHands = useCallback(async () => {
    setLoading(true)
    try {
      const allHands = await getAllHands()
      setHands(allHands)
    } catch (err) {
      console.error('Failed to load hands:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveCurrentHand = useCallback(async (tags: string[] = [], notes: string = '') => {
    if (!heroPosition) {
      throw new Error('No hero position set')
    }

    // Convert player ranges to storable format
    const playerRanges: StoredPlayerRange[] = []
    for (const [position, state] of players) {
      if (state.range) {
        const weights: Record<string, number> = {}
        for (const [handType, weight] of state.range.weights) {
          weights[handType] = weight
        }
        playerRanges.push({ position, weights })
      }
    }

    const hand: Omit<SavedHand, 'id'> = {
      timestamp: new Date(),
      heroPosition,
      actions: actions.map(a => ({ position: a.position, action: a.action })),
      board: [...board],
      playerRanges,
      tags,
      notes,
    }

    const id = await saveHand(hand)
    await loadHands() // Refresh list
    return id
  }, [heroPosition, actions, board, players, loadHands])

  const removeHand = useCallback(async (id: number) => {
    await deleteHand(id)
    await loadHands()
  }, [loadHands])

  return {
    hands,
    loading,
    saveCurrentHand,
    removeHand,
    refreshHands: loadHands,
  }
}
