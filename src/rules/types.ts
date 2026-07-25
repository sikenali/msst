export type LotteryType = 'ssq' | 'dlt'

export interface RuleResult<T = number[]> {
  name: string
  description: string
  output: T
}

export interface KillRule {
  name: string
  description: string
  apply(history: number[][], range: number, type: LotteryType): Set<number>
}

export interface SelectRule {
  name: string
  description: string
  apply(history: number[][], range: number, type: LotteryType): RuleResult
}

export interface BoldRule {
  name: string
  description: string
  apply(history: number[][]): number[]
}

export interface FilterRule {
  name: string
  description: string
  check(nums: number[], type: LotteryType): boolean
}

export interface MatrixRule {
  name: string
  description: string
  apply(pool: number[], pickCount: number, guarantee: string): number[][]
}

export interface SSQDraw {
  issue: string
  red: number[]
  blue: number
}

export interface DLTDraw {
  issue: string
  front: number[]
  back: number[]
}
