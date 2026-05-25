import { ref, computed } from 'vue'

const currentType = ref<'ssq' | 'dlt'>('ssq')

export function setKillRulesType(type: 'ssq' | 'dlt') {
  currentType.value = type
}

export const ssqKillRules = ref<Record<string, boolean>>({
  'cold5': false,
  'last3': false,
  'consecutive': false,
  'zone2': false,
  'hotTail4': false,
})

export const dltKillRules = ref<Record<string, boolean>>({
  'cold5': false,
  'last3': false,
  'consecutive': false,
  'zone2': false,
  'hotTail4': false,
})

function getKillRules() {
  return currentType.value === 'ssq' ? ssqKillRules : dltKillRules
}

export function setKillRule(key: string, enabled: boolean) {
  getKillRules().value[key] = enabled
}

export function setAllKillRules(enabled: boolean) {
  const rules = getKillRules().value
  for (const key of Object.keys(rules)) {
    rules[key] = enabled
  }
}

export function useKillRules() {
  const userKillRules = computed(() => getKillRules().value)

  const isAllKillEnabled = computed(() => {
    return Object.values(userKillRules.value).every(v => v)
  })

  const killEnabledCount = computed(() => {
    return Object.values(userKillRules.value).filter(v => v).length
  })

  const killTotalCount = computed(() => {
    return Object.keys(userKillRules.value).length
  })

  function toggleAllKill() {
    setAllKillRules(!isAllKillEnabled.value)
  }

  function applyKillRules(pool: number[], historyData: number[][], range: number): number[] {
    const rules = getKillRules().value
    const killed = new Set<number>()
    
    console.log('applyKillRules called, rules:', rules)
    console.log('applyKillRules called, historyData length:', historyData.length)

    if (rules['cold5']) {
      const coldCounts: Record<number, number> = {}
      for (let n = 1; n <= range; n++) coldCounts[n] = 0
      let allNumbers = new Set<number>()
      for (const draw of historyData) {
        const mainNums = currentType.value === 'dlt' ? draw.slice(0, 5) : draw.slice(0, 6)
        for (const n of mainNums) {
          allNumbers.add(n)
        }
      }
      for (let n = 1; n <= range; n++) {
        if (!allNumbers.has(n)) {
          coldCounts[n] = historyData.length + 1
        } else {
          for (let i = 0; i < historyData.length; i++) {
            const mainNums = currentType.value === 'dlt' ? historyData[i].slice(0, 5) : historyData[i].slice(0, 6)
            if (mainNums.includes(n)) {
              coldCounts[n] = i
              break
            }
          }
        }
      }
      const coldest = Object.entries(coldCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      coldest.forEach(([n]) => killed.add(parseInt(n)))
    }

    if (rules['last3']) {
      if (historyData.length > 0) {
        const lastDraw = historyData[0]
        const mainNums = currentType.value === 'dlt' ? lastDraw.slice(0, 5) : lastDraw.slice(0, 6)
        const sorted = [...mainNums].sort((a, b) => a - b)
        const toRemove = sorted.slice(-3)
        toRemove.forEach(n => killed.add(n))
      }
    }

    if (rules['consecutive']) {
      if (historyData.length > 0) {
        const lastDraw = historyData[0]
        const mainNums = currentType.value === 'dlt' ? lastDraw.slice(0, 5) : lastDraw.slice(0, 6)
        const sorted = [...mainNums].sort((a, b) => a - b)
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] === sorted[i - 1] + 1) {
            killed.add(sorted[i])
          }
        }
      }
    }

    if (rules['zone2']) {
      const zones = [[1, 12], [13, 24], [25, range]]
      const zoneCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
      for (const n of pool) {
        zones.forEach(([start, end], idx) => {
          if (n >= start && n <= end) zoneCounts[idx]++
        })
      }
      zones.forEach(([start, end], idx) => {
        if (zoneCounts[idx] > 2) {
          const zoneNums = pool.filter(n => n >= start && n <= end)
          const sorted = [...zoneNums].sort(() => Math.random() - 0.5)
          const toKill = sorted.slice(2)
          toKill.forEach(n => killed.add(n))
        }
      })
    }

    if (rules['hotTail4']) {
      const tailFreq: Record<number, number> = {}
      for (let i = 0; i <= 9; i++) tailFreq[i] = 0
      for (const draw of historyData.slice(0, 5)) {
        for (const n of draw) {
          tailFreq[n % 10] = (tailFreq[n % 10] || 0) + 1
        }
      }
      const hottestTails = Object.entries(tailFreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => parseInt(t))
      for (let n = 1; n <= range; n++) {
        if (hottestTails.includes(n % 10)) killed.add(n)
      }
    }

    if (killed.size === 0) return pool
    return pool.filter(n => !killed.has(n))
  }

  return {
    userKillRules,
    isAllKillEnabled,
    killEnabledCount,
    killTotalCount,
    setKillRule,
    setAllKillRules,
    toggleAllKill,
    applyKillRules,
  }
}
