import { useState, useCallback, useEffect } from 'react'

interface UseDragSelectionOptions {
  onSelectionComplete: (cells: Array<{ row: number; col: number }>, mode: 'add' | 'remove') => void
  getWeight: (row: number, col: number) => number
}

export function useDragSelection({ onSelectionComplete, getWeight }: UseDragSelectionOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null)
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null)
  const [mode, setMode] = useState<'add' | 'remove'>('add')

  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      setIsDragging(true)
      setStartCell({ row, col })
      setCurrentCell({ row, col })
      // Determine mode based on whether the starting cell has weight
      const weight = getWeight(row, col)
      setMode(weight > 0 ? 'remove' : 'add')
    },
    [getWeight]
  )

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isDragging) {
        setCurrentCell({ row, col })
      }
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging && startCell && currentCell) {
      const selectedCells = getSelectedCells(startCell, currentCell)
      onSelectionComplete(selectedCells, mode)
    }
    setIsDragging(false)
    setStartCell(null)
    setCurrentCell(null)
  }, [isDragging, startCell, currentCell, mode, onSelectionComplete])

  // Global mouse up listener to handle mouse up outside the grid
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        handleMouseUp()
      }
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, handleMouseUp])

  // Calculate which cells are selected (rectangular region)
  const getSelectedCells = (
    start: { row: number; col: number },
    end: { row: number; col: number }
  ): Array<{ row: number; col: number }> => {
    const cells: Array<{ row: number; col: number }> = []
    const minRow = Math.min(start.row, end.row)
    const maxRow = Math.max(start.row, end.row)
    const minCol = Math.min(start.col, end.col)
    const maxCol = Math.max(start.col, end.col)

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push({ row, col })
      }
    }

    return cells
  }

  // Check if a cell is in the current selection
  const isCellSelected = useCallback(
    (row: number, col: number): boolean => {
      if (!isDragging || !startCell || !currentCell) return false

      const minRow = Math.min(startCell.row, currentCell.row)
      const maxRow = Math.max(startCell.row, currentCell.row)
      const minCol = Math.min(startCell.col, currentCell.col)
      const maxCol = Math.max(startCell.col, currentCell.col)

      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol
    },
    [isDragging, startCell, currentCell]
  )

  return {
    isDragging,
    mode,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isCellSelected,
  }
}
