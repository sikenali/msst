import type { SelectRule } from '../types'
import { SSQ_UNIVERSAL_13, getMainNums } from '../base'

export const universal13Select: SelectRule = {
  name: '万能13码参考',
  description: '十年高频13码中选2-3个，搭配温号+冷号',
  bagua: 'xun',
  appliesTo: ['ssq'],
  apply(history: number[][], range: number, type: 'ssq' | 'dlt') {
    if (type !== 'ssq' || history.length < 10) {
      return { name: '万能13码参考', description: '需要至少10期双色球历史数据', output: [] }
    }
    const recentDraws = history.slice(0, 10)
    const freq: Record<number, number> = {}
    for (let n = 1; n <= 33; n++) freq[n] = 0
    for (const draw of recentDraws) {
      for (const n of getMainNums(draw, type)) freq[n]++
    }
    const hotNums: number[] = []
    const warmNums: number[] = []
    const coldNums: number[] = []
    for (let n = 1; n <= 33; n++) {
      if (freq[n] >= 3) hotNums.push(n)
      else if (freq[n] >= 1) warmNums.push(n)
      else coldNums.push(n)
    }
    const universalPool = [...SSQ_UNIVERSAL_13]
    const fromUniversal = universalPool.sort(() => Math.random() - 0.5).slice(0, 2)
    const fromWarm = warmNums.filter(n => !SSQ_UNIVERSAL_13.has(n)).sort(() => Math.random() - 0.5)
    const fromCold = coldNums.filter(n => SSQ_UNIVERSAL_13.has(n)).sort(() => Math.random() - 0.5)
    const result = [...fromUniversal, ...fromWarm.slice(0, 3), ...fromCold.slice(0, 1)]
    const finalResult = [...new Set(result)].sort((a, b) => a - b)
    return {
      name: '万能13码参考',
      description: `从万能13码选2个+温号3个+冷号1个 = ${finalResult.length}个备选`,
      output: finalResult,
    }
  },
}
