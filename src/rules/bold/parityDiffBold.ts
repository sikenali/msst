import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const parityDiffBold: BoldRule = {
  name: '奇偶差乘5加最小号',
  description: '(奇数个数-偶数个数)×5 + 最小号',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const oddCount = mainNums.filter(n => n % 2 === 1).length
    const evenCount = mainNums.length - oddCount
    const diff = Math.abs(oddCount - evenCount)
    const sorted = [...mainNums].sort((a, b) => a - b)
    let val = diff * 5 + sorted[0]
    while (val > 33) val -= 33
    return [val]
  },
}
