import type { SelectRule } from '../types'

export const goldenRatioDLTSelect: SelectRule = {
  name: '大乐透黄金分割法',
  description: '黄金比例0.618，锚点13和22',
  bagua: 'li',
  apply(history, range, type) {
    if (type !== 'dlt') {
      return { name: '大乐透黄金分割法', description: '仅适用于大乐透', output: [] }
    }
    const anchorA = 13
    const anchorB = 22
    const candidates = [...new Set([
      anchorA - 2, anchorA - 1, anchorA, anchorA + 1, anchorA + 2,
      anchorB - 2, anchorB - 1, anchorB, anchorB + 1, anchorB + 2,
    ])].filter(n => n >= 1 && n <= 35)
    for (const zone of [[1, 13], [14, 22], [23, 35]]) {
      const mid = Math.round((zone[0] + zone[1]) / 2)
      candidates.push(mid - 1, mid, mid + 1)
    }
    return {
      name: '大乐透黄金分割法',
      description: `锚点${anchorA}/${anchorB}，三区间均衡`,
      output: [...new Set(candidates)].filter(n => n >= 1 && n <= 35).slice(0, 8),
    }
  },
}
