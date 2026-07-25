import type { KillRule } from '../types'
import { TAIL_PAIRS } from '../base'

export const tailPairKill: KillRule = {
  name: '尾数对码杀号',
  description: '对码冷热交替：1↔9,2↔8,3↔7,4↔6,0↔5',
  apply(history, range, type) {
    const killed = new Set<number>()
    if (history.length < 10) return killed
    const tailFreq = new Map<number, number>()
    for (let t = 0; t <= 9; t++) tailFreq.set(t, 0)
    for (const d of history.slice(0, 10)) {
      const tails = new Set(d.map(n => n % 10))
      tails.forEach(t => tailFreq.set(t, (tailFreq.get(t) || 0) + 1))
    }
    for (const [a, b] of TAIL_PAIRS) {
      const fa = tailFreq.get(a) || 0
      const fb = tailFreq.get(b) || 0
      const killTail = fa >= fb ? b : a
      for (let n = 1; n <= range; n++) { if (n % 10 === killTail) killed.add(n) }
    }
    for (const [t, f] of tailFreq) { if (f <= 3) { for (let n = 1; n <= range; n++) { if (n % 10 === t) killed.add(n) } } }
    return killed
  },
}
