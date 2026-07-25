import type { BoldRule } from '../types'
import { getMainNums } from '../base'

export const spanTailBold: BoldRule = {
  name: '红相减跨度尾数5码胆组',
  description: '6红两两相减得15差值→高频跨度尾→左右各2位→5码胆组',
  apply(history: number[][]): number[] {
    if (history.length === 0) return []
    const lastDraw = getMainNums(history[0], 'ssq')
    const sorted = [...lastDraw].sort((a, b) => a - b)

    // 两两相减15组差值
    const diffs: number[] = []
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        diffs.push(sorted[j] - sorted[i])
      }
    }

    // 尾数频次统计
    const tailFreq = new Map<number, number>()
    for (let t = 0; t <= 9; t++) tailFreq.set(t, 0)
    for (const d of diffs) tailFreq.set(Math.abs(d) % 10, (tailFreq.get(Math.abs(d) % 10) || 0) + 1)

    // 高频跨度尾
    let spanTail = 0; let maxFreq = 0
    for (let t = 0; t <= 9; t++) {
      const f = tailFreq.get(t) || 0
      if (f > maxFreq) { maxFreq = f; spanTail = t }
    }

    // 左右各2位, 凑5个尾数
    const boldTails = [spanTail]
    for (let i = 1; i <= 2; i++) boldTails.push((spanTail + i) % 10)
    for (let i = 1; i <= 2; i++) {
      const t = (spanTail - i + 10) % 10
      if (!boldTails.includes(t)) boldTails.push(t)
    }

    // 尾数->号码
    const TAIL_NUMS: Record<number, number[]> = {
      0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
      3: [3, 13, 23, 33], 4: [4, 14, 24], 5: [5, 15, 25],
      6: [6, 16, 26], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29],
    }

    const result: number[] = []
    for (const t of boldTails) {
      const nums = (TAIL_NUMS[t] || []).filter(n => n <= 35)
      const mid = nums.length <= 2 ? nums
        : nums.slice(Math.floor(nums.length / 2) - 1, Math.floor(nums.length / 2) + 1)
      for (const n of mid) { if (!result.includes(n)) result.push(n) }
    }

    return result.slice(0, 5)
  },
}
