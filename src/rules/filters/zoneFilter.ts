import type { FilterRule, LotteryType } from '../types'

const SSQ_ZONES: [number, number][] = [[1, 11], [12, 22], [23, 33]]
const DLT_ZONES: [number, number][] = [[1, 12], [13, 24], [25, 35]]

export const zoneFilter: FilterRule = {
  name: '区间过滤',
  description: '三区比应为2:2:2, 1:2:3等均衡分布',
  check(nums: number[], type: LotteryType): boolean {
    const zones = type === 'ssq' ? SSQ_ZONES : DLT_ZONES
    const counts = zones.map(([s, e]) => nums.filter(n => n >= s && n <= e).length)
    const maxCount = Math.max(...counts)
    const minCount = Math.min(...counts)
    if (maxCount >= 5) return false
    if (minCount === 0 && maxCount >= 4) return false
    return true
  },
}
