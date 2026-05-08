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
        for (const n of draw) {
          allNumbers.add(n)
        }
      }
      for (let n = 1; n <= range; n++) {
        if (!allNumbers.has(n)) {
          coldCounts[n] = historyData.length + 1
        } else {
          for (let i = 0; i < historyData.length; i++) {
            if (historyData[i].includes(n)) {
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
        const keepCount = Math.max(0, lastDraw.length - 3)
        const toRemove = lastDraw.slice(keepCount)
        toRemove.forEach(n => killed.add(n))
      }
    }

    if (rules['consecutive']) {
      if (historyData.length > 0) {
        const lastDraw = historyData[0].sort((a, b) => a - b)
        for (let i = 1; i < lastDraw.length; i++) {
          if (lastDraw[i] === lastDraw[i - 1] + 1) {
            killed.add(lastDraw[i])
          }
        }
      }
    }

    if (rules['zone2']) {
      const zones = [[1, 12], [13, 24], [25, range]]
      const zoneFreq: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
      for (const draw of historyData.slice(0, 10)) {
        for (const n of draw) {
          zones.forEach(([start, end], idx) => {
            if (n >= start && n <= end) zoneFreq[idx]++
          })
        }
      }
      const avgFreq = Object.values(zoneFreq).reduce((a, b) => a + b, 0) / 3
      zones.forEach(([start, end], idx) => {
        if (zoneFreq[idx] > avgFreq * 1.5) {
          for (let n = start; n <= end; n++) {
            killed.add(n)
          }
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
