import type { FilterRule, LotteryType } from '../types'

export const consecutiveFilter: FilterRule = {
  name: '连号过滤',
  description: '最多1组二连号，排除三连号及以上',
  check(nums: number[], type: LotteryType): boolean {
    const sorted = [...nums].sort((a, b) => a - b)
    let consecutiveGroups = 0
    let currentGroupLen = 1
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        currentGroupLen++
      } else {
        if (currentGroupLen >= 3) return false
        if (currentGroupLen >= 2) consecutiveGroups++
        currentGroupLen = 1
      }
    }
    if (currentGroupLen >= 3) return false
    if (currentGroupLen >= 2) consecutiveGroups++
    return consecutiveGroups <= 1
  },
}
