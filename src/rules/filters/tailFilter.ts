import type { FilterRule, LotteryType } from '../types'

export const tailFilter: FilterRule = {
  name: '尾数过滤',
  description: '单期保留4-5种尾数，最多1组同尾',
  check(nums: number[], type: LotteryType): boolean {
    const tails = nums.map(n => n % 10)
    const uniqueTails = new Set(tails)
    if (uniqueTails.size < 3) return false
    const freq: Record<number, number> = {}
    for (const t of tails) freq[t] = (freq[t] || 0) + 1
    const sameTailGroups = Object.values(freq).filter(c => c >= 3).length
    if (sameTailGroups > 0) return false
    const doubleTailGroups = Object.values(freq).filter(c => c === 2).length
    return doubleTailGroups <= 1
  },
}
