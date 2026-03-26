import { memo } from 'react'
import type { RangeCellProps } from './types'

const SIZE_CLASSES = {
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-7 h-7 text-[10px]',
  lg: 'w-9 h-9 text-xs',
}

const SUFFIX_CLASSES = {
  sm: 'text-[6px] opacity-70',
  md: 'text-[8px] opacity-80',
  lg: 'text-[10px] opacity-90',
}

const COMBO_COUNT_CLASSES = {
  sm: 'text-[6px] opacity-70',
  md: 'text-[8px] opacity-80',
  lg: 'text-[10px] opacity-90',
}

export const RangeCell = memo(function RangeCell({
  row,
  col,
  handType,
  weight,
  comboInfo,
  isSelected,
  readonly,
  size,
  showComboCount,
  onMouseDown,
  onMouseEnter,
}: RangeCellProps) {
  const isPair = row === col
  const isSuited = row < col

  // Calculate cell styling based on state
  const getBackgroundClass = (): string => {
    // Fully blocked - gray out
    if (comboInfo && comboInfo.available === 0 && weight > 0) {
      return 'bg-gray-600'
    }

    // No weight - empty cell
    if (weight === 0) {
      return 'bg-gray-700'
    }

    // Partially blocked - apply transparency
    if (comboInfo && comboInfo.blocked > 0) {
      if (weight >= 1) return 'bg-green-500/70'
      if (weight >= 0.5) return 'bg-green-600/70'
      return 'bg-green-700/70'
    }

    // Normal weight-based coloring
    if (weight >= 1) return 'bg-green-500'
    if (weight >= 0.5) return 'bg-green-600'
    return 'bg-green-700'
  }

  const getTextClass = (): string => {
    if (comboInfo && comboInfo.available === 0 && weight > 0) {
      return 'text-white/30'
    }
    if (weight === 0) {
      return 'text-white/40'
    }
    return 'text-white/90'
  }

  const getBorderClass = (): string => {
    // Selection highlight takes priority
    if (isSelected) {
      return 'ring-2 ring-blue-400'
    }

    // Type-based ring
    if (isPair) {
      return 'ring-1 ring-yellow-500/30'
    }
    if (isSuited) {
      return 'ring-1 ring-blue-500/20'
    }
    return ''
  }

  // Format hand type for display (e.g., "AK" with small "s" or "o")
  const baseHandType = handType.replace('s', '').replace('o', '')
  const suffix = !isPair ? (isSuited ? 's' : 'o') : null

  // Format combo count display
  const comboDisplay =
    showComboCount && comboInfo
      ? comboInfo.blocked > 0
        ? `${comboInfo.available}/${comboInfo.total}`
        : `${comboInfo.total}`
      : null

  // Generate tooltip
  const getTooltip = (): string => {
    let tooltip = handType
    if (weight > 0 && weight < 1) {
      tooltip += ` (${Math.round(weight * 100)}%)`
    }
    if (comboInfo) {
      if (comboInfo.blocked > 0) {
        tooltip += ` - ${comboInfo.available}/${comboInfo.total} combos available`
      } else {
        tooltip += ` - ${comboInfo.total} combos`
      }
    }
    return tooltip
  }

  return (
    <button
      className={`
        ${SIZE_CLASSES[size]}
        ${getBackgroundClass()}
        ${getTextClass()}
        ${getBorderClass()}
        flex flex-col items-center justify-center
        font-mono font-medium
        rounded-sm
        transition-colors
        select-none
        ${!readonly ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}
      `}
      onMouseDown={(e) => {
        if (!readonly) {
          e.preventDefault()
          onMouseDown(row, col)
        }
      }}
      onMouseEnter={() => {
        if (!readonly) {
          onMouseEnter(row, col)
        }
      }}
      disabled={readonly}
      title={getTooltip()}
    >
      <span className="leading-none flex items-baseline">
        {baseHandType}
        {suffix && <span className={SUFFIX_CLASSES[size]}>{suffix}</span>}
      </span>
      {comboDisplay && (
        <span className={`${COMBO_COUNT_CLASSES[size]} leading-none`}>
          {comboDisplay}
        </span>
      )}
    </button>
  )
})
