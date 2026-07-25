import type { SelectRule } from '../types'
import { TWIN_STAR_GROUPS } from '../base'

export const twinStarSelect: SelectRule = {
  name: '后区双子星组合法',
  description: '大乐透后区专用，双子星配对冷热筛选',
  bagua: 'dui',
  apply(history, range, type) {
    if (type !== 'dlt' || history.length < 5) {
      return { name: '后区双子星组合法', description: '需要大乐透历史数据', output: [] }
    }
    const backs = history.slice(0, 10).map(d => d.slice(5, 7))
    const groupFreq = new Array(6).fill(0)
    for (const draw of backs) {
      for (let g = 0; g < 6; g++) {
        const [a, b] = TWIN_STAR_GROUPS[g]
        if (draw.includes(a) || draw.includes(b)) groupFreq[g]++
      }
    }
    const selected: number[] = []
    const hotGroups = groupFreq.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f).slice(0, 2)
    for (const { i } of hotGroups) selected.push(...TWIN_STAR_GROUPS[i])
    return {
      name: '后区双子星组合法',
      description: `近10期热度: ${groupFreq.join(',')}`,
      output: [...new Set(selected)].slice(0, 4),
    }
  },
}
