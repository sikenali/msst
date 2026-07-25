import type { SelectRule } from '../types'
import { NINE_PALACES, numToPalace } from '../base'

export const ninePalaceSelect: SelectRule = {
  name: '九宫选号法',
  description: '洛书九宫数字模型，飞星顺逆推演锁定区间',
  bagua: 'qian',
  apply(history, range, type) {
    if (history.length < 2) {
      return { name: '九宫选号法', description: '需要历史数据', output: [] }
    }
    const last = history[0]
    const lastPalaces = [...new Set(last.map(n => numToPalace(n)))].filter(p => p > 0)
    const forwardOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4]
    const forward3 = new Set<number>()
    for (const p of lastPalaces) {
      const idx = forwardOrder.indexOf(p)
      if (idx >= 0) { [1, 2, 3].forEach(offset => forward3.add(forwardOrder[(idx + offset) % 9])) }
    }
    const backwardOrder = [5, 4, 3, 2, 1, 9, 8, 7, 6]
    const backward1 = new Set<number>()
    for (const p of lastPalaces) {
      const idx = backwardOrder.indexOf(p)
      if (idx >= 0) backward1.add(backwardOrder[(idx + 1) % 9])
    }
    const intersection = [...forward3].filter(p => backward1.has(p))
    const candidates: number[] = []
    for (const p of intersection) {
      const nums = NINE_PALACES[p] || []
      if (p === 5) candidates.push(...nums)
      else candidates.push(...nums.slice(0, 2))
    }
    return {
      name: '九宫选号法',
      description: `主攻${intersection.length}宫: ${intersection.join(',')}`,
      output: [...new Set(candidates)].slice(0, 8),
    }
  },
}
