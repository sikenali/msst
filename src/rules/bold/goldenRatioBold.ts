import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const goldenRatioBold: BoldRule = {
  name: '黄金比例定胆',
  description: '上期每个红球×0.618取整，频次≥2的为胆',
  apply(history: number[][]) {
    if (history.length < 2) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const freq: Record<number, number> = {}
    for (const n of mainNums) {
      let val = Math.round(n * 0.618)
      if (val > 33) val -= 33
      if (val < 1) val = 1
      freq[val] = (freq[val] || 0) + 1
    }
    const prevNums = history.length > 1 ? getMainNums(history[1], 'ssq') : []
    for (const n of prevNums) {
      let val = Math.round(n * 0.618)
      if (val > 33) val -= 33
      if (val < 1) val = 1
      freq[val] = (freq[val] || 0) + 1
    }
    return Object.entries(freq)
      .filter(([_, v]) => v >= 2)
      .map(([k]) => parseInt(k))
      .sort((a, b) => a - b)
  },
}
