export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export interface RangePackMetadata {
  name: string
  description: string
  stackDepth: number
  source: string
  version: string
}

export interface RangePack {
  metadata: RangePackMetadata
  rfi: Record<Position, string>
  callVsRfi: Record<string, string>
  threeBet: Record<string, string>
  callVs3Bet: Record<string, string>
  fourBet: Record<string, string>
  squeeze: Record<string, string>
  overcall: Record<string, string>
}
