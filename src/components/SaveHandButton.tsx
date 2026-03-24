// Save hand button component

import { useState } from 'react'
import { useHandHistory } from '../hooks/useHandHistory'
import { useGameStore } from '../store/gameStore'

export function SaveHandButton() {
  const { board, actions } = useGameStore()
  const { saveCurrentHand } = useHandHistory()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Only show if there's meaningful data to save
  const canSave = actions.length > 0 && board.length >= 3

  if (!canSave) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCurrentHand()
      setSaved(true)
      // Reset saved state after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save hand:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      className={`
        px-4 py-2 rounded-lg text-sm font-medium
        transition-all
        ${saved
          ? 'bg-green-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-white'
        }
        disabled:opacity-50
      `}
      onClick={handleSave}
      disabled={saving || saved}
    >
      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Hand'}
    </button>
  )
}
