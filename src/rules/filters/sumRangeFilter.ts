import type { FilterRule, LotteryType } from '../types'

export const sumRangeFilter: FilterRule = {
  name: '和值范围过滤',
  description: '双色球和值80-120，大乐透70-130',
  check(nums: number[], type: LotteryType): boolean {
    const sum = nums.reduce((a, b) => a + b, 0)
    const [min, max] = type === 'ssq' ? [80, 120] : [70, 130]
    return sum >= min && sum <= max
  },
}
