import type { FilterRule, LotteryType } from '../types'
import { isPrime } from '../base'

export const primeCompositeFilter: FilterRule = {
  name: '质合比过滤',
  description: '保留2:4,3:3,4:2，排除全质全合',
  check(nums: number[], type: LotteryType): boolean {
    const primes = nums.filter(n => isPrime(n)).length
    const composites = nums.length - primes
    if (primes === 0 || composites === 0) return false
    if (primes === 1 || composites === 1) return false
    if (primes === 5 || composites === 5) return false
    return true
  },
}
