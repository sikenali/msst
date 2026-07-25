import type { FilterRule, LotteryType } from '../types'

export const sizeFilter: FilterRule = {
  name: '大小过滤',
  description: '保留3:3,2:4,4:2，排除全大全小',
  check(nums: number[], type: LotteryType): boolean {
    const mid = type === 'ssq' ? 17 : 18
    const smalls = nums.filter(n => n < mid).length
    const bigs = nums.length - smalls
    if (smalls === 0 || bigs === 0) return false
    if (smalls === 1 || bigs === 1) return false
    if (smalls === 5 || bigs === 5) return false
    return true
  },
}
