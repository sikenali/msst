import type { KillRule, LotteryType } from '../types'
import { getMainNums, SSQ_REMAINDER_0, SSQ_REMAINDER_1, SSQ_REMAINDER_2 } from '../base'

export const remainder012Kill: KillRule = {
  name: '012路杀号',
  description: '上期某路号码开出≥4个极端热出，下期该路降温，杀该路冷号',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (type !== 'ssq' || history.length < 2) return killed
    const roads = [SSQ_REMAINDER_0, SSQ_REMAINDER_1, SSQ_REMAINDER_2]
    const roadNames = ['余0', '余1', '余2']
    for (let ri = 0; ri < roads.length; ri++) {
      const mainNums = getMainNums(history[0], type)
      const count = mainNums.filter(n => roads[ri].has(n)).length
      if (count >= 4) {
        const omission: Record<number, number> = {}
        for (const n of roads[ri]) omission[n] = 0
        for (let i = 0; i < history.length; i++) {
          const nums = getMainNums(history[i], type)
          for (const n of roads[ri]) {
            if (!nums.includes(n)) omission[n]++
            else omission[n] = 0
          }
        }
        const entries = Object.entries(omission).sort((a, b) => b[1] - a[1])
        const toKill = entries.slice(0, Math.min(3, entries.length))
        for (const [n] of toKill) killed.add(parseInt(n))
      }
    }
    return killed
  },
}
