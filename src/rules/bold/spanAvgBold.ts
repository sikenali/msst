import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const spanAvgBold: BoldRule = {
  name: '跨度加均值定胆',
  description: '上期跨度+均值，压缩至1-33取胆',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const sorted = [...mainNums].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const span = sorted[sorted.length - 1] - sorted[0]
    const avg = Math.round(sum / sorted.length)
    let val = span + avg
    while (val > 33) val -= 33
    while (val < 1) val += 33
    return [val]
  },
}
