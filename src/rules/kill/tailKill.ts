import type { KillRule, LotteryType } from '../types'
import { getMainNums, tailFreq } from '../base'

export const hotTailKill: KillRule = {
  name: '过热尾数杀号',
  description: '近5期某尾数出现≥4次，该尾数全部号码杀掉',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length < 5) return killed
    const recentDraws = history.slice(0, 5)
    const allNums: number[] = []
    for (const draw of recentDraws) {
      allNums.push(...getMainNums(draw, type))
    }
    const freq = tailFreq(allNums, allNums.length)
    const hotTails: number[] = []
    for (let t = 0; t <= 9; t++) {
      if (freq[t] >= 4) hotTails.push(t)
    }
    for (let n = 1; n <= range; n++) {
      if (hotTails.includes(n % 10)) killed.add(n)
    }
    return killed
  },
}

export const sumTailKill: KillRule = {
  name: '和值尾数杀号',
  description: '上期红球和值个位尾数对应所有号码杀号',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const mainNums = getMainNums(history[0], type)
    const sum = mainNums.reduce((a, b) => a + b, 0)
    const tail = sum % 10
    for (let n = 1; n <= range; n++) {
      if (n % 10 === tail) killed.add(n)
    }
    return killed
  },
}

export const sumHeadTailKill: KillRule = {
  name: '和值头尾相加杀号',
  description: '和值的首位数字+末尾数字，结果为杀码',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const mainNums = getMainNums(history[0], type)
    const sum = mainNums.reduce((a, b) => a + b, 0)
    const s = String(sum)
    const first = parseInt(s[0], 10)
    const last = parseInt(s[s.length - 1], 10)
    const val = first + last
    if (val >= 1 && val <= range) killed.add(val)
    return killed
  },
}
