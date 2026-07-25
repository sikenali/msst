import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const headTailHalfBold: BoldRule = {
  name: '首尾相加折半定胆',
  description: '(最小号+最大号)÷2',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const sorted = [...mainNums].sort((a, b) => a - b)
    let val = Math.round((sorted[0] + sorted[sorted.length - 1]) / 2)
    while (val > 33) val -= 33
    return [val]
  },
}
