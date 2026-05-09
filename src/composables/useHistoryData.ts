import { ref, onMounted, onUnmounted } from 'vue'

// 直接使用 500.com 数据源，通过 CORS 代理访问
const SSQ_URL = 'https://datachart.500.com/ssq/history/history.shtml'
const DLT_URL = 'https://datachart.500.com/dlt/history/history.shtml'
// CORS 代理（可以使用多个备用代理）
const CORS_PROXY = 'https://api.allorigins.win/raw?url='
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

function parseSSQHtml(html: string): SSQHistoryEntry[] {
  const results: SSQHistoryEntry[] = []
  
  // 简单的 HTML 解析，提取表格数据
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
  
  const tableMatch = html.match(tableRegex)
  if (!tableMatch) return results
  
  const rows = tableMatch[1].matchAll(rowRegex)
  
  for (const row of rows) {
    const cells = [...row[1].matchAll(cellRegex)]
    if (cells.length < 9) continue
    
    const issue = cells[0][1].trim()
    if (!issue || !/^\d{5,6}$/.test(issue)) continue
    
    const red: number[] = []
    for (let i = 1; i <= 6; i++) {
      const num = parseInt(cells[i][1].trim(), 10)
      if (!isNaN(num) && num >= 1 && num <= 33) {
        red.push(num)
      }
    }
    if (red.length !== 6) continue
    
    const blue = parseInt(cells[7][1].trim(), 10)
    if (isNaN(blue) || blue < 1 || blue > 16) continue
    
    results.push({
      issue,
      red,
      blue
    })
  }
  
  return results.slice(0, 30)
}

function parseDLTHtml(html: string): DLTHistoryEntry[] {
  const results: DLTHistoryEntry[] = []
  
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
  
  const tableMatch = html.match(tableRegex)
  if (!tableMatch) return results
  
  const rows = tableMatch[1].matchAll(rowRegex)
  
  for (const row of rows) {
    const cells = [...row[1].matchAll(cellRegex)]
    if (cells.length < 9) continue
    
    const issue = cells[0][1].trim()
    if (!issue || !/^\d{5,6}$/.test(issue)) continue
    
    const front: number[] = []
    for (let i = 1; i <= 5; i++) {
      const num = parseInt(cells[i][1].trim(), 10)
      if (!isNaN(num) && num >= 1 && num <= 35) {
        front.push(num)
      }
    }
    if (front.length !== 5) continue
    
    const back: number[] = []
    for (let i = 6; i <= 7; i++) {
      const num = parseInt(cells[i][1].trim(), 10)
      if (!isNaN(num) && num >= 1 && num <= 12) {
        back.push(num)
      }
    }
    if (back.length !== 2) continue
    
    results.push({
      issue,
      front,
      back
    })
  }
  
  return results.slice(0, 30)
}

async function fetchWithTimeout(url: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('请求超时'))
    }, timeout)

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    })
    .then(response => {
      clearTimeout(timer)
      if (!response.ok) {
        reject(new Error(`HTTP ${response.status}`))
      }
      return response.text()
    })
    .then(html => {
      resolve(html)
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
    const url = type === 'ssq' ? SSQ_URL : DLT_URL
    const cacheKey = type === 'ssq' ? SSQ_CACHE_KEY : DLT_CACHE_KEY
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`

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

    console.log(`fetchHistoryData: ${type} fetching from 500.com via CORS proxy...`)
    const html = await fetchWithTimeout(proxyUrl, 15000)
    
    console.log(`fetchHistoryData: ${type} HTML received, parsing...`)
    
    let data: any[] = []
    if (type === 'ssq') {
      data = parseSSQHtml(html)
    } else {
      data = parseDLTHtml(html)
    }
    
    console.log(`fetchHistoryData: ${type} parsed ${data.length} entries`)
    
    if (data.length > 0) {
      const now = Date.now()
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }))
      
      if (type === 'ssq') {
        ssqHistoryData.value = data
        lastUpdated.value = new Date(now).toLocaleString('zh-CN')
      } else {
        dltHistoryData.value = data
        dltLastUpdated.value = new Date(now).toLocaleString('zh-CN')
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
