import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const sumHalfBold: BoldRule = {
  name: '和值对半取胆',
  description: '上期和值÷2，结果压缩至1-33取胆',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const sum = mainNums.reduce((a, b) => a + b, 0)
    let val = Math.round(sum / 2)
    while (val > 33) val -= 33
    while (val < 1) val += 33
    return [val]
  },
}
