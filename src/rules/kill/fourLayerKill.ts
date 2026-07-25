import type { KillRule, LotteryType } from '../types'
import { getMainNums } from '../base'

export const fourLayerRedKill: KillRule = {
  name: '四重杀红法',
  description: '重号+冷区+极端和值跨度+冷尾数，四层叠加稳定杀10-16码',
  apply(history: number[][], range: number, type: LotteryType): Set<number> {
    if (history.length === 0) return new Set()
    const lastDraw = getMainNums(history[0], type)
    const combined = new Set<number>()

    // 第一重: 上期重号 (留1个防守)
    for (let i = 1; i < lastDraw.length; i++) combined.add(lastDraw[i])

    // 第二重: 冷门区间剔除
    const recent10 = history.slice(0, 10)
    const zoneSize = Math.ceil(range / 3)
    const zoneCounts = [0, 0, 0]
    for (const d of recent10) {
      for (let z = 0; z < 3; z++) {
        const zStart = z * zoneSize + 1
        const zEnd = Math.min((z + 1) * zoneSize, range)
        zoneCounts[z] += d.filter(n => n >= zStart && n <= zEnd).length
      }
    }
    const minZone = zoneCounts.indexOf(Math.min(...zoneCounts))
    const zStart = minZone * zoneSize + 1
    const zEnd = Math.min((minZone + 1) * zoneSize, range)
    const recent5Set = new Set(history.slice(0, 5).flat())
    for (let n = zStart; n <= zEnd; n++) {
      if (!recent5Set.has(n)) combined.add(n)
    }

    // 第三重: 极端和值与跨度
    const sorted = [...lastDraw].sort((a, b) => a - b)
    const minSum = lastDraw.reduce((s, n) => s + n, 0)
    for (let n = 1; n <= range; n++) {
      if (lastDraw.includes(n)) continue
      if (minSum + n < 65) combined.add(n)
      const newSpan = Math.max(sorted[sorted.length - 1], n) - Math.min(sorted[0], n)
      if (newSpan > 32) combined.add(n)
    }

    // 第四重: 冷尾数
    const tailFreq = new Map<number, number>()
    for (let t = 0; t <= 9; t++) tailFreq.set(t, 0)
    for (const d of recent10) {
      new Set(d.map(n => n % 10)).forEach(t => tailFreq.set(t, (tailFreq.get(t) || 0) + 1))
    }
    for (const [t, f] of tailFreq) {
      if (f <= 3) {
        for (let n = 1; n <= range; n++) { if (n % 10 === t) combined.add(n) }
      }
    }

    return combined
  },
}
