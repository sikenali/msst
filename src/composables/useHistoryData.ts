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
  
  console.log(`parseSSQHtml: HTML length: ${html.length}`)
  
  // 尝试提取所有行
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi
  const rows = html.match(rowRegex)
  
  if (!rows) {
    console.log('parseSSQHtml: No rows found')
    return results
  }
  
  console.log(`parseSSQHtml: Found ${rows.length} rows`)
  
  const getText = (html: string) => html.replace(/<[^>]*>/g, '').trim()
  
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i]
    
    // 提取所有单元格
    const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
    console.log(`Row ${i}: cells=${cellMatches ? cellMatches.length : 0}`)
    
    if (cellMatches) {
      console.log(`Row ${i} first 3 cells:`, cellMatches.slice(0, 3).map(c => getText(c)))
    }
    
    if (!cellMatches || cellMatches.length < 8) continue
    
    // 提取文本内容
    const issue = getText(cellMatches[0])
    console.log(`Row ${i} issue: "${issue}"`)
    
    if (!issue || !/^\d{5,6}$/.test(issue)) {
      console.log(`Row ${i} issue validation failed`)
      continue
    }
    
    const red: number[] = []
    for (let j = 1; j <= 6; j++) {
      const num = parseInt(getText(cellMatches[j]), 10)
      if (!isNaN(num) && num >= 1 && num <= 33) {
        red.push(num)
      }
    }
    if (red.length !== 6) {
      console.log(`Row ${i} red balls validation failed: ${red.length}`)
      continue
    }
    
    const blue = parseInt(getText(cellMatches[7]), 10)
    if (isNaN(blue) || blue < 1 || blue > 16) {
      console.log(`Row ${i} blue ball validation failed: ${blue}`)
      continue
    }
    
    results.push({
      issue,
      red,
      blue
    })
  }
  
  console.log(`parseSSQHtml: Parsed ${results.length} valid entries`)
  return results.slice(0, 30)
}

function parseDLTHtml(html: string): DLTHistoryEntry[] {
  const results: DLTHistoryEntry[] = []
  
  console.log(`parseDLTHtml: HTML length: ${html.length}`)
  
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi
  const rows = html.match(rowRegex)
  
  if (!rows) {
    console.log('parseDLTHtml: No rows found')
    return results
  }
  
  console.log(`parseDLTHtml: Found ${rows.length} rows`)
  
  const getText = (html: string) => html.replace(/<[^>]*>/g, '').trim()
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    
    const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
    if (!cellMatches || cellMatches.length < 8) continue
    
    const issue = getText(cellMatches[0])
    if (!issue || !/^\d{5,6}$/.test(issue)) continue
    
    const front: number[] = []
    for (let j = 1; j <= 5; j++) {
      const num = parseInt(getText(cellMatches[j]), 10)
      if (!isNaN(num) && num >= 1 && num <= 35) {
        front.push(num)
      }
    }
    if (front.length !== 5) continue
    
    const back: number[] = []
    for (let j = 6; j <= 7; j++) {
      const num = parseInt(getText(cellMatches[j]), 10)
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
  
  console.log(`parseDLTHtml: Parsed ${results.length} valid entries`)
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
