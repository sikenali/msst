import type { KillRule } from '../types'
import { SINGULAR_NUMBERS, STABLE_NUMBERS, getMainNums } from '../base'

export const singularKill: KillRule = {
  name: '奇异数杀号',
  description: '十位+个位=奇为奇异数，反杀过热平稳数',
  apply(history, range, type) {
    const killed = new Set<number>()
    if (history.length < 5) return killed
    const freq = new Map<number, number>()
    for (const n of SINGULAR_NUMBERS) freq.set(n, 0)
    for (const n of STABLE_NUMBERS) freq.set(n, 0)
    for (const d of history.slice(0, 5)) {
      for (const n of d) { if (freq.has(n)) freq.set(n, (freq.get(n) || 0) + 1) }
    }
    const stableArr = [...STABLE_NUMBERS].map(n => ({ n, f: freq.get(n) || 0 })).sort((a, b) => b.f - a.f)
    for (let i = 0; i < Math.min(3, stableArr.length); i++) killed.add(stableArr[i].n)
    const hotSingular = [...SINGULAR_NUMBERS].map(n => ({ n, f: freq.get(n) || 0 })).sort((a, b) => b.f - a.f)
    for (let i = 0; i < Math.min(2, hotSingular.length); i++) killed.add(hotSingular[i].n)
    return killed
  },
}
