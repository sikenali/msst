import type { KillRule, LotteryType } from '../types'
import { getMainNums } from '../base'

export const subtractionKill: KillRule = {
  name: '减法/差值杀号',
  description: '上期红球两两相减取差值，差值集合作为杀号',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = getMainNums(history[0], type)
    const sorted = [...lastDraw].sort((a, b) => a - b)
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const diff = sorted[j] - sorted[i]
        if (diff >= 1 && diff <= range) killed.add(diff)
      }
    }
    const span = sorted[sorted.length - 1] - sorted[0]
    if (span >= 1 && span <= range) killed.add(span)
    if (span - 1 >= 1) killed.add(span - 1)
    if (span + 1 <= range) killed.add(span + 1)
    return killed
  },
}

export const subtractionKillV2: KillRule = {
  name: '红一红二减法杀号',
  description: '上期第2个红球减第1个红球，差值杀号',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = getMainNums(history[0], type)
    const sorted = [...lastDraw].sort((a, b) => a - b)
    const diff = sorted[1] - sorted[0]
    if (diff >= 1 && diff <= range) killed.add(diff)
    return killed
  },
}

export const subtractionKillV3: KillRule = {
  name: '五六位差值杀尾数',
  description: '上期第6红-第5红，差值个位尾数对应整列杀号',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = getMainNums(history[0], type)
    const sorted = [...lastDraw].sort((a, b) => a - b)
    const diff = sorted[sorted.length - 1] - sorted[sorted.length - 2]
    const tail = diff % 10
    for (let n = 1; n <= range; n++) {
      if (n % 10 === tail) killed.add(n)
    }
    return killed
  },
}
