import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const spanValueBold: BoldRule = {
  name: '跨度数值定胆',
  description: '上期跨度本身为胆，跨度±6为辅胆',
  apply(history: number[][]) {
    if (history.length === 0) return []
    const mainNums = getMainNums(history[0], 'ssq')
    const sorted = [...mainNums].sort((a, b) => a - b)
    const span = sorted[sorted.length - 1] - sorted[0]
    const results = new Set<number>([span])
    const plus6 = span + 6
    const minus6 = span - 6
    if (plus6 <= 33) results.add(plus6)
    else results.add(plus6 - 33)
    if (minus6 >= 1) results.add(minus6)
    else results.add(minus6 + 33)
    return [...results]
  },
}
