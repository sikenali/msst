import type { BoldRule } from '../types'
import { getMainNums } from '../base'

const SYMMETRY_MAP: Record<number, number> = {
  1: 33, 33: 1, 2: 32, 32: 2, 3: 31, 31: 3, 4: 30, 30: 4,
  5: 29, 29: 5, 6: 28, 28: 6, 7: 27, 27: 7, 8: 26, 26: 8,
  9: 25, 25: 9, 10: 24, 24: 10, 11: 23, 23: 11, 12: 22, 22: 12,
  13: 21, 21: 13, 14: 20, 20: 14, 15: 19, 19: 15, 16: 18, 18: 16,
}

export const symmetryBold: BoldRule = {
  name: '34对称对码定胆',
  description: '上期号码的34对称码（01↔33, 02↔32...）',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const results = new Set<number>()
    for (const n of mainNums) {
      if (SYMMETRY_MAP[n]) results.add(SYMMETRY_MAP[n])
    }
    return [...results].sort((a, b) => a - b)
  },
}
