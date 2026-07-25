import type { SelectRule } from '../types'
import { getMainNums } from '../base'

export const headTailSumZoneSelect: SelectRule = {
  name: '首尾和定区法',
  description: '首尾和=最小+最大，理论中心值36，3字头(31-40)最高频',
  bagua: 'kan',
  apply(history, range, type) {
    if (history.length < 5) {
      return { name: '首尾和定区法', description: '需要历史数据', output: [] }
    }
    const last = getMainNums(history[0], type)
    const sorted = [...last].sort((a, b) => a - b)
    const head = sorted[0]
    const tail = sorted[sorted.length - 1]
    const recent10 = history.slice(0, 10)
    const avgSum = recent10.reduce((s, d) => {
      const ms = getMainNums(d, type).sort((a, b) => a - b)
      return s + ms[0] + ms[ms.length - 1]
    }, 0) / recent10.length
    const direction = avgSum > 38 ? 'down' : avgSum < 30 ? 'up' : 'stable'
    const targetMin = direction === 'up' ? 30 : direction === 'down' ? 34 : 32
    const targetMax = direction === 'up' ? 38 : direction === 'down' ? 42 : 40
    let bestHead = 1, bestTail = range
    for (let h = 1; h <= Math.min(12, range); h++) {
      for (let t = Math.max(23, h + 5); t <= range; t++) {
        const s = h + t
        if (s >= targetMin && s <= targetMax) { bestHead = h; bestTail = t; break }
      }
    }
    const result = [bestHead, bestTail]
    const middle: number[] = []
    for (let n = bestHead + 1; n < bestTail; n++) middle.push(n)
    const shuffled = [...middle].sort(() => Math.random() - 0.5)
    const need = (type === 'dlt' ? 5 : 6) - 2
    result.push(...shuffled.slice(0, need))
    return {
      name: '首尾和定区法',
      description: `方向${direction}, 头${bestHead}尾${bestTail}, 和${bestHead + bestTail}`,
      output: result.sort((a, b) => a - b).slice(0, type === 'dlt' ? 5 : 6),
    }
  },
}
