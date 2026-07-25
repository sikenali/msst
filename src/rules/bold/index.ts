import type { BoldRule } from '../types'
import { sumHalfBold } from './sumHalfBold'
import { spanAvgBold } from './spanAvgBold'
import { tailSumBold } from './tailSumBold'
import { parityDiffBold } from './parityDiffBold'
import { headTailHalfBold } from './headTailHalfBold'
import { spanValueBold } from './spanValueBold'
import { symmetryBold } from './symmetryBold'
import { neighborBold } from './neighborBold'
import { goldenRatioBold } from './goldenRatioBold'
import { headTailDiffBold } from './headTailDiffBold'
import { spanTailBold } from './spanTailBold'

export const allBoldRules: BoldRule[] = [
  sumHalfBold,
  spanAvgBold,
  tailSumBold,
  parityDiffBold,
  headTailHalfBold,
  spanValueBold,
  symmetryBold,
  neighborBold,
  goldenRatioBold,
  headTailDiffBold,
  spanTailBold,
]

export function runAllBoldRules(history: number[][]): Map<string, number[]> {
  const results = new Map<string, number[]>()
  for (const rule of allBoldRules) {
    results.set(rule.name, rule.apply(history))
  }
  return results
}

export function crossValidateBold(history: number[][]): number[] {
  const freq: Record<number, number> = {}
  for (const rule of allBoldRules) {
    const nums = rule.apply(history)
    for (const n of nums) {
      freq[n] = (freq[n] || 0) + 1
    }
  }
  return Object.entries(freq)
    .filter(([_, v]) => v >= 2)
    .map(([k]) => parseInt(k))
    .sort((a, b) => a - b)
}
