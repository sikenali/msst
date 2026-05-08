# 杀号规则 & 五行七列 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "杀号规则" modal (history data + 5 kill rules) to left panel and "五行七列" modal (5×7 chart + kill rules) to right panel, with generation integration for SSQ and DLT.

**Architecture:** 3 new composables (useKillRules, useWuxingQilie, useHistoryData) + 2 new modal components + modifications to existing FloatingLeftPanel, FloatingRightPanel, HomePage, and useLottery.

**Tech Stack:** Vue 3, TypeScript, Vite, Vitest

---

### Task 1: Create useKillRules composable

**Files:**
- Create: `src/composables/useKillRules.ts`

- [ ] **Step 1: Write the composable file**

```typescript
import { ref, computed } from 'vue'

const currentType = ref<'ssq' | 'dlt'>('ssq')

export function setKillRulesType(type: 'ssq' | 'dlt') {
  currentType.value = type
}

// SSQ kill rules state
export const ssqKillRules = ref<Record<string, boolean>>({
  'tail': false,      // 尾数杀号
  'remainder': false, // 除三余数杀号
  'zone': false,      // 断区杀号
  'sametail': false,  // 同尾杀号
  'hotcold': false,   // 冷热号杀号
})

// DLT kill rules state
export const dltKillRules = ref<Record<string, boolean>>({
  'tail': false,
  'remainder': false,
  'zone': false,
  'sametail': false,
  'hotcold': false,
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

  /**
   * Apply kill rules to filter a red ball pool.
   * @param pool - Full pool of candidate red ball numbers
   * @param historyData - Recent draw history for analysis
   * @param range - Max number (33 for SSQ, 35 for DLT)
   * @returns Filtered set of numbers that survive all enabled kill rules
   */
  function applyKillRules(pool: number[], historyData: number[][], range: number): number[] {
    const rules = getKillRules().value
    let killed = new Set<number>()

    if (rules['tail']) {
      // 尾数杀号: find coldest tails from history
      const tailFreq: Record<number, number> = {}
      for (let i = 0; i <= 9; i++) tailFreq[i] = 0
      for (const draw of historyData) {
        for (const n of draw) {
          tailFreq[n % 10] = (tailFreq[n % 10] || 0) + 1
        }
      }
      const sortedTails = Object.entries(tailFreq).sort((a, b) => a[1] - b[1])
      const coldestTails = sortedTails.slice(0, 3).map(([t]) => parseInt(t))
      for (let n = 1; n <= range; n++) {
        if (coldestTails.includes(n % 10)) killed.add(n)
      }
    }

    if (rules['remainder']) {
      // 除三余数杀号: find coldest 012-route
      const routeCount: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
      for (const draw of historyData) {
        for (const n of draw.slice(0, 6)) {
          routeCount[n % 3] = (routeCount[n % 3] || 0) + 1
        }
      }
      const coldestRoute = parseInt(Object.entries(routeCount).sort((a, b) => a[1] - b[1])[0][0])
      for (let n = 1; n <= range; n++) {
        if (n % 3 === coldestRoute) killed.add(n)
      }
    }

    if (rules['zone']) {
      // 断区杀号: 4 zones, find hottest then assume break
      const zones = range === 33
        ? [[1, 8], [9, 16], [18, 25], [26, 33]]
        : [[1, 9], [10, 18], [19, 27], [28, 35]]
      let hottestZone = 0
      let hottestCount = 0
      zones.forEach(([start, end], idx) => {
        let count = 0
        for (const draw of historyData.slice(0, 5)) {
          for (const n of draw) {
            if (n >= start && n <= end) count++
          }
        }
        if (count > hottestCount) {
          hottestCount = count
          hottestZone = idx
        }
      })
      for (let n = zones[hottestZone][0]; n <= zones[hottestZone][1]; n++) {
        killed.add(n)
      }
    }

    if (rules['sametail']) {
      // 同尾杀号: from last draw, if same tail numbers existed, kill them
      if (historyData.length >= 2) {
        const lastDraw = historyData[0]
        const tailSet = new Set(lastDraw.map(n => n % 10))
        if (tailSet.size < 6) {
          // Had same-tail numbers, kill those tails' numbers
          for (let n = 1; n <= range; n++) {
            if (lastDraw.includes(n)) killed.add(n)
          }
        }
      }
    }

    if (rules['hotcold']) {
      // 冷热号杀号: kill extremely cold (15+期遗漏) and overheated (3+/5期)
      const freq: Record<number, number> = {}
      for (let n = 1; n <= range; n++) freq[n] = 0
      for (const draw of historyData) {
        for (const n of draw.slice(0, 6)) {
          freq[n] = (freq[n] || 0) + 1
        }
      }
      // Find most recent draw numbers
      const recentDraws = historyData.slice(0, 5)
      const recentFreq: Record<number, number> = {}
      for (const draw of recentDraws) {
        for (const n of draw.slice(0, 6)) {
          recentFreq[n] = (recentFreq[n] || 0) + 1
        }
      }
      for (let n = 1; n <= range; n++) {
        if (freq[n] === 0) killed.add(n) // never appeared in history
        if ((recentFreq[n] || 0) >= 3) killed.add(n) // overheated
      }
    }

    return pool.filter(n => !killed.has(n))
  }

  return {
    userKillRules,
    isAllKillEnabled,
    killEnabledCount,
    killTotalCount,
    setKillRule,
    setAllKillRules,
    applyKillRules,
  }
}

export { getKillRules }
```

---

### Task 2: Create useWuxingQilie composable

**Files:**
- Create: `src/composables/useWuxingQilie.ts`

- [ ] **Step 1: Write the composable file**

```typescript
import { ref, computed } from 'vue'

// 五行七列 matrix for SSQ (33 numbers, 5 rows)
const WUXING_ROWS = [
  { name: '金', color: '#F59E0B', numbers: [1, 2, 3, 4, 5, 6, 7] },
  { name: '木', color: '#10B981', numbers: [8, 9, 10, 11, 12, 13, 14] },
  { name: '水', color: '#3B82F6', numbers: [15, 16, 17, 18, 19, 20, 21] },
  { name: '火', color: '#EF4444', numbers: [22, 23, 24, 25, 26, 27, 28] },
  { name: '土', color: '#8B5CF6', numbers: [29, 30, 31, 32, 33] },
]

// For DLT (35 numbers, 5 rows of 7)
const WUXING_ROWS_DLT = [
  { name: '金', color: '#F59E0B', numbers: [1, 2, 3, 4, 5, 6, 7] },
  { name: '木', color: '#10B981', numbers: [8, 9, 10, 11, 12, 13, 14] },
  { name: '水', color: '#3B82F6', numbers: [15, 16, 17, 18, 19, 20, 21] },
  { name: '火', color: '#EF4444', numbers: [22, 23, 24, 25, 26, 27, 28] },
  { name: '土', color: '#8B5CF6', numbers: [29, 30, 31, 32, 33, 34, 35] },
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

  /**
   * Analyze which row(s) and column(s) are likely to break based on history.
   * Returns sets of killed numbers.
   */
  function analyzeAndKill(historyData: number[][], range: number): number[] {
    const killed = new Set<number>()

    if (brokenRowEnabled.value) {
      // Find the row with the most hits in recent draws -> likely to break
      const rowHits = rows.value.map(row => {
        let hits = 0
        for (const draw of historyData.slice(0, 10)) {
          for (const n of draw.slice(0, 6)) {
            if (row.numbers.includes(n)) hits++
          }
        }
        return hits
      })
      const hottestRowIdx = rowHits.indexOf(Math.max(...rowHits))
      rows.value[hottestRowIdx].numbers.forEach(n => killed.add(n))
    }

    if (brokenColumnEnabled.value) {
      // Columns are positions 0-6 within each row
      const maxCols = 7
      const colHits = new Array(maxCols).fill(0)
      for (const draw of historyData.slice(0, 10)) {
        for (const n of draw.slice(0, 6)) {
          for (const row of rows.value) {
            const idx = row.numbers.indexOf(n)
            if (idx !== -1) {
              colHits[idx]++
              break
            }
          }
        }
      }
      const hottestCol = colHits.indexOf(Math.max(...colHits))
      for (const row of rows.value) {
        if (row.numbers[hottestCol] !== undefined && row.numbers[hottestCol] <= range) {
          killed.add(row.numbers[hottestCol])
        }
      }
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
```

---

### Task 3: Create useHistoryData composable

**Files:**
- Create: `src/composables/useHistoryData.ts`

- [ ] **Step 1: Write the composable file**

```typescript
import { ref } from 'vue'

const SSQ_HISTORY_URL = 'https://datachart.500.com/ssq/history/history.shtml'
const CACHE_KEY = 'msst_ssq_history'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export interface HistoryEntry {
  issue: string
  red: number[]
  blue: number
}

export const ssqHistoryData = ref<HistoryEntry[]>([])
export const dltHistoryData = ref<HistoryEntry[]>([])
export const isLoading = ref(false)
export const lastUpdated = ref<string>('')

function parseSSQHtml(html: string): HistoryEntry[] {
  const entries: HistoryEntry[] = []
  // Extract data from HTML table rows
  // The page has rows with pattern: 期号 | 红球1-6 | 蓝球
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi
  const rows = html.match(rowRegex) || []
  
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
    if (!cells || cells.length < 8) continue

    const cellTexts = cells.map(c => {
      const match = c.match(/<td[^>]*>([\s\S]*?)<\/td>/)
      return match ? match[1].trim() : ''
    })

    const issue = cellTexts[0]
    if (!issue || !/^\d{5,6}$/.test(issue)) continue

    const reds: number[] = []
    for (let i = 1; i <= 6; i++) {
      const n = parseInt(cellTexts[i], 10)
      if (!isNaN(n) && n >= 1 && n <= 33) reds.push(n)
    }
    if (reds.length !== 6) continue

    const blue = parseInt(cellTexts[7], 10)
    if (isNaN(blue) || blue < 1 || blue > 16) continue

    entries.push({ issue, red: reds, blue })
  }
  return entries
}

export async function fetchHistoryData(): Promise<void> {
  isLoading.value = true
  try {
    // Try cache first
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      if (age < CACHE_TTL) {
        ssqHistoryData.value = data
        lastUpdated.value = new Date(timestamp).toLocaleString('zh-CN')
        isLoading.value = false
        return
      }
    }

    // Fetch fresh data
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(SSQ_HISTORY_URL)}`)
    const html = await response.text()
    const entries = parseSSQHtml(html)
    
    if (entries.length > 0) {
      ssqHistoryData.value = entries
      const now = Date.now()
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: entries, timestamp: now }))
      lastUpdated.value = new Date(now).toLocaleString('zh-CN')
    }
  } catch (err) {
    console.error('Failed to fetch history data:', err)
  } finally {
    isLoading.value = false
  }
}

export function useHistoryData() {
  return {
    ssqHistoryData,
    dltHistoryData,
    isLoading,
    lastUpdated,
    fetchHistoryData,
  }
}
```

---

### Task 4: Create KillRulesModal.vue

**Files:**
- Create: `src/components/KillRulesModal.vue`

- [ ] **Step 1: Write the modal component**

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RiCloseLine, RiRefreshLine } from '@remixicon/vue'
import { useKillRules, setKillRulesType } from '@/composables/useKillRules'
import { useHistoryData, fetchHistoryData, type HistoryEntry } from '@/composables/useHistoryData'

interface Props {
  visible: boolean
  lotteryType: 'ssq' | 'dlt'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const activeTab = ref<'history' | 'rules'>('history')

const {
  userKillRules, isAllKillEnabled, killEnabledCount, killTotalCount,
  setKillRule, setAllKillRules,
} = useKillRules()

const { ssqHistoryData, isLoading, lastUpdated } = useHistoryData()

const currentHistory = computed(() => ssqHistoryData.value)

watch(() => props.visible, (val) => {
  if (val) {
    setKillRulesType(props.lotteryType)
    fetchHistoryData()
  }
})

onMounted(() => {
  fetchHistoryData()
})

const KILL_RULES = [
  { key: 'tail', label: '尾数杀号', desc: '排除近10期最冷的3个尾数对应的号码', color: '#DC2626', bg: '#FEE2E2' },
  { key: 'remainder', label: '除三余数杀号', desc: '排除最近5期出现最少的012路分组', color: '#2563EB', bg: '#DBEAFE' },
  { key: 'zone', label: '断区杀号', desc: '排除过热区域（四分区：01-08,09-16,18-25,26-33）', color: '#D97706', bg: '#FEF3C7' },
  { key: 'sametail', label: '同尾杀号', desc: '上期有同尾号时，排除这些尾数的号码', color: '#8B5CF6', bg: '#EDE9FE' },
  { key: 'hotcold', label: '冷热号杀号', desc: '排除遗漏15期+的极冷号和近期过热号', color: '#10B981', bg: '#D1FAE5' },
]

function handleClose() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) handleClose()
}

function formatDraw(entry: HistoryEntry) {
  return `${entry.red.map(n => String(n).padStart(2, '0')).join(' ')}  +  ${String(entry.blue).padStart(2, '0')}`
}
</script>

<template>
  <Transition name="kill-modal">
    <div v-if="visible" class="kill-overlay" @click="handleOverlayClick">
      <div class="kill-content" @click.stop>
        <div class="kill-header">
          <h3 class="kill-title">杀号规则</h3>
          <button class="kill-close" @click="handleClose"><RiCloseLine class="close-icon" /></button>
        </div>
        <div class="kill-divider"></div>

        <!-- Tabs -->
        <div class="kill-tabs">
          <button class="kill-tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">历史数据</button>
          <button class="kill-tab" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">杀号规则</button>
        </div>

        <div class="kill-body">
          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="history-panel">
            <div class="history-header">
              <span class="history-title">双色球历史开奖数据</span>
              <button class="history-refresh" @click="fetchHistoryData" :disabled="isLoading">
                <RiRefreshLine class="refresh-icon" :class="{ spinning: isLoading }" />
              </button>
            </div>
            <div v-if="lastUpdated" class="history-updated">更新于 {{ lastUpdated }}</div>
            <div v-if="isLoading" class="history-loading">加载中...</div>
            <div v-else class="history-table">
              <div class="history-thead">
                <span class="th-issue">期号</span>
                <span class="th-red">红球号码</span>
                <span class="th-blue">蓝球</span>
              </div>
              <div class="history-tbody">
                <div v-for="entry in currentHistory.slice(0, 50)" :key="entry.issue" class="history-row">
                  <span class="td-issue">{{ entry.issue }}</span>
                  <span class="td-red">
                    <span v-for="n in entry.red" :key="n" class="ball red-ball">{{ String(n).padStart(2, '0') }}</span>
                  </span>
                  <span class="td-blue">
                    <span class="ball blue-ball">{{ String(entry.blue).padStart(2, '0') }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Kill Rules Tab -->
          <div v-else class="rules-panel">
            <p class="rules-desc">开启杀号规则后，生成号码时将自动排除被"杀"的号码</p>
            <div class="rules-select-all" @click="toggleAllKill">
              <div class="toggle-switch" :class="{ on: isAllKillEnabled }">
                <div class="toggle-thumb"></div>
              </div>
              <span class="select-all-text">全部{{ isAllKillEnabled ? '关闭' : '启用' }}</span>
              <span class="select-all-count">{{ killEnabledCount }}/{{ killTotalCount }} 条已启用</span>
            </div>
            <div class="rules-list">
              <div v-for="rule in KILL_RULES" :key="rule.key" class="rules-item" :class="{ disabled: !userKillRules[rule.key] }">
                <div class="toggle-switch" :class="{ on: userKillRules[rule.key] }" @click="setKillRule(rule.key, !userKillRules[rule.key])">
                  <div class="toggle-thumb"></div>
                </div>
                <div class="rule-badge" :style="{ background: userKillRules[rule.key] ? rule.bg : '#F3F4F6' }">
                  <span class="rule-text-simple" :style="{ color: userKillRules[rule.key] ? rule.color : '#9CA3AF' }">{{ rule.label }}</span>
                </div>
                <p class="rule-desc-text">{{ rule.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.kill-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 24px; }
.kill-content { width: 520px; height: 480px; max-height: 85vh; border-radius: 18px; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.55); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
.kill-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 0 18px; flex-shrink: 0; }
.kill-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.kill-close { width: 28px; height: 28px; border-radius: 9999px; border: none; cursor: pointer; background: transparent; display: flex; align-items: center; justify-content: center; padding: 0; }
.kill-close:hover { background: rgba(0,0,0,0.05); }
.close-icon { width: 18px; height: 18px; color: #92400E; }
.kill-divider { margin: 8px 18px 0 18px; height: 1px; background: rgba(253,230,138,0.6); flex-shrink: 0; }
.kill-tabs { display: flex; gap: 8px; padding: 10px 18px 0 18px; flex-shrink: 0; }
.kill-tab { flex: 1; height: 36px; border-radius: 8px; border: 1.5px solid #FDE68A; background: rgba(255,251,235,0.6); color: #D97706; font-size: 13px; font-weight: 600; font-family: 'SourceHanSans-SemiBold'; cursor: pointer; transition: all 0.2s; padding: 0; }
.kill-tab.active { background: linear-gradient(135deg,#F59E0B 0%,#D97706 100%); border-color: #D97706; color: #FFF; box-shadow: 0 2px 8px rgba(217,119,6,0.25); }
.kill-tab:not(.active):hover { background: rgba(255,251,235,1); }
.kill-body { flex: 1; overflow-y: auto; padding: 10px 18px 14px 18px; }

/* History */
.history-panel { display: flex; flex-direction: column; gap: 6px; }
.history-header { display: flex; align-items: center; justify-content: space-between; }
.history-title { font-size: 13px; font-weight: 600; color: #92400E; font-family: 'SourceHanSans-SemiBold'; }
.history-updated { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }
.history-refresh { width: 24px; height: 24px; border-radius: 6px; border: none; background: rgba(255,255,255,0.6); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.history-refresh:hover:not(:disabled) { background: rgba(255,255,255,0.9); }
.refresh-icon { width: 14px; height: 14px; color: #D97706; }
.refresh-icon.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.history-loading { text-align: center; padding: 40px; color: #92400E; font-family: 'SourceHanSans-Regular'; font-size: 14px; }
.history-table { display: flex; flex-direction: column; gap: 2px; }
.history-thead { display: flex; padding: 6px 8px; background: rgba(254,243,199,0.5); border-radius: 6px; font-size: 12px; font-weight: 600; color: #92400E; font-family: 'SourceHanSans-SemiBold'; gap: 8px; }
.th-issue { width: 70px; flex-shrink: 0; }
.th-red { flex: 1; text-align: center; }
.th-blue { width: 50px; flex-shrink: 0; text-align: center; }
.history-tbody { display: flex; flex-direction: column; gap: 2px; max-height: 280px; overflow-y: auto; }
.history-row { display: flex; align-items: center; padding: 4px 8px; gap: 8px; border-radius: 4px; font-size: 13px; font-family: 'SourceHanSans-Regular'; }
.history-row:nth-child(odd) { background: rgba(255,255,255,0.4); }
.history-row:hover { background: rgba(254,243,199,0.3); }
.td-issue { width: 70px; flex-shrink: 0; color: #78350F; font-size: 12px; }
.td-red { flex: 1; display: flex; gap: 3px; justify-content: center; }
.td-blue { width: 50px; flex-shrink: 0; display: flex; justify-content: center; }
.ball { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: 11px; font-weight: 700; font-family: 'SourceHanSans-Bold'; }
.red-ball { background: linear-gradient(135deg,#DC2626 0%,#EF4444 100%); color: #FFF; box-shadow: 0 1px 3px rgba(220,38,38,0.3); }
.blue-ball { background: linear-gradient(135deg,#2563EB 0%,#3B82F6 100%); color: #FFF; box-shadow: 0 1px 3px rgba(37,99,235,0.3); }

/* Rules */
.rules-panel { display: flex; flex-direction: column; gap: 8px; }
.rules-desc { font-size: 12px; color: #78350F; font-family: 'SourceHanSans-Regular'; margin: 0; padding: 6px 10px; background: linear-gradient(135deg,rgba(254,243,199,0.4) 0%,rgba(255,251,235,0.6) 100%); border-radius: 8px; border: 1px solid rgba(253,230,138,0.5); }
.rules-select-all { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: rgba(255,255,255,0.5); border-radius: 8px; border: 1px solid rgba(253,230,138,0.4); cursor: pointer; }
.select-all-text { font-size: 13px; font-weight: 600; color: #92400E; font-family: 'SourceHanSans-SemiBold'; }
.select-all-count { font-size: 12px; color: #B45309; font-family: 'SourceHanSans-Regular'; margin-left: auto; }
.toggle-switch { position: relative; width: 32px; height: 18px; border-radius: 9px; background: #D1D5DB; cursor: pointer; flex-shrink: 0; transition: background 0.25s; }
.toggle-switch.on { background: linear-gradient(135deg,#F59E0B 0%,#D97706 100%); }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #FFF; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.25s; }
.toggle-switch.on .toggle-thumb { transform: translateX(14px); }
.rules-list { display: flex; flex-direction: column; gap: 4px; }
.rules-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; }
.rules-item.disabled { opacity: 0.45; }
.rules-item:not(.disabled):hover { background: rgba(255,251,235,0.3); }
.rule-badge { padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
.rule-text-simple { font-size: 12px; font-weight: 700; white-space: nowrap; font-family: 'SourceHanSans-Bold'; }
.rule-desc-text { flex: 1; font-size: 12px; color: #78350F; font-family: 'SourceHanSans-Regular'; margin: 0; }
.rules-item.disabled .rule-desc-text { color: #9CA3AF; }
</style>
```

---

### Task 5: Create WuxingQilieModal.vue

**Files:**
- Create: `src/components/WuxingQilieModal.vue`

- [ ] **Step 1: Write the modal component**

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RiCloseLine } from '@remixicon/vue'
import { useWuxingQilie, setWuxingType } from '@/composables/useWuxingQilie'
import { useKillRules, setKillRulesType } from '@/composables/useKillRules'
import { useHistoryData, fetchHistoryData } from '@/composables/useHistoryData'

interface Props {
  visible: boolean
  lotteryType: 'ssq' | 'dlt'
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const activeTab = ref<'chart' | 'rules'>('chart')

const { rows, brokenRowEnabled, brokenColumnEnabled, analyzeAndKill } = useWuxingQilie()
const { userKillRules, isAllKillEnabled, killEnabledCount, killTotalCount, setKillRule, setAllKillRules } = useKillRules()
const { ssqHistoryData, isLoading } = useHistoryData()

watch(() => props.visible, (val) => {
  if (val) {
    setWuxingType(props.lotteryType)
    setKillRulesType(props.lotteryType)
    fetchHistoryData()
  }
})

const KILL_RULES = [
  { key: 'tail', label: '尾数杀号', desc: '排除近10期最冷的3个尾数', color: '#DC2626', bg: '#FEE2E2' },
  { key: 'remainder', label: '除三余数杀号', desc: '排除最冷的012路分组', color: '#2563EB', bg: '#DBEAFE' },
  { key: 'zone', label: '断区杀号', desc: '排除过热区域', color: '#D97706', bg: '#FEF3C7' },
  { key: 'sametail', label: '同尾杀号', desc: '排除上期同尾号码', color: '#8B5CF6', bg: '#EDE9FE' },
  { key: 'hotcold', label: '冷热号杀号', desc: '排除极冷和过热号', color: '#10B981', bg: '#D1FAE5' },
]

function handleClose() { emit('close') }
function handleOverlayClick(e: MouseEvent) { if (e.target === e.currentTarget) handleClose() }
</script>

<template>
  <Transition name="wx-modal">
    <div v-if="visible" class="wx-overlay" @click="handleOverlayClick">
      <div class="wx-content" @click.stop>
        <div class="wx-header">
          <h3 class="wx-title">五行七列</h3>
          <button class="wx-close" @click="handleClose"><RiCloseLine class="close-icon" /></button>
        </div>
        <div class="wx-divider"></div>
        <div class="wx-tabs">
          <button class="wx-tab" :class="{ active: activeTab === 'chart' }" @click="activeTab = 'chart'">五行七列图（红球）</button>
          <button class="wx-tab" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">杀号规则</button>
        </div>
        <div class="wx-body">
          <!-- Chart Tab -->
          <div v-if="activeTab === 'chart'" class="chart-panel">
            <p class="chart-desc">开启断行/断列后，基于历史数据分析可能空缺的行或列，自动排除对应号码</p>
            <div class="chart-controls">
              <label class="chart-toggle">
                <div class="toggle-switch" :class="{ on: brokenRowEnabled }" @click="brokenRowEnabled = !brokenRowEnabled">
                  <div class="toggle-thumb"></div>
                </div>
                <span>断行</span>
              </label>
              <label class="chart-toggle">
                <div class="toggle-switch" :class="{ on: brokenColumnEnabled }" @click="brokenColumnEnabled = !brokenColumnEnabled">
                  <div class="toggle-thumb"></div>
                </div>
                <span>断列</span>
              </label>
            </div>
            <div class="wx-matrix">
              <div v-for="row in rows" :key="row.name" class="wx-row" :style="{ borderLeftColor: row.color }">
                <span class="wx-row-label" :style="{ color: row.color }">{{ row.name }}</span>
                <span v-for="n in row.numbers" :key="n" class="wx-cell" :class="{ dim: n > (lotteryType === 'ssq' ? 33 : 35) }">
                  <span class="wx-num">{{ String(n).padStart(2, '0') }}</span>
                </span>
                <span v-for="i in (7 - row.numbers.length)" :key="'e'+i" class="wx-cell empty"></span>
              </div>
            </div>
            <div v-if="isLoading" class="chart-loading">加载历史数据中...</div>
          </div>
          <!-- Rules Tab -->
          <div v-else class="rules-panel">
            <p class="rules-desc">开启杀号规则后，生成号码时将自动排除被"杀"的号码</p>
            <div class="rules-select-all" @click="toggleAllKill">
              <div class="toggle-switch" :class="{ on: isAllKillEnabled }">
                <div class="toggle-thumb"></div>
              </div>
              <span class="select-all-text">全部{{ isAllKillEnabled ? '关闭' : '启用' }}</span>
              <span class="select-all-count">{{ killEnabledCount }}/{{ killTotalCount }} 条已启用</span>
            </div>
            <div class="rules-list">
              <div v-for="rule in KILL_RULES" :key="rule.key" class="rules-item" :class="{ disabled: !userKillRules[rule.key] }">
                <div class="toggle-switch" :class="{ on: userKillRules[rule.key] }" @click="setKillRule(rule.key, !userKillRules[rule.key])">
                  <div class="toggle-thumb"></div>
                </div>
                <div class="rule-badge" :style="{ background: userKillRules[rule.key] ? rule.bg : '#F3F4F6' }">
                  <span class="rule-text-simple" :style="{ color: userKillRules[rule.key] ? rule.color : '#9CA3AF' }">{{ rule.label }}</span>
                </div>
                <p class="rule-desc-text">{{ rule.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wx-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 24px; }
.wx-content { width: 520px; height: 500px; max-height: 85vh; border-radius: 18px; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.55); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
.wx-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 0 18px; flex-shrink: 0; }
.wx-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.wx-close { width: 28px; height: 28px; border-radius: 9999px; border: none; cursor: pointer; background: transparent; display: flex; align-items: center; justify-content: center; padding: 0; }
.wx-close:hover { background: rgba(0,0,0,0.05); }
.close-icon { width: 18px; height: 18px; color: #92400E; }
.wx-divider { margin: 8px 18px 0 18px; height: 1px; background: rgba(253,230,138,0.6); flex-shrink: 0; }
.wx-tabs { display: flex; gap: 8px; padding: 10px 18px 0 18px; flex-shrink: 0; }
.wx-tab { flex: 1; height: 36px; border-radius: 8px; border: 1.5px solid #FDE68A; background: rgba(255,251,235,0.6); color: #D97706; font-size: 13px; font-weight: 600; font-family: 'SourceHanSans-SemiBold'; cursor: pointer; transition: all 0.2s; padding: 0; }
.wx-tab.active { background: linear-gradient(135deg,#8B5CF6 0%,#7C3AED 100%); border-color: #8B5CF6; color: #FFF; box-shadow: 0 2px 8px rgba(139,92,246,0.25); }
.wx-tab:not(.active):hover { background: rgba(255,251,235,1); }
.wx-body { flex: 1; overflow-y: auto; padding: 10px 18px 14px 18px; }
.chart-panel { display: flex; flex-direction: column; gap: 10px; }
.chart-desc { font-size: 12px; color: #78350F; margin: 0; padding: 6px 10px; background: rgba(254,243,199,0.4); border-radius: 8px; border: 1px solid rgba(253,230,138,0.5); font-family: 'SourceHanSans-Regular'; }
.chart-controls { display: flex; gap: 16px; }
.chart-toggle { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #92400E; font-family: 'SourceHanSans-SemiBold'; cursor: pointer; }
.wx-matrix { display: flex; flex-direction: column; gap: 4px; border: 1px solid rgba(253,230,138,0.4); border-radius: 10px; padding: 10px; background: rgba(255,255,255,0.5); }
.wx-row { display: flex; align-items: center; gap: 4px; padding: 3px 0; border-left: 3px solid; padding-left: 6px; }
.wx-row-label { width: 20px; font-size: 13px; font-weight: 700; font-family: 'SourceHanSans-Bold'; flex-shrink: 0; }
.wx-cell { width: 32px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px; background: rgba(255,255,255,0.6); }
.wx-cell.empty { background: transparent; }
.wx-cell.dim .wx-num { opacity: 0.3; }
.wx-num { font-size: 11px; font-weight: 700; font-family: 'SourceHanSans-Bold'; color: #78350F; }
.chart-loading { text-align: center; padding: 20px; color: #92400E; font-size: 13px; font-family: 'SourceHanSans-Regular'; }

/* Rules (shared styles) */
.rules-panel { display: flex; flex-direction: column; gap: 8px; }
.rules-desc { font-size: 12px; color: #78350F; margin: 0; padding: 6px 10px; background: linear-gradient(135deg,rgba(254,243,199,0.4) 0%,rgba(255,251,235,0.6) 100%); border-radius: 8px; border: 1px solid rgba(253,230,138,0.5); font-family: 'SourceHanSans-Regular'; }
.rules-select-all { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: rgba(255,255,255,0.5); border-radius: 8px; border: 1px solid rgba(253,230,138,0.4); cursor: pointer; }
.select-all-text { font-size: 13px; font-weight: 600; color: #92400E; font-family: 'SourceHanSans-SemiBold'; }
.select-all-count { font-size: 12px; color: #B45309; font-family: 'SourceHanSans-Regular'; margin-left: auto; }
.toggle-switch { position: relative; width: 32px; height: 18px; border-radius: 9px; background: #D1D5DB; cursor: pointer; flex-shrink: 0; transition: background 0.25s; }
.toggle-switch.on { background: linear-gradient(135deg,#8B5CF6 0%,#7C3AED 100%); }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #FFF; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.25s; }
.toggle-switch.on .toggle-thumb { transform: translateX(14px); }
.rules-list { display: flex; flex-direction: column; gap: 4px; }
.rules-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; }
.rules-item.disabled { opacity: 0.45; }
.rules-item:not(.disabled):hover { background: rgba(255,251,235,0.3); }
.rule-badge { padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
.rule-text-simple { font-size: 12px; font-weight: 700; white-space: nowrap; font-family: 'SourceHanSans-Bold'; }
.rule-desc-text { flex: 1; font-size: 12px; color: #78350F; font-family: 'SourceHanSans-Regular'; margin: 0; }
.rules-item.disabled .rule-desc-text { color: #9CA3AF; }
</style>
```

---

### Task 6: Update FloatingLeftPanel.vue — add 杀号规则 icon

**Files:**
- Modify: `src/components/FloatingLeftPanel.vue`

- [ ] **Step 1: Add RiScissors2Line import and icon entry**

In the import block, add `RiScissors2Line`:
```typescript
import {
  RiDropLine,
  RiFireLine,
  RiNumbersLine,
  RiCandleLine,
  RiScissors2Line, // Add this
} from '@remixicon/vue'
```

In the icons array, add before the closing `]`:
```typescript
  { type: 'shahao', label: '杀号规则', icon: RiScissors2Line, color: '#EF4444' },
```

Also update the nth-child rule count. The old max was `.icon-item:nth-child(4)` (line 194). Change to `.icon-item:nth-child(5)`.

---

### Task 7: Update FloatingRightPanel.vue — add 五行七列 icon

**Files:**
- Modify: `src/components/FloatingRightPanel.vue`

- [ ] **Step 1: Add RiGridLine import and icon entry**

In the import block, add `RiGridLine`:
```typescript
import {
  RiCake2Line,
  RiMagicLine,
  RiPlanetLine,
  RiSparkling2Line,
  RiGridLine, // Add this
} from '@remixicon/vue'
```

In the icons array, add before the closing `]`:
```typescript
  { type: 'wuxing', label: '五行七列', icon: RiGridLine, color: '#8B5CF6' },
```

Also update the nth-child rule count. Change `.icon-item:nth-child(4)` to `.icon-item:nth-child(5)`.

---

### Task 8: Update HomePage.vue — add modal routing

**Files:**
- Modify: `src/views/HomePage.vue`

- [ ] **Step 1: Add imports for new modals**

Add after the existing import block:
```typescript
import KillRulesModal from '@/components/KillRulesModal.vue'
import WuxingQilieModal from '@/components/WuxingQilieModal.vue'
```

- [ ] **Step 2: Add state variables**

Add after existing state variables:
```typescript
const showKillRules = ref(false)
const showWuxingQilie = ref(false)
```

- [ ] **Step 3: Add routing in handleOpenModal**

Add before the `// 蓝若寺和红佛女...` comment:
```typescript
  if (type === 'shahao') {
    showKillRules.value = true
    return
  }
  if (type === 'wuxing') {
    showWuxingQilie.value = true
    return
  }
```

- [ ] **Step 4: Add close handlers**

```typescript
function handleKillRulesClose() {
  showKillRules.value = false
}
function handleWuxingClose() {
  showWuxingQilie.value = false
}
```

- [ ] **Step 5: Add modal templates before the Toast component**

```vue
    <KillRulesModal
      :visible="showKillRules"
      :lottery-type="lotteryType"
      @close="handleKillRulesClose"
    />
    <WuxingQilieModal
      :visible="showWuxingQilie"
      :lottery-type="lotteryType"
      @close="handleWuxingClose"
    />
```

---

### Task 9: Integrate kill rules into useLottery.ts

**Files:**
- Modify: `src/composables/useLottery.ts`

- [ ] **Step 1: Import kill rules composable**

At top of file:
```typescript
import { useKillRules, getKillRules } from './useKillRules'
import { useWuxingQilie } from './useWuxingQilie'
```

- [ ] **Step 2: Apply kill rules in generateSSQ**

After the merge function's `let result = Array.from(unique).sort((a, b) => a - b)` line (before `return result`), add:
```typescript
    const { applyKillRules } = useKillRules()
    const historyData = ssqHistoryData.value.map(e => [...e.red, e.blue])
    const killedResult = applyKillRules(result, historyData, range)
    if (killedResult.length >= target) result = killedResult.slice(0, target).sort((a, b) => a - b)
```

- [ ] **Step 3: Apply kill rules in generateDLT**

Same pattern in the DLT mergeNumbers.

- [ ] **Step 4: Import ssqHistoryData**

```typescript
import { ssqHistoryData } from './useHistoryData'
```

---

### Task 10: Run tests and verify

- [ ] **Step 1: Run vitest**

Run: `npx vitest run`
Expected: All existing tests pass

- [ ] **Step 2: Run type check**

Run: `npx vue-tsc --noEmit`
Expected: No type errors
