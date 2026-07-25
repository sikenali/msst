import type { SelectRule } from '../types'
import { getMainNums, getBackNums } from '../base'

export const redBlueIntegratedSelect: SelectRule = {
  name: '红蓝一体同时定位法',
  description: '红球推算蓝球：和值定大小+跨度定区间+尾数定冷热',
  bagua: 'kun',
  apply(history, range, type) {
    if (history.length < 3) {
      return { name: '红蓝一体同时定位法', description: '需要至少3期历史数据', output: [] }
    }
    const last = getMainNums(history[0], type)
    const lastBack = getBackNums(history[0], type)
    const lastBlue = lastBack[0]
    const sorted = [...last].sort((a, b) => a - b)
    const redSum = last.reduce((s, n) => s + n, 0)
    const span = sorted[sorted.length - 1] - sorted[0]
    let primaryZone: number[]
    const zoneA = [1, 2, 3, 4, 5]
    const zoneB = [6, 7, 8, 9, 10]
    const zoneC = [11, 12, 13, 14, 15, 16]
    if (sorted[0] <= 4) primaryZone = zoneC
    else if (sorted[5] >= 30) primaryZone = zoneA
    else primaryZone = zoneB
    const sizeDir = redSum < 95 ? 'large' : redSum > 110 ? 'small' : 'mid'
    const candidates = primaryZone.filter(n =>
      (sizeDir === 'mid' || (sizeDir === 'small' && n <= 8) || (sizeDir === 'large' && n >= 9)) &&
      n >= lastBlue - 5 && n <= lastBlue + 5
    )
    return {
      name: '红蓝一体同时定位法',
      description: `红和${redSum}, 跨度${span}, 主区${primaryZone[0]}-${primaryZone[primaryZone.length-1]}`,
      output: [...new Set(candidates)].slice(0, 3),
    }
  },
}
