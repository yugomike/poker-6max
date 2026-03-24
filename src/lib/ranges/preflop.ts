// Preflop GTO ranges for 6-max 100bb cash games
// Based on standard charts (Upswing, RYE, etc.)

import type { Range } from '../poker/range'
import { parseRangeString } from '../poker/range'

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']

export const POSITION_LABELS: Record<Position, string> = {
  UTG: 'Under the Gun',
  HJ: 'Hijack',
  CO: 'Cutoff',
  BTN: 'Button',
  SB: 'Small Blind',
  BB: 'Big Blind',
}

/**
 * RFI (Raise First In) ranges by position
 * These are the hands you should open raise with when folded to you
 */
export const RFI_RANGES: Record<Position, string> = {
  // UTG: ~15% of hands - tight, premium focused
  UTG: 'AA,KK,QQ,JJ,TT,99,88,77,66,' +
    'AKs,AQs,AJs,ATs,A5s,A4s,' +
    'KQs,KJs,KTs,' +
    'QJs,QTs,' +
    'JTs,' +
    'T9s,' +
    '98s,' +
    '87s,' +
    '76s,' +
    'AKo,AQo,AJo,' +
    'KQo',

  // HJ: ~18% of hands
  HJ: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,' +
    'AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,' +
    'KQs,KJs,KTs,K9s,' +
    'QJs,QTs,Q9s,' +
    'JTs,J9s,' +
    'T9s,T8s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s,75s,' +
    '65s,' +
    'AKo,AQo,AJo,ATo,' +
    'KQo,KJo',

  // CO: ~25% of hands
  CO: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,' +
    'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,K7s,' +
    'QJs,QTs,Q9s,Q8s,' +
    'JTs,J9s,J8s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,96s,' +
    '87s,86s,85s,' +
    '76s,75s,' +
    '65s,64s,' +
    '54s,' +
    'AKo,AQo,AJo,ATo,A9o,' +
    'KQo,KJo,KTo,' +
    'QJo,QTo,' +
    'JTo',

  // BTN: ~40% of hands - widest opening range
  BTN: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
    'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,K4s,K3s,K2s,' +
    'QJs,QTs,Q9s,Q8s,Q7s,Q6s,Q5s,' +
    'JTs,J9s,J8s,J7s,J6s,' +
    'T9s,T8s,T7s,T6s,' +
    '98s,97s,96s,95s,' +
    '87s,86s,85s,84s,' +
    '76s,75s,74s,' +
    '65s,64s,63s,' +
    '54s,53s,' +
    '43s,' +
    'AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,' +
    'KQo,KJo,KTo,K9o,K8o,K7o,' +
    'QJo,QTo,Q9o,Q8o,' +
    'JTo,J9o,J8o,' +
    'T9o,T8o,' +
    '98o,97o,' +
    '87o,86o,' +
    '76o,75o,' +
    '65o',

  // SB: ~35% of hands (completing or raising vs limps, or raise/fold vs unopened)
  SB: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
    'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,K4s,' +
    'QJs,QTs,Q9s,Q8s,Q7s,Q6s,' +
    'JTs,J9s,J8s,J7s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,96s,' +
    '87s,86s,85s,' +
    '76s,75s,' +
    '65s,64s,' +
    '54s,53s,' +
    '43s,' +
    'AKo,AQo,AJo,ATo,A9o,A8o,A7o,A6o,A5o,' +
    'KQo,KJo,KTo,K9o,K8o,' +
    'QJo,QTo,Q9o,' +
    'JTo,J9o,' +
    'T9o,' +
    '98o',

  // BB has no RFI (already has money in)
  BB: '',
}

/**
 * Calling ranges vs RFI from each position (position-specific)
 * Key format: "caller_raiser" e.g., "BTN_CO" = BTN calling CO's raise
 */
export const CALL_VS_RFI: Record<string, string> = {
  // Calling from HJ vs UTG
  HJ_UTG: 'TT,99,88,77,' +
    'AQs,AJs,ATs,' +
    'KQs,KJs,' +
    'QJs,' +
    'JTs,' +
    'T9s,' +
    '98s,' +
    '87s,' +
    'AQo',

  // Calling from CO vs UTG
  CO_UTG: 'TT,99,88,77,66,' +
    'AQs,AJs,ATs,A9s,' +
    'KQs,KJs,KTs,' +
    'QJs,QTs,' +
    'JTs,J9s,' +
    'T9s,T8s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s,' +
    'AQo,AJo',

  // Calling from CO vs HJ
  CO_HJ: 'TT,99,88,77,66,55,' +
    'AQs,AJs,ATs,A9s,A8s,' +
    'KQs,KJs,KTs,K9s,' +
    'QJs,QTs,Q9s,' +
    'JTs,J9s,' +
    'T9s,T8s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s,75s,' +
    '65s,' +
    'AQo,AJo,ATo',

  // Calling from BTN vs UTG
  BTN_UTG: 'TT,99,88,77,66,55,' +
    'AQs,AJs,ATs,A9s,A5s,A4s,' +
    'KQs,KJs,KTs,' +
    'QJs,QTs,' +
    'JTs,J9s,' +
    'T9s,T8s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s,75s,' +
    '65s,64s,' +
    '54s,' +
    'AQo,AJo',

  // Calling from BTN vs HJ
  BTN_HJ: 'TT,99,88,77,66,55,44,' +
    'AQs,AJs,ATs,A9s,A8s,A5s,A4s,A3s,' +
    'KQs,KJs,KTs,K9s,' +
    'QJs,QTs,Q9s,' +
    'JTs,J9s,J8s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,96s,' +
    '87s,86s,85s,' +
    '76s,75s,' +
    '65s,64s,' +
    '54s,53s,' +
    'AQo,AJo,ATo',

  // Calling from BTN vs CO
  BTN_CO: 'TT,99,88,77,66,55,44,33,22,' +
    'AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,K7s,' +
    'QJs,QTs,Q9s,Q8s,' +
    'JTs,J9s,J8s,J7s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,96s,' +
    '87s,86s,85s,' +
    '76s,75s,74s,' +
    '65s,64s,' +
    '54s,53s,' +
    '43s,' +
    'AQo,AJo,ATo,A9o,' +
    'KQo,KJo,' +
    'QJo',

  // Calling from SB vs any position (usually tighter, out of position)
  SB_UTG: '99,88,77,66,' +
    'AQs,AJs,' +
    'KQs,KJs,' +
    'QJs,' +
    'JTs,' +
    'T9s,' +
    '98s',

  SB_HJ: '99,88,77,66,55,' +
    'AQs,AJs,ATs,' +
    'KQs,KJs,KTs,' +
    'QJs,QTs,' +
    'JTs,' +
    'T9s,' +
    '98s,' +
    '87s',

  SB_CO: '99,88,77,66,55,44,' +
    'AQs,AJs,ATs,A9s,' +
    'KQs,KJs,KTs,K9s,' +
    'QJs,QTs,Q9s,' +
    'JTs,J9s,' +
    'T9s,T8s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s',

  SB_BTN: '88,77,66,55,44,33,' +
    'AQs,AJs,ATs,A9s,A8s,' +
    'KQs,KJs,KTs,K9s,K8s,' +
    'QJs,QTs,Q9s,Q8s,' +
    'JTs,J9s,J8s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,96s,' +
    '87s,86s,' +
    '76s,75s,' +
    '65s,' +
    'AJo,ATo',

  // BB defense ranges (calling from BB vs various positions)
  BB_UTG: '99,88,77,66,55,44,33,22,' +
    'AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,' +
    'QJs,QTs,Q9s,Q8s,' +
    'JTs,J9s,J8s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s,75s,' +
    '65s,' +
    '54s,' +
    'AQo,AJo,ATo,' +
    'KQo,KJo',

  BB_HJ: '88,77,66,55,44,33,22,' +
    'AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,K7s,' +
    'QJs,QTs,Q9s,Q8s,Q7s,' +
    'JTs,J9s,J8s,J7s,' +
    'T9s,T8s,T7s,' +
    '98s,97s,96s,' +
    '87s,86s,85s,' +
    '76s,75s,' +
    '65s,64s,' +
    '54s,53s,' +
    '43s,' +
    'AQo,AJo,ATo,A9o,' +
    'KQo,KJo,KTo,' +
    'QJo',

  BB_CO: '77,66,55,44,33,22,' +
    'AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,' +
    'QJs,QTs,Q9s,Q8s,Q7s,Q6s,' +
    'JTs,J9s,J8s,J7s,J6s,' +
    'T9s,T8s,T7s,T6s,' +
    '98s,97s,96s,95s,' +
    '87s,86s,85s,84s,' +
    '76s,75s,74s,' +
    '65s,64s,63s,' +
    '54s,53s,52s,' +
    '43s,42s,' +
    '32s,' +
    'AJo,ATo,A9o,A8o,A7o,A6o,A5o,' +
    'KQo,KJo,KTo,K9o,' +
    'QJo,QTo,Q9o,' +
    'JTo,J9o,' +
    'T9o,' +
    '98o',

  BB_BTN: '66,55,44,33,22,' +
    'ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KJs,KTs,K9s,K8s,K7s,K6s,K5s,K4s,K3s,K2s,' +
    'QJs,QTs,Q9s,Q8s,Q7s,Q6s,Q5s,Q4s,' +
    'JTs,J9s,J8s,J7s,J6s,J5s,' +
    'T9s,T8s,T7s,T6s,T5s,' +
    '98s,97s,96s,95s,94s,' +
    '87s,86s,85s,84s,83s,' +
    '76s,75s,74s,73s,' +
    '65s,64s,63s,62s,' +
    '54s,53s,52s,' +
    '43s,42s,' +
    '32s,' +
    'ATo,A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,' +
    'KJo,KTo,K9o,K8o,K7o,K6o,' +
    'QJo,QTo,Q9o,Q8o,Q7o,' +
    'JTo,J9o,J8o,J7o,' +
    'T9o,T8o,T7o,' +
    '98o,97o,96o,' +
    '87o,86o,85o,' +
    '76o,75o,74o,' +
    '65o,64o,' +
    '54o',

  BB_SB: '55,44,33,22,' +
    'A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
    'KTs,K9s,K8s,K7s,K6s,K5s,K4s,K3s,K2s,' +
    'QTs,Q9s,Q8s,Q7s,Q6s,Q5s,Q4s,Q3s,Q2s,' +
    'J9s,J8s,J7s,J6s,J5s,J4s,' +
    'T9s,T8s,T7s,T6s,T5s,T4s,' +
    '98s,97s,96s,95s,94s,' +
    '87s,86s,85s,84s,83s,' +
    '76s,75s,74s,73s,72s,' +
    '65s,64s,63s,62s,' +
    '54s,53s,52s,' +
    '43s,42s,' +
    '32s,' +
    'A9o,A8o,A7o,A6o,A5o,A4o,A3o,A2o,' +
    'KTo,K9o,K8o,K7o,K6o,K5o,K4o,' +
    'QTo,Q9o,Q8o,Q7o,Q6o,Q5o,' +
    'JTo,J9o,J8o,J7o,J6o,' +
    'T9o,T8o,T7o,T6o,' +
    '98o,97o,96o,95o,' +
    '87o,86o,85o,84o,' +
    '76o,75o,74o,73o,' +
    '65o,64o,63o,' +
    '54o,53o,' +
    '43o',
}

/**
 * 3-betting ranges by position vs raiser position
 * Key format: "3better_raiser" e.g., "BTN_CO" = BTN 3-betting vs CO's open
 */
export const THREE_BET_RANGES: Record<string, string> = {
  // 3-betting from HJ vs UTG (polarized, premium heavy)
  HJ_UTG: 'AA,KK,QQ,AKs,AKo',

  // 3-betting from CO vs UTG
  CO_UTG: 'AA,KK,QQ,JJ,AKs,AQs,AKo',

  // 3-betting from CO vs HJ
  CO_HJ: 'AA,KK,QQ,JJ,TT,AKs,AQs,AJs,AKo,AQo',

  // 3-betting from BTN vs UTG (still fairly tight)
  BTN_UTG: 'AA,KK,QQ,JJ,AKs,AQs,A5s,AKo',

  // 3-betting from BTN vs HJ
  BTN_HJ: 'AA,KK,QQ,JJ,TT,AKs,AQs,AJs,A5s,A4s,KQs,AKo,AQo',

  // 3-betting from BTN vs CO (wider, more bluffs)
  BTN_CO: 'AA,KK,QQ,JJ,TT,99,' +
    'AKs,AQs,AJs,ATs,A5s,A4s,A3s,' +
    'KQs,KJs,' +
    'QJs,' +
    'AKo,AQo,AJo',

  // 3-betting from SB vs UTG
  SB_UTG: 'AA,KK,QQ,JJ,AKs,AQs,AKo',

  // 3-betting from SB vs HJ
  SB_HJ: 'AA,KK,QQ,JJ,TT,AKs,AQs,AJs,A5s,AKo,AQo',

  // 3-betting from SB vs CO
  SB_CO: 'AA,KK,QQ,JJ,TT,99,' +
    'AKs,AQs,AJs,ATs,A5s,A4s,' +
    'KQs,KJs,' +
    'AKo,AQo,AJo',

  // 3-betting from SB vs BTN (widest 3-bet range)
  SB_BTN: 'AA,KK,QQ,JJ,TT,99,88,' +
    'AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,' +
    'QJs,QTs,' +
    'JTs,' +
    'T9s,' +
    '98s,' +
    '87s,' +
    '76s,' +
    '65s,' +
    '54s,' +
    'AKo,AQo,AJo,ATo',

  // 3-betting from BB vs UTG
  BB_UTG: 'AA,KK,QQ,JJ,TT,AKs,AQs,AKo',

  // 3-betting from BB vs HJ
  BB_HJ: 'AA,KK,QQ,JJ,TT,99,AKs,AQs,AJs,A5s,AKo,AQo',

  // 3-betting from BB vs CO
  BB_CO: 'AA,KK,QQ,JJ,TT,99,88,' +
    'AKs,AQs,AJs,ATs,A5s,A4s,' +
    'KQs,KJs,' +
    'AKo,AQo,AJo',

  // 3-betting from BB vs BTN (polarized)
  BB_BTN: 'AA,KK,QQ,JJ,TT,99,88,77,' +
    'AKs,AQs,AJs,ATs,A9s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,' +
    'QJs,QTs,' +
    'JTs,' +
    'T9s,' +
    '98s,' +
    '87s,' +
    '76s,' +
    '65s,' +
    'AKo,AQo,AJo,ATo,A9o',

  // 3-betting from BB vs SB
  BB_SB: 'AA,KK,QQ,JJ,TT,99,88,77,66,' +
    'AKs,AQs,AJs,ATs,A9s,A8s,A5s,A4s,A3s,A2s,' +
    'KQs,KJs,KTs,K9s,' +
    'QJs,QTs,Q9s,' +
    'JTs,J9s,' +
    'T9s,T8s,' +
    '98s,97s,' +
    '87s,86s,' +
    '76s,75s,' +
    '65s,64s,' +
    '54s,' +
    'AKo,AQo,AJo,ATo,A9o,A8o,' +
    'KQo,KJo',
}

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
