import { ref, computed } from 'vue'
import { FIVE_ROWS, SEVEN_COLS } from '@/rules/base'

const ROW_NAMES = ['木', '火', '土', '金', '水']
const ROW_COLORS = ['#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#3B82F6']

export const brokenRowEnabled = ref(false)
export const brokenColumnEnabled = ref(false)

export function setWuxingType(type: 'ssq' | 'dlt') {}

export function useWuxingQilie() {
  const rows = computed(() =>
    FIVE_ROWS.map((nums, i) => ({
      name: ROW_NAMES[i],
      color: ROW_COLORS[i],
      numbers: nums,
      col: SEVEN_COLS.map(col => col[i]),
    }))
  )

  const columns = computed(() =>
    SEVEN_COLS.map((nums, i) => ({
      name: `列${i + 1}`,
      numbers: nums,
    }))
  )

  function analyzeAndKill(historyData: number[][], range: number): number[] {
    const killed = new Set<number>()
    if (historyData.length < 3) {
      return Array.from({ length: range }, (_, i) => i + 1)
    }
    const recent = historyData.slice(0, 3)

    if (brokenRowEnabled.value) {
      const rowCounts = FIVE_ROWS.map(row =>
        recent.reduce((sum, d) => sum + (d.some(n => row.includes(n)) ? 1 : 0), 0)
      )
      rowCounts.forEach((c, i) => {
        if (c <= 1) FIVE_ROWS[i].forEach(n => { if (n <= range) killed.add(n) })
      })
    }

    if (brokenColumnEnabled.value) {
      const colCounts = SEVEN_COLS.map(col =>
        recent.reduce((sum, d) => sum + (d.some(n => col.includes(n)) ? 1 : 0), 0)
      )
      colCounts.forEach((c, i) => {
        if (c <= 1) SEVEN_COLS[i].forEach(n => { if (n <= range) killed.add(n) })
      })
    }

    if (killed.size === 0) {
      return Array.from({ length: range }, (_, i) => i + 1)
    }
    return Array.from({ length: range }, (_, i) => i + 1).filter(n => !killed.has(n))
  }

  return { rows, columns, brokenRowEnabled, brokenColumnEnabled, analyzeAndKill }
}
