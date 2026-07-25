import type { FilterRule, LotteryType } from '../types'
import { SSQ_ODD, DLT_FRONT_ODD } from '../base'

export const parityFilter: FilterRule = {
  name: '奇偶过滤',
  description: '保留3:3, 2:4, 4:2，排除0:6,6:0,1:5,5:1',
  check(nums: number[], type: LotteryType): boolean {
    const odds = type === 'ssq'
      ? nums.filter(n => SSQ_ODD.has(n)).length
      : nums.filter(n => DLT_FRONT_ODD.has(n)).length
    const evens = nums.length - odds
    if (odds === 0 || evens === 0) return false
    if (odds === 1 || evens === 1) return false
    if (odds === 5 || evens === 5) return false
    return true
  },
}
