import type { SelectRule } from '../types'
import { DLT_CROSS_ROWS, DLT_CROSS_COLS, DLT_BACK_ROWS, getMainNums, isPrime } from '../base'

export const crossMarkSelect: SelectRule = {
  name: '横标纵标法',
  description: '大乐透专用，横标分区冷热+纵标同位平衡',
  bagua: 'li',
  appliesTo: ['dlt'],
  apply(history: number[][], range: number, type: 'ssq' | 'dlt') {
    if (type !== 'dlt' || history.length < 10) {
      return { name: '横标纵标法', description: '需要至少10期大乐透历史数据', output: [] }
    }
    const rowStats = DLT_CROSS_ROWS.map((row, _) => {
      let count = 0
      for (let i = 0; i < Math.min(10, history.length); i++) {
        const mainNums = getMainNums(history[i], type)
        if (mainNums.some(n => row.includes(n))) count++
      }
      return count
    })
    const candidates: number[] = []
    for (let ri = 0; ri < DLT_CROSS_ROWS.length; ri++) {
      const row = DLT_CROSS_ROWS[ri]
      const freq = rowStats[ri]
      let pickCount: number
      if (freq >= 4) pickCount = 2
      else if (freq >= 2) pickCount = 1
      else pickCount = 1
      const shuffled = [...row].sort(() => Math.random() - 0.5)
      candidates.push(...shuffled.slice(0, pickCount))
    }
    const colUsed = new Set<number>()
    const selected: number[] = []
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5)
    for (const n of shuffledCandidates) {
      if (selected.length >= 8) break
      for (let ci = 0; ci < DLT_CROSS_COLS.length; ci++) {
        if (DLT_CROSS_COLS[ci].includes(n) && !colUsed.has(ci)) {
          selected.push(n)
          colUsed.add(ci)
          break
        }
      }
    }
    while (selected.length < 8) {
      const shuffled = [...candidates].sort(() => Math.random() - 0.5)
      for (const n of shuffled) {
        if (!selected.includes(n) && selected.length < 8) selected.push(n)
      }
    }
    selected.sort((a, b) => a - b)
    return { name: '横标纵标法', description: `横标冷热+纵标平衡，选取${selected.length}个前区备选`, output: selected }
  },
}

export const crossMarkBackSelect: SelectRule = {
  name: '后区横标法',
  description: '大乐透后区横标冷热搭配选号',
  bagua: 'li',
  appliesTo: ['dlt'],
  apply(history: number[][], range: number, type: 'ssq' | 'dlt') {
    if (type !== 'dlt' || history.length < 5) {
      return { name: '后区横标法', description: '需要至少5期大乐透历史数据', output: [] }
    }
    const candidates: number[] = []
    for (const row of DLT_BACK_ROWS) {
      let count = 0
      for (let i = 0; i < Math.min(10, history.length); i++) {
        const backNums = history[i].slice(5)
        if (backNums.some(n => row.includes(n))) count++
      }
      if (count >= 3) {
        const shuffled = [...row].sort(() => Math.random() - 0.5)
        candidates.push(shuffled[0])
      } else {
        const shuffled = [...row].sort(() => Math.random() - 0.5)
        candidates.push(...shuffled.slice(0, 1))
      }
    }
    const selected = [...new Set(candidates)].sort(() => Math.random() - 0.5).slice(0, 3)
    return { name: '后区横标法', description: `后区横标冷热搭配，选取${selected.length}个备选`, output: selected }
  },
}
