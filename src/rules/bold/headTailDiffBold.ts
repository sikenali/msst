import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const headTailDiffBold: BoldRule = {
  name: '首尾差值参考法',
  description: '(凤尾-龙头)的±1范围内为参考号',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const sorted = [...mainNums].sort((a, b) => a - b)
    const diff = sorted[sorted.length - 1] - sorted[0]
    const results = new Set<number>()
    if (diff >= 10 && diff <= 30) {
      if (diff - 1 >= 1) results.add(diff - 1)
      results.add(diff)
      if (diff + 1 <= 33) results.add(diff + 1)
    } else {
      results.add(diff)
    }
    return [...results].sort((a, b) => a - b)
  },
}
