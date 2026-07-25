import type { KillRule } from '../types'
import { getMainNums, numFreq, sortAsc } from '../base'

export const nineDimCrossKill: KillRule = {
  name: '九维交叉杀号',
  description: '九种独立规则，命中3条及以上则必杀',
  apply(history, range, type) {
    const killed = new Set<number>()
    if (history.length < 3) return killed
    const last = getMainNums(history[0], type)
    const freq = numFreq(history.slice(0, 10), range)
    const hitCount = new Map<number, number>()
    for (let n = 1; n <= range; n++) hitCount.set(n, 0)
    const zoneSize = Math.ceil(range / 9)
    for (let z = 0; z < 9; z++) {
      const zStart = z * zoneSize + 1
      const zEnd = Math.min((z + 1) * zoneSize, range)
      const recent2 = history.slice(0, 2)
      let total = 0
      for (const d of recent2) total += d.filter(x => x >= zStart && x <= zEnd).length
      if (total === 0) { for (let n = zStart; n <= zEnd; n++) hitCount.set(n, (hitCount.get(n) || 0) + 1) }
    }
    const sumTail = last.reduce((s, n) => s + (n % 10), 0) % 10
    for (let n = 1; n <= range; n++) { if (n % 10 === sumTail) hitCount.set(n, (hitCount.get(n) || 0) + 1) }
    const sorted = sortAsc(last)
    const htVal = sorted[0] + sorted[sorted.length - 1]
    const htNorm = htVal > range ? htVal - range : htVal
    hitCount.set(htNorm, (hitCount.get(htNorm) || 0) + 1)
    if (history.length >= 2) {
      const prev = history[1]
      for (const n of last) { if (prev.includes(n)) hitCount.set(n, (hitCount.get(n) || 0) + 1) }
    }
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        if (sorted[i] - 1 >= 1) hitCount.set(sorted[i] - 1, (hitCount.get(sorted[i] - 1) || 0) + 1)
        if (sorted[i + 1] + 1 <= range) hitCount.set(sorted[i + 1] + 1, (hitCount.get(sorted[i + 1] + 1) || 0) + 1)
      }
    }
    for (const [n, count] of hitCount) { if (count >= 3) killed.add(n) }
    return killed
  },
}
