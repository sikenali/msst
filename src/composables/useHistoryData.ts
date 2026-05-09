import { ref, onMounted, onUnmounted } from 'vue'

// 使用环境变量配置 API 基础 URL，生产环境可配置实际后端地址
// Vercel 部署时，使用相对路径即可
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/lottery'
// Vercel Serverless 使用查询参数方式：/api/lottery?type=ssq
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

let timer: number | undefined = undefined

function setupAutoUpdate() {
  if (timer) clearInterval(timer)
  
  const now = new Date()
  const targetTime = new Date()
  targetTime.setHours(22, 0, 0, 0)
  
  let delay = targetTime.getTime() - now.getTime()
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000
  }
  
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
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('请求超时'))
    }, timeout)

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(response => {
      clearTimeout(timer)
      resolve(response)
    })
    .catch(error => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

export async function fetchHistoryData(type: 'ssq' | 'dlt' = 'ssq'): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  
  try {
    // Vercel Serverless 使用查询参数方式
    const url = `${LOTTERY_API_URL}?type=${type}`
    const cacheKey = type === 'ssq' ? SSQ_CACHE_KEY : DLT_CACHE_KEY

    console.log(`fetchHistoryData: ${type}, url: ${url}`)
    
    // 先检查缓存
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      console.log(`fetchHistoryData: ${type} cache found, age: ${Math.floor(age / 60000)} minutes`)
      if (age < 3600000 && data.length > 0) {
        console.log(`fetchHistoryData: ${type} using cached data, length: ${data.length}`)
        if (type === 'ssq') {
          ssqHistoryData.value = data
        } else {
          dltHistoryData.value = data
        }
        const updatedStr = new Date(timestamp).toLocaleString('zh-CN')
        if (type === 'ssq') lastUpdated.value = updatedStr
        else dltLastUpdated.value = updatedStr
        isLoading.value = false
        return
      }
    } else {
      console.log(`fetchHistoryData: ${type} no cache found`)
    }

    console.log(`fetchHistoryData: ${type} fetching from server...`)
    const response = await fetchWithTimeout(url, 10000)
    
    console.log(`fetchHistoryData: ${type} response status: ${response.status}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log(`fetchHistoryData: ${type} result:`, result)
    
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
    }
  } catch (err) {
    console.error(`Failed to fetch ${type} history data:`, err)
    // 出错时使用缓存数据
    const cached = localStorage.getItem(type === 'ssq' ? SSQ_CACHE_KEY : DLT_CACHE_KEY)
    if (cached) {
      const { data } = JSON.parse(cached)
      if (type === 'ssq') {
        ssqHistoryData.value = data
      } else {
        dltHistoryData.value = data
      }
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
