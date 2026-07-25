import type { SelectRule } from '../types'
import { getMainNums } from '../base'

export const tripleSumSelect: SelectRule = {
  name: '首尾和+2-4位和+18中位法',
  description: '大乐透专用：首尾和≈36, 2-4位和≈36, 中位≈18',
  bagua: 'gen',
  appliesTo: ['dlt'],
  apply(history, range, type) {
    if (type !== 'dlt' || history.length < 5) {
      return { name: '首尾和+2-4位和+18中位法', description: '需要大乐透历史数据', output: [] }
    }
    const recent = history.slice(0, 5)
    const avgHTSum = recent.reduce((s, d) => {
      const main = getMainNums(d, 'dlt')
      const sorted = [...main].sort((a, b) => a - b)
      return s + sorted[0] + sorted[4]
    }, 0) / recent.length
    const targetSum = avgHTSum > 38 ? 34 : avgHTSum < 32 ? 32 : 36
    const combos: number[][] = []
    for (let h = 1; h <= 17; h++) {
      const t = targetSum - h
      if (t < 25 || t > 35 || t <= h) continue
      for (let p2 = h + 1; p2 <= 20; p2++) {
        const p4 = targetSum - p2
        if (p4 <= p2 || p4 >= t || p4 <= 15) continue
        for (const center of [16, 17, 18, 19, 20]) {
          if (center <= p2 || center >= p4) continue
          const combo = [h, p2, center, p4, t]
          const oddCount = combo.filter(n => n % 2 === 1).length
          if (oddCount === 2 || oddCount === 3) combos.push(combo)
        }
      }
    }
    if (combos.length === 0) {
      combos.push([1, 9, 18, 27, 35])
    }
    return {
      name: '首尾和+2-4位和+18中位法',
      description: `目标首尾和=${targetSum}, 共${combos.length}组`,
      output: combos.slice(0, 3).flat(),
    }
  },
}
