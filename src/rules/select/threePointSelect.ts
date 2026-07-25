import type { SelectRule } from '../types'
import { getMainNums } from '../base'

export const threePointSelect: SelectRule = {
  name: '三点合围选号法',
  description: '本位+顺延+区间对称三重叠加入围',
  apply(history: number[][], range: number, type: 'ssq' | 'dlt') {
    if (history.length === 0) {
      return { name: '三点合围选号法', description: '无历史数据', output: [] }
    }
    const mainNums = getMainNums(history[0], type)
    const coverage = new Set<number>()
    for (const n of mainNums) {
      coverage.add(n)
      if (n - 1 >= 1) coverage.add(n - 1)
      if (n + 1 <= range) coverage.add(n + 1)
    }
    const allNums = new Set(Array.from({ length: range }, (_, i) => i + 1))
    const uncovered = [...allNums].filter(n => !coverage.has(n))
    if (uncovered.length > 0) {
      const sortedUncovered = [...uncovered].sort((a, b) => a - b)
      const mid = Math.floor(sortedUncovered.length / 2)
      const gapCenter = sortedUncovered.slice(Math.max(0, mid - 2), mid + 3)
      for (const n of gapCenter) coverage.add(n)
    }
    const result = [...coverage].sort((a, b) => a - b)
    return {
      name: '三点合围选号法',
      description: `合围覆盖${result.length}个号码，高密度区为出号核心`,
      output: result.slice(0, Math.min(15, result.length)),
    }
  },
}
