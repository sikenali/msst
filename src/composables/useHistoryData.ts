import { ref, onMounted, onUnmounted } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/lottery'
const LOTTERY_API_URL = `${API_BASE_URL}`
const SSQ_CACHE_KEY = 'msst_ssq_history'
const DLT_CACHE_KEY = 'msst_dlt_history'
const DEFAULT_DISPLAY_COUNT = 30

export interface SSQHistoryEntry {
  issue: string
  red: number[]
  blue: number
}

export interface DLTHistoryEntry {
  issue: string
  front: number[]
  back: number[]
}

export const ssqHistoryData = ref<SSQHistoryEntry[]>([])
export const dltHistoryData = ref<DLTHistoryEntry[]>([])
export const isLoading = ref(false)
export const lastUpdated = ref<string>('')
export const dltLastUpdated = ref<string>('')
export const apiAvailable = ref(true)

let timer: number | undefined = undefined

const FALLBACK_SSQ: SSQHistoryEntry[] = []
const FALLBACK_DLT: DLTHistoryEntry[] = []

function setupAutoUpdate() {
  if (timer) clearInterval(timer)

  const now = new Date()
  const targetTime = new Date()
  targetTime.setHours(22, 0, 0, 0)

  let delay = targetTime.getTime() - now.getTime()
  if (delay < 0) delay += 24 * 60 * 60 * 1000

  setTimeout(() => {
    fetchHistoryData('ssq')
    fetchHistoryData('dlt')
    timer = setInterval(() => {
      fetchHistoryData('ssq')
      fetchHistoryData('dlt')
    }, 24 * 60 * 60 * 1000)
  }, delay)
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    })
    clearTimeout(timer)
    return response
  } catch (error) {
    clearTimeout(timer)
    throw error
  }
}

export async function fetchHistoryData(type: 'ssq' | 'dlt' = 'ssq'): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const url = `${LOTTERY_API_URL}?type=${type}`
    const cacheKey = type === 'ssq' ? SSQ_CACHE_KEY : DLT_CACHE_KEY

    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      if (age < 3600000 && data.length > 0) {
        if (type === 'ssq') ssqHistoryData.value = data
        else dltHistoryData.value = data
        const updatedStr = new Date(timestamp).toLocaleString('zh-CN')
        if (type === 'ssq') lastUpdated.value = updatedStr
        else dltLastUpdated.value = updatedStr
        apiAvailable.value = true
        isLoading.value = false
        return
      }
    }

    const response = await fetchWithTimeout(url, 15000)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data && result.data.length > 0) {
      const now = Date.now()
      localStorage.setItem(cacheKey, JSON.stringify({ data: result.data, timestamp: now }))

      if (type === 'ssq') {
        ssqHistoryData.value = result.data
        lastUpdated.value = result.lastUpdated || new Date(now).toLocaleString('zh-CN')
      } else {
        dltHistoryData.value = result.data
        dltLastUpdated.value = result.lastUpdated || new Date(now).toLocaleString('zh-CN')
      }
      apiAvailable.value = true
    }
  } catch (err) {
    console.error(`Failed to fetch ${type} history data:`, err)
    apiAvailable.value = false

    const cached = localStorage.getItem(type === 'ssq' ? SSQ_CACHE_KEY : DLT_CACHE_KEY)
    if (cached) {
      const { data } = JSON.parse(cached)
      if (type === 'ssq') ssqHistoryData.value = data
      else dltHistoryData.value = data
    }
  } finally {
    isLoading.value = false
  }
}

export function getHistoryDraws(type: 'ssq' | 'dlt'): number[][] {
  if (type === 'dlt') {
    return dltHistoryData.value.slice(0, DEFAULT_DISPLAY_COUNT).map(e => [...e.front, ...e.back])
  }
  return ssqHistoryData.value.slice(0, DEFAULT_DISPLAY_COUNT).map(e => [...e.red, e.blue])
}

export function useHistoryData() {
  onMounted(() => {
    loadCachedData()
    setupAutoUpdate()
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  })

  return {
    ssqHistoryData,
    dltHistoryData,
    isLoading,
    lastUpdated,
    dltLastUpdated,
    apiAvailable,
    fetchHistoryData,
    getHistoryDraws,
    setupAutoUpdate,
  }
}

function loadCachedData() {
  try {
    const ssqCached = localStorage.getItem(SSQ_CACHE_KEY)
    const dltCached = localStorage.getItem(DLT_CACHE_KEY)

    if (ssqCached) {
      const { data, timestamp } = JSON.parse(ssqCached)
      ssqHistoryData.value = data
      lastUpdated.value = new Date(timestamp).toLocaleString('zh-CN')
    }

    if (dltCached) {
      const { data, timestamp } = JSON.parse(dltCached)
      dltHistoryData.value = data
      dltLastUpdated.value = new Date(timestamp).toLocaleString('zh-CN')
    }
  } catch (error) {
    console.error('Failed to load cached data:', error)
  }
}
