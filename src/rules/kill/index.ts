import { subtractionKill, subtractionKillV2, subtractionKillV3 } from './subtractionKill'
import { headKill, tailKill, headPlusBlueKill, headMinusBlueKill, headTailDiffTailKill } from './headTailKill'
import { hotTailKill, sumTailKill, sumHeadTailKill } from './tailKill'
import { breakZoneKill, zoneOmissionKill, emptyRowColKill } from './zoneKill'
import { remainder012Kill } from './remainderKill'
import { obliqueKill, overHotKill, deepColdKill, consecutiveNeighborKill, issueTailKill, redBlueLinkKill } from './consecutiveKill'
import { nineDimCrossKill } from './nineDimCrossKill'
import { tailPairKill } from './tailPairKill'
import { sixPointCrossKill } from './sixPointKill'
import { fourLayerRedKill } from './fourLayerKill'
import { fiveRowSevenColKill } from './fiveRowSevenColKill'
import { singularKill } from './singularKill'
import { blue12Kill } from './blue12Kill'
import type { KillRule } from '../types'
import { getHistoryForRule } from '../config'

export const allKillRules: KillRule[] = [
  subtractionKill,
  subtractionKillV2,
  subtractionKillV3,
  headKill,
  tailKill,
  headPlusBlueKill,
  headMinusBlueKill,
  headTailDiffTailKill,
  hotTailKill,
  sumTailKill,
  sumHeadTailKill,
  breakZoneKill,
  zoneOmissionKill,
  emptyRowColKill,
  remainder012Kill,
  obliqueKill,
  overHotKill,
  deepColdKill,
  consecutiveNeighborKill,
  issueTailKill,
  redBlueLinkKill,
  nineDimCrossKill,
  tailPairKill,
  sixPointCrossKill,
  fourLayerRedKill,
  fiveRowSevenColKill,
  singularKill,
  blue12Kill,
]

export function applyAllKillRules(
  rules: KillRule[],
  history: number[][],
  range: number,
  type: 'ssq' | 'dlt'
): Set<number> {
  const combined = new Set<number>()
  for (const rule of rules) {
    const h = getHistoryForRule(history, rule.name)
    const result = rule.apply(h, range, type)
    for (const n of result) combined.add(n)
  }
  return combined
}

export function applySelectedKillRules(
  ruleNames: string[],
  history: number[][],
  range: number,
  type: 'ssq' | 'dlt'
): Set<number> {
  const selected = allKillRules.filter(r => ruleNames.includes(r.name))
  return applyAllKillRules(selected, history, range, type)
}
