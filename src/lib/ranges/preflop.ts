// Preflop GTO ranges for 6-max 100bb cash games
// Ranges loaded from external JSON for easy customization

import type { Range } from '../poker/range'
import { parseRangeString } from '../poker/range'
import type { Position, RangePack } from './types'
import defaultRanges from './data/default-100bb.json'

export type { Position }

export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']

export const POSITION_LABELS: Record<Position, string> = {
  UTG: 'Under the Gun',
  HJ: 'Hijack',
  CO: 'Cutoff',
  BTN: 'Button',
  SB: 'Small Blind',
  BB: 'Big Blind',
}

// Load and validate the default range pack
const rangePack: RangePack = defaultRanges as RangePack

// Export range data for direct access if needed
export const RFI_RANGES = rangePack.rfi
export const CALL_VS_RFI = rangePack.callVsRfi
export const THREE_BET_RANGES = rangePack.threeBet
export const CALL_VS_3BET = rangePack.callVs3Bet
export const FOUR_BET_RANGES = rangePack.fourBet
export const SQUEEZE_RANGES = rangePack.squeeze
export const OVERCALL_RANGES = rangePack.overcall
export const RANGE_METADATA = rangePack.metadata

/**
 * Get the RFI range for a position
 */
export function getRFIRange(position: Position): Range {
  return parseRangeString(RFI_RANGES[position])
}

/**
 * Get the calling range for a position vs a raiser
 */
export function getCallRange(caller: Position, raiser: Position): Range {
  const key = `${caller}_${raiser}`
  const rangeStr = CALL_VS_RFI[key] || ''
  return parseRangeString(rangeStr)
}

/**
 * Get the 3-betting range for a position vs a raiser
 */
export function getThreeBetRange(threeBetter: Position, raiser: Position): Range {
  const key = `${threeBetter}_${raiser}`
  const rangeStr = THREE_BET_RANGES[key] || ''
  return parseRangeString(rangeStr)
}

/**
 * Get the calling range for opener vs a 3-bet
 */
export function getCallVs3BetRange(opener: Position, threeBetter: Position): Range {
  const key = `${opener}_${threeBetter}`
  const rangeStr = CALL_VS_3BET[key] || ''
  return parseRangeString(rangeStr)
}

/**
 * Get the 4-betting range for opener vs a 3-bet
 */
export function getFourBetRange(opener: Position, threeBetter: Position): Range {
  const key = `${opener}_${threeBetter}`
  const rangeStr = FOUR_BET_RANGES[key] || ''
  return parseRangeString(rangeStr)
}

/**
 * Get the squeeze range (3-bet with caller(s) in between)
 */
export function getSqueezeRange(squeezer: Position, opener: Position): Range {
  const key = `${squeezer}_${opener}`
  const rangeStr = SQUEEZE_RANGES[key] || ''
  return parseRangeString(rangeStr)
}

/**
 * Get the overcall range (calling after raise + call)
 */
export function getOvercallRange(overcaller: Position, opener: Position): Range {
  const key = `${overcaller}_${opener}`
  const rangeStr = OVERCALL_RANGES[key] || ''
  return parseRangeString(rangeStr)
}
