import type { KillRule, LotteryType } from '../types'
import { getMainNums } from '../base'

export const headKill: KillRule = {
  name: '龙头杀号',
  description: '杀掉上期最小红球（若>16则减16）',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = getMainNums(history[0], type)
    const sorted = [...lastDraw].sort((a, b) => a - b)
    const head = sorted[0]
    killed.add(head)
    if (head > 16) killed.add(head - 16)
    return killed
  },
}

export const tailKill: KillRule = {
  name: '凤尾杀号',
  description: '杀掉上期最大红球',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = getMainNums(history[0], type)
    const sorted = [...lastDraw].sort((a, b) => a - b)
    killed.add(sorted[sorted.length - 1])
    return killed
  },
}

export const headPlusBlueKill: KillRule = {
  name: '龙头+蓝球杀号',
  description: '上期龙头+蓝球，>16则减16',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = history[0]
    const mainNums = getMainNums(history[0], type)
    const sorted = [...mainNums].sort((a, b) => a - b)
    const head = sorted[0]
    const blue = type === 'dlt' ? lastDraw[lastDraw.length - 1] : lastDraw[lastDraw.length - 1]
    let val = head + blue
    while (val > 16) val -= 16
    if (val >= 1 && val <= range) killed.add(val)
    return killed
  },
}

export const headMinusBlueKill: KillRule = {
  name: '龙头与蓝球差值杀号',
  description: '|龙头-蓝球|，>16则减16，为0时杀01或16',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = history[0]
    const mainNums = getMainNums(history[0], type)
    const sorted = [...mainNums].sort((a, b) => a - b)
    const head = sorted[0]
    const blue = type === 'dlt' ? lastDraw[lastDraw.length - 1] : lastDraw[lastDraw.length - 1]
    let val = Math.abs(head - blue)
    if (val === 0) {
      killed.add(1)
      killed.add(16)
    } else {
      while (val > 16) val -= 16
      if (val >= 1 && val <= range) killed.add(val)
    }
    return killed
  },
}

export const headTailDiffTailKill: KillRule = {
  name: '首尾差值取尾杀号',
  description: '凤尾-龙头=跨度，取跨度尾数对应所有号码',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const mainNums = getMainNums(history[0], type)
    const sorted = [...mainNums].sort((a, b) => a - b)
    const span = sorted[sorted.length - 1] - sorted[0]
    const tail = span % 10
    for (let n = 1; n <= range; n++) {
      if (n % 10 === tail) killed.add(n)
    }
    return killed
  },
}
