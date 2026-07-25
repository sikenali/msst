import type { KillRule, LotteryType } from '../types'
import { getMainNums } from '../base'

export const consecutiveNeighborKill: KillRule = {
  name: '连号邻号排除',
  description: '上期有连号则连号左右邻号大概率不出',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const mainNums = getMainNums(history[0], type)
    const sorted = [...mainNums].sort((a, b) => a - b)
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        if (sorted[i - 1] - 1 >= 1) killed.add(sorted[i - 1] - 1)
        if (sorted[i] + 1 <= range) killed.add(sorted[i] + 1)
      }
    }
    return killed
  },
}

export const overHotKill: KillRule = {
  name: '重号过热绝杀',
  description: '连续3期及以上高频重号直接绝杀',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length < 3) return killed
    const allMainNums = history.slice(0, 3).map(d => new Set(getMainNums(d, type)))
    const intersection = new Set<number>()
    for (const n of allMainNums[0]) {
      if (allMainNums[1].has(n) && allMainNums[2].has(n)) {
        killed.add(n)
      }
    }
    return killed
  },
}

export const deepColdKill: KillRule = {
  name: '极冷深号绝杀',
  description: '遗漏超过22期的号码直接淘汰',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length < 22) return killed
    for (let n = 1; n <= range; n++) {
      let found = false
      for (let i = 0; i < 22; i++) {
        const mainNums = getMainNums(history[i], type)
        if (mainNums.includes(n)) { found = true; break }
      }
      if (!found) killed.add(n)
    }
    return killed
  },
}

export const issueTailKill: KillRule = {
  name: '期号尾衍生杀码',
  description: '当期期号个位数±1作为杀码',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    const now = new Date()
    const issueTail = now.getDate() % 10
    const vals = [issueTail, (issueTail + 1) % 10, (issueTail - 1 + 10) % 10]
    for (const v of vals) {
      if (v >= 1 && v <= range) killed.add(v)
    }
    return killed
  },
}

export const obliqueKill: KillRule = {
  name: '斜连杀号',
  description: '连续3期以±1移动形成斜三连，延长线下一号杀',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length < 3) return killed
    const draws = history.slice(0, 3).map(d => getMainNums(d, type))
    for (const n1 of draws[0]) {
      for (const n2 of draws[1]) {
        if (n2 !== n1 + 1 && n2 !== n1 - 1) continue
        for (const n3 of draws[2]) {
          if (n3 !== n2 + 1 && n3 !== n2 - 1) continue
          const dir = n3 - n2
          const next = n3 + dir
          if (next >= 1 && next <= range) killed.add(next)
        }
      }
    }
    return killed
  },
}

export const redBlueLinkKill: KillRule = {
  name: '红蓝联动绝对值杀号',
  description: '每个红球-蓝球取绝对值，结果作为杀码',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length === 0) return killed
    const lastDraw = history[0]
    const mainNums = getMainNums(lastDraw, type)
    const blue = lastDraw[lastDraw.length - 1]
    for (const n of mainNums) {
      let val = Math.abs(n - blue)
      while (val > 33) val -= 33
      if (val >= 1 && val <= range) killed.add(val)
    }
    return killed
  },
}
