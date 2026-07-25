import type { KillRule } from '../types'
import { getMainNums, numFreq } from '../base'

export const sixPointCrossKill: KillRule = {
  name: '6点交叉验证杀号',
  description: '6个独立杀号点，3点以上同时命中则必杀',
  apply(history, range, type) {
    const killed = new Set<number>()
    if (history.length < 5) return killed
    const last = getMainNums(history[0], type)
    const freq = numFreq(history.slice(0, 10), range)
    const hitCount = new Map<number, number>()
    for (let n = 1; n <= range; n++) hitCount.set(n, 0)
    for (const n of last) {
      if ((freq.get(n) || 0) >= 5 && history.length >= 3) {
        const inAll3 = history.slice(0, 3).every(d => d.includes(n))
        if (inAll3) hitCount.set(n, (hitCount.get(n) || 0) + 1)
      }
    }
    const oddCount = last.filter(n => n % 2 === 1).length
    if (oddCount >= 4) { for (let n = 1; n <= range; n++) { if (n % 2 === 1 && !last.includes(n)) hitCount.set(n, (hitCount.get(n) || 0) + 1) } }
    if (oddCount <= 1) { for (let n = 1; n <= range; n++) { if (n % 2 === 0 && !last.includes(n)) hitCount.set(n, (hitCount.get(n) || 0) + 1) } }
    const tailCount = new Map<number, number>()
    for (const n of last) tailCount.set(n % 10, (tailCount.get(n % 10) || 0) + 1)
    for (const [t, c] of tailCount) { if (c >= 2) { for (let n = 1; n <= range; n++) { if (n % 10 === t && !last.includes(n)) hitCount.set(n, (hitCount.get(n) || 0) + 1) } } }
    for (const [n, count] of hitCount) { if (count >= 3) killed.add(n) }
    return killed
  },
}
