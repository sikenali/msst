import { ref, computed } from 'vue'

const WUXING_ROWS = [
  { name: '木', color: '#10B981', numbers: [1, 2, 3, 4, 5, 6, 7] },
  { name: '火', color: '#EF4444', numbers: [8, 9, 10, 11, 12, 13, 14] },
  { name: '土', color: '#8B5CF6', numbers: [15, 16, 17, 18, 19, 20, 21] },
  { name: '金', color: '#F59E0B', numbers: [22, 23, 24, 25, 26, 27, 28] },
  { name: '水', color: '#3B82F6', numbers: [29, 30, 31, 32, 33] },
]

const WUXING_ROWS_DLT = [
  { name: '木', color: '#10B981', numbers: [1, 2, 3, 4, 5, 6, 7] },
  { name: '火', color: '#EF4444', numbers: [8, 9, 10, 11, 12, 13, 14] },
  { name: '土', color: '#8B5CF6', numbers: [15, 16, 17, 18, 19, 20, 21] },
  { name: '金', color: '#F59E0B', numbers: [22, 23, 24, 25, 26, 27, 28] },
  { name: '水', color: '#3B82F6', numbers: [29, 30, 31, 32, 33, 34, 35] },
]

const currentType = ref<'ssq' | 'dlt'>('ssq')

export function setWuxingType(type: 'ssq' | 'dlt') {
  currentType.value = type
}

export const brokenRowEnabled = ref(false)
export const brokenColumnEnabled = ref(false)

export function useWuxingQilie() {
  const rows = computed(() => currentType.value === 'ssq' ? WUXING_ROWS : WUXING_ROWS_DLT)

  const isAllWuxingEnabled = computed(() => brokenRowEnabled.value || brokenColumnEnabled.value)

  function analyzeAndKill(historyData: number[][], range: number): number[] {
    const killed = new Set<number>()
    const currentRows = rows.value

    if (brokenRowEnabled.value) {
      const rowHitCounts: number[] = currentRows.map(row => {
        let count = 0
        for (const draw of historyData.slice(0, 10)) {
          for (const n of draw.slice(0, range === 35 ? 5 : 6)) {
            if (row.numbers.includes(n)) {
              count++
              break
            }
          }
        }
        return count
      })

      const rowEmptyRuns: number[] = currentRows.map(row => {
        let run = 0
        for (let i = historyData.length - 1; i >= 0; i--) {
          const draw = historyData[i]
          const hasHit = draw.slice(0, range === 35 ? 5 : 6).some(n => row.numbers.includes(n))
          if (!hasHit) {
            run++
          } else {
            break
          }
        }
        return run
      })

      for (let i = 0; i < currentRows.length; i++) {
        if (rowEmptyRuns[i] >= 2) {
          currentRows[i].numbers.forEach(n => {
            if (n <= range) killed.add(n)
          })
        } else if (rowHitCounts[i] >= 5) {
          currentRows[i].numbers.forEach(n => {
            if (n <= range) killed.add(n)
          })
        } else if (rowHitCounts[i] <= 2) {
          currentRows[i].numbers.forEach(n => {
            if (n <= range) killed.add(n)
          })
        }
      }
    }

    if (brokenColumnEnabled.value) {
      const maxCols = 7
      const colHitCounts = new Array(maxCols).fill(0)
      const colEmptyRuns = new Array(maxCols).fill(0)

      for (const draw of historyData.slice(0, 10)) {
        for (const n of draw.slice(0, range === 35 ? 5 : 6)) {
          for (const row of currentRows) {
            const idx = row.numbers.indexOf(n)
            if (idx !== -1) {
              colHitCounts[idx]++
              break
            }
          }
        }
      }

      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        let emptyRun = 0
        for (let i = historyData.length - 1; i >= 0; i--) {
          const draw = historyData[i]
          const hasHit = draw.slice(0, range === 35 ? 5 : 6).some(n => {
            for (const row of currentRows) {
              if (row.numbers[colIdx] === n) return true
            }
            return false
          })
          if (!hasHit) {
            emptyRun++
          } else {
            break
          }
        }
        colEmptyRuns[colIdx] = emptyRun
      }

      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        if (colEmptyRuns[colIdx] >= 2 || colHitCounts[colIdx] <= 1) {
          for (const row of currentRows) {
            const num = row.numbers[colIdx]
            if (num !== undefined && num <= range) {
              killed.add(num)
            }
          }
        }
      }
    }

    if (killed.size === 0) {
      return Array.from({ length: range }, (_, i) => i + 1)
    }
    return Array.from({ length: range }, (_, i) => i + 1).filter(n => !killed.has(n))
  }

  return {
    rows,
    brokenRowEnabled,
    brokenColumnEnabled,
    isAllWuxingEnabled,
    analyzeAndKill,
  }
}
