import type { SelectRule } from '../types'
import { SINGULAR_NUMBERS, STABLE_NUMBERS, getMainNums } from '../base'

export const singularBoldSelect: SelectRule = {
  name: '奇异数定胆选号',
  description: '十位+个位=奇为奇异数，主流2-3个',
  bagua: 'taiji',
  apply(history, range, type) {
    if (history.length < 5) {
      return { name: '奇异数定胆选号', description: '需要历史数据', output: [] }
    }
    const freq = new Map<number, number>()
    for (const n of SINGULAR_NUMBERS) freq.set(n, 0)
    for (const d of history.slice(0, 5)) {
      for (const n of d) { if (freq.has(n)) freq.set(n, (freq.get(n) || 0) + 1) }
    }
    const warm = [...SINGULAR_NUMBERS].filter(n => (freq.get(n) || 0) >= 1 && (freq.get(n) || 0) <= 2)
    const hot = [...SINGULAR_NUMBERS].filter(n => (freq.get(n) || 0) >= 3)
    const bold = [...warm.slice(0, 2), ...hot.slice(0, 1)].slice(0, 3)
    const stableNeeded = 6 - bold.length
    const stableFreq = new Map<number, number>()
    for (const n of STABLE_NUMBERS) stableFreq.set(n, 0)
    for (const d of history.slice(0, 5)) { for (const n of d) { if (stableFreq.has(n)) stableFreq.set(n, (stableFreq.get(n) || 0) + 1) } }
    const stableSorted = [...STABLE_NUMBERS].sort((a, b) => (stableFreq.get(b) || 0) - (stableFreq.get(a) || 0))
    const result = [...bold, ...stableSorted.slice(0, stableNeeded)]
    return {
      name: '奇异数定胆选号',
      description: `预测奇异数${bold.length}个+平稳数${stableNeeded}个`,
      output: result.slice(0, 6),
    }
  },
}
