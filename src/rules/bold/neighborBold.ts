import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const neighborBold: BoldRule = {
  name: '邻号顺延定胆',
  description: '上期红球±1的邻号中选温热号',
  apply(history: number[][]) {
    if (history.length < 2) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const neighbors = new Set<number>()
    for (const n of mainNums) {
      if (n - 1 >= 1) neighbors.add(n - 1)
      if (n + 1 <= 33) neighbors.add(n + 1)
    }
    const freq: Record<number, number> = {}
    for (let i = 1; i <= 33; i++) freq[i] = 0
    for (let i = 0; i < Math.min(5, history.length); i++) {
      for (const n of getMainNums(history[i], 'ssq')) freq[n]++
    }
    const warmNeighbors = [...neighbors].filter(n => freq[n] >= 1 && freq[n] <= 3)
    const sorted = warmNeighbors.sort((a, b) => freq[b] - freq[a])
    return sorted.slice(0, 3)
  },
}
