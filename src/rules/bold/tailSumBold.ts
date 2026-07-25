import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const tailSumBold: BoldRule = {
  name: '尾和取个位定胆',
  description: '尾数之和的个位对应号码',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const tails = mainNums.map(n => n % 10)
    const tailSum = tails.reduce((a, b) => a + b, 0)
    let t = tailSum % 10
    if (t === 0) t = 10
    const results: number[] = []
    for (let n = t; n <= 33; n += 10) results.push(n)
    return results
  },
}
