import type { Card } from '../../lib/poker/cards'
import type { Range } from '../../lib/poker/range'

export interface RangeVisualizerProps {
  range: Range
  onChange?: (range: Range) => void
  blockers?: Card[]
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showComboCount?: boolean
}

export interface RangeCellProps {
  row: number
  col: number
  handType: string
  weight: number
  comboInfo: ComboInfo | null
  isSelected: boolean
  readonly: boolean
  size: 'sm' | 'md' | 'lg'
  showComboCount: boolean
  onMouseDown: (row: number, col: number) => void
  onMouseEnter: (row: number, col: number) => void
}

export interface ComboInfo {
  total: number
  blocked: number
  available: number
}

export interface DragSelectionState {
  isDragging: boolean
  startCell: { row: number; col: number } | null
  currentCell: { row: number; col: number } | null
  mode: 'add' | 'remove'
}
