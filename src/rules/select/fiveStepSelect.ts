import type { SelectRule } from '../types'
import { getMainNums, numFreq } from '../base'

export const fiveStepSelect: SelectRule = {
  name: '五步公式法',
  description: '区间划分→奇偶质合→冷热搭配→和值跨度→蓝球推演',
  bagua: 'xun',
  apply(history, range, type) {
    if (history.length < 10) {
      return { name: '五步公式法', description: '需要至少10期历史数据', output: [] }
    }
    const last = getMainNums(history[0], type)
    const zoneSize = Math.ceil(range / 3)
    const candidates: number[] = []
    for (let z = 0; z < 3; z++) {
      const zStart = z * zoneSize + 1
      const zEnd = Math.min((z + 1) * zoneSize, range)
      const zoneNums: number[] = []
      for (let n = zStart; n <= zEnd; n++) { if (!last.includes(n)) zoneNums.push(n) }
      const shuffled = [...zoneNums].sort(() => Math.random() - 0.5)
      candidates.push(...shuffled.slice(0, 3))
    }
    const freq = numFreq(history.slice(0, 20), range)
    const hot = candidates.filter(n => (freq.get(n) || 0) >= 4)
    const warm = candidates.filter(n => (freq.get(n) || 0) >= 2 && (freq.get(n) || 0) < 4)
    const cold = candidates.filter(n => (freq.get(n) || 0) < 2)
    const result: number[] = []
    const addIfSpace = (pool: number[], max: number) => {
      for (const n of pool) {
        if (result.length >= max) break
        const testSum = [...result, n].reduce((s, x) => s + x, 0)
        if (testSum <= 130) result.push(n)
      }
    }
    addIfSpace(hot, 1)
    addIfSpace(warm, 2)
    addIfSpace(cold, 6)
    return {
      name: '五步公式法',
      description: `热${hot.length}温${warm.length}冷${cold.length} → ${result.length}码`,
      output: result.slice(0, type === 'dlt' ? 5 : 6),
    }
  },
}
