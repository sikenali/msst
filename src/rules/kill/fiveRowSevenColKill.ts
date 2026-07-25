import type { KillRule } from '../types'
import { FIVE_ROWS, SEVEN_COLS } from '../base'

export const fiveRowSevenColKill: KillRule = {
  name: '五行七列杀号',
  description: '5行7列矩阵，断行+断列交叉杀号',
  appliesTo: ['dlt'],
  apply(history, range, type) {
    const killed = new Set<number>()
    if (history.length < 3 || type !== 'dlt') return killed
    const recent = history.slice(0, 3)
    const rowCounts = new Array(5).fill(0)
    for (const d of recent) { for (const n of d) { for (let r = 0; r < 5; r++) { if (FIVE_ROWS[r].includes(n)) rowCounts[r]++ } } }
    const coldRows = rowCounts.map((c, i) => ({ c, i })).filter(x => x.c <= 1).map(x => x.i)
    for (const r of coldRows) FIVE_ROWS[r].forEach(n => killed.add(n))
    const colCounts = new Array(7).fill(0)
    for (const d of recent) { for (const n of d) { for (let c = 0; c < 7; c++) { if (SEVEN_COLS[c].includes(n)) colCounts[c]++ } } }
    const coldCols = colCounts.map((c, i) => ({ c, i })).filter(x => x.c <= 1).map(x => x.i)
    for (const c of coldCols) SEVEN_COLS[c].forEach(n => killed.add(n))
    return killed
  },
}
