import type { KillRule, LotteryType } from '../types'
import { getMainNums, SSQ_ZONE_3, SSQ_ZONE_4 } from '../base'

export const breakZoneKill: KillRule = {
  name: '断区杀号',
  description: '上期某区无号（断区），下期大概率延续断区，杀掉该区所有号',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length < 2) return killed
    const zones = type === 'dlt'
      ? [[1, 12], [13, 24], [25, 35]]
      : SSQ_ZONE_4
    for (const [start, end] of zones) {
      let breakCount = 0
      for (let i = 0; i < Math.min(2, history.length); i++) {
        const mainNums = getMainNums(history[i], type)
        const hasNum = mainNums.some(n => n >= start && n <= end)
        if (!hasNum) breakCount++
      }
      if (breakCount >= 1) {
        for (let n = start; n <= end; n++) killed.add(n)
      }
    }
    return killed
  },
}

export const zoneOmissionKill: KillRule = {
  name: '区间遗漏杀号',
  description: '连续2期无号区间，杀掉该区间遗漏最久的2个号码',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (history.length < 2) return killed
    const zones = type === 'dlt'
      ? [[1, 12], [13, 24], [25, 35]]
      : SSQ_ZONE_3
    for (const [start, end] of zones) {
      let breakCount = 0
      for (let i = 0; i < 2; i++) {
        const mainNums = getMainNums(history[i], type)
        if (!mainNums.some(n => n >= start && n <= end)) breakCount++
      }
      if (breakCount === 2) {
        const zoneNums: number[] = []
        for (let n = start; n <= end; n++) zoneNums.push(n)
        const omission: Record<number, number> = {}
        for (const n of zoneNums) omission[n] = 0
        for (let i = 0; i < history.length; i++) {
          const mainNums = getMainNums(history[i], type)
          for (const n of zoneNums) {
            if (!mainNums.includes(n)) omission[n]++
            else omission[n] = 0
          }
        }
        const sorted = Object.entries(omission).sort((a, b) => b[1] - a[1])
        if (sorted.length >= 2) {
          killed.add(parseInt(sorted[0][0]))
          killed.add(parseInt(sorted[1][0]))
        }
      }
    }
    return killed
  },
}

export const emptyRowColKill: KillRule = {
  name: '空行空列整区杀号',
  description: '6×6矩阵中连续2期无号的整行/整列批量绝杀',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    const killed = new Set<number>()
    if (type !== 'ssq' || history.length < 2) return killed
    const size = 6
    for (let row = 0; row < size; row++) {
      let empty = true
      for (let i = 0; i < Math.min(2, history.length); i++) {
        const mainNums = getMainNums(history[i], type)
        const rowNums = Array.from({ length: size }, (_, j) => row * size + j + 1).filter(n => n <= 33)
        if (mainNums.some(n => rowNums.includes(n))) { empty = false; break }
      }
      if (empty) {
        for (let j = 0; j < size; j++) {
          const n = row * size + j + 1
          if (n <= 33) killed.add(n)
        }
      }
    }
    for (let col = 0; col < size; col++) {
      let empty = true
      for (let i = 0; i < Math.min(2, history.length); i++) {
        const mainNums = getMainNums(history[i], type)
        const colNums = Array.from({ length: size }, (_, j) => j * size + col + 1).filter(n => n <= 33)
        if (mainNums.some(n => colNums.includes(n))) { empty = false; break }
      }
      if (empty) {
        for (let j = 0; j < size; j++) {
          const n = j * size + col + 1
          if (n <= 33) killed.add(n)
        }
      }
    }
    return killed
  },
}
