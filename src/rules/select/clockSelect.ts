import type { SelectRule } from '../types'
import { getMainNums } from '../base'

export const clockSelect: SelectRule = {
  name: '奖号时钟法',
  description: '33个红球排成圆形钟面，热号走3格，冷号逆5格',
  apply(history: number[][], range: number, type: 'ssq' | 'dlt') {
    if (type !== 'ssq' || history.length < 5) {
      return { name: '奖号时钟法', description: '需要至少5期双色球历史数据', output: [] }
    }
    const recentDraws = history.slice(0, 5)
    const freq: Record<number, number> = {}
    for (let n = 1; n <= 33; n++) freq[n] = 0
    for (const draw of recentDraws) {
      for (const n of getMainNums(draw, type)) freq[n]++
    }
    const mainNums = getMainNums(history[0], type)
    const candidates = new Set<number>()
    for (const n of mainNums) {
      if (freq[n] >= 2) {
        const next3 = ((n - 1 + 3) % 33) + 1
        candidates.add(next3)
      } else {
        const prev5 = ((n - 1 - 5 + 33) % 33) + 1
        candidates.add(prev5)
      }
    }
    const hotNums = Object.entries(freq).filter(([_, v]) => v >= 2).map(([k]) => parseInt(k))
    for (const n of hotNums) {
      const next3 = ((n - 1 + 3) % 33) + 1
      if (!candidates.has(next3)) candidates.add(next3)
    }
    const result = [...candidates].sort((a, b) => a - b)
    return {
      name: '奖号时钟法',
      description: `3进5退法选出${result.length}个方向号码`,
      output: result,
    }
  },
}
