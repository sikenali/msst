import type { FilterRule, LotteryType } from '../types'
import { parityFilter } from './parityFilter'
import { sizeFilter } from './sizeFilter'
import { zoneFilter } from './zoneFilter'
import { consecutiveFilter } from './consecutiveFilter'
import { tailFilter } from './tailFilter'
import { sumRangeFilter } from './sumRangeFilter'
import { primeCompositeFilter } from './primeCompositeFilter'

export const allFilters: FilterRule[] = [
  parityFilter,
  sizeFilter,
  zoneFilter,
  consecutiveFilter,
  tailFilter,
  sumRangeFilter,
  primeCompositeFilter,
]

export function validateCombination(
  nums: number[],
  type: LotteryType,
  filterNames?: string[]
): { valid: boolean; failedRules: string[] } {
  const filters = filterNames
    ? allFilters.filter(f => filterNames.includes(f.name))
    : allFilters
  const failedRules: string[] = []
  for (const filter of filters) {
    if (!filter.check(nums, type)) {
      failedRules.push(filter.name)
    }
  }
  return { valid: failedRules.length === 0, failedRules }
}

export function filterCombinations(
  combinations: number[][],
  type: LotteryType,
  filterNames?: string[]
): number[][] {
  return combinations.filter(c => {
    const { valid } = validateCombination(c, type, filterNames)
    return valid
  })
}
