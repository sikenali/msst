import { ref, onMounted, onUnmounted } from 'vue'

// 直接使用 500.com 数据源，通过 CORS 代理访问
const SSQ_URL = 'https://datachart.500.com/ssq/history/history.shtml'
const DLT_URL = 'https://datachart.500.com/dlt/history/history.shtml'
// CORS 代理（使用多个备用代理）
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://proxy.cors.sh/'
]
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
  
  // 直接提取所有数字，不依赖文本编码
  const getNumbers = (row: string): number[] => {
    const nums = row.match(/\d+/g) || []
    return nums.map(n => parseInt(n, 10)).filter(n => !isNaN(n))
  }
  
  // 查找数据行（每行应该有 7 个数字：期号 6 个红球 + 1 个蓝球）
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const nums = getNumbers(row)
    
    console.log(`Row ${i}: ${nums.length} nums: [${nums.slice(0, 10).join(', ')}...]`)
    
    // 期号应该是 5-6 位数字，红球 1-33，蓝球 1-16
    if (nums.length >= 7) {
      const issue = nums[0]
      // 期号应该是 5-6 位，如 2024001
      if (issue >= 10000 && issue <= 999999) {
        const red = nums.slice(1, 7).filter(n => n >= 1 && n <= 33)
        const blue = nums[7]
        
        console.log(`  -> issue=${issue}, red=[${red}], blue=${blue}`)
        
        if (red.length === 6 && blue >= 1 && blue <= 16) {
          results.push({
            issue: String(issue),
            red: red.sort((a, b) => a - b),
            blue
          })
        }
      }
    }
    
    if (results.length >= 30) break
  }
  
  console.log(`parseSSQHtml: Parsed ${results.length} valid entries`)
  return results
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
  
  // 直接提取所有数字，不依赖文本编码
  const getNumbers = (row: string): number[] => {
    const nums = row.match(/\d+/g) || []
    return nums.map(n => parseInt(n, 10)).filter(n => !isNaN(n))
  }
  
  // 查找数据行（每行应该有 7 个数字：期号 5 个前区 + 2 个后区）
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const nums = getNumbers(row)
    
    // 期号应该是 5-6 位数字，前区 1-35，后区 1-12
    if (nums.length >= 7) {
      const issue = nums[0]
      // 期号应该是 5-6 位，如 24001
      if (issue >= 10000 && issue <= 999999) {
        const front = nums.slice(1, 6).filter(n => n >= 1 && n <= 35)
        const back = nums.slice(6, 8).filter(n => n >= 1 && n <= 12)
        
        if (front.length === 5 && back.length === 2) {
          results.push({
            issue: String(issue),
            front: front.sort((a, b) => a - b),
            back: back.sort((a, b) => a - b)
          })
        }
      }
    }
    
    if (results.length >= 30) break
  }
  
  console.log(`parseDLTHtml: Parsed ${results.length} valid entries`)
  return results
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

    // 尝试多个 CORS 代理
    let html: string | null = null
    let lastError: any = null
    
    for (const proxy of CORS_PROXIES) {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`
      console.log(`fetchHistoryData: ${type} trying proxy: ${proxyUrl}`)
      
      try {
        html = await fetchWithTimeout(proxyUrl, 15000)
        console.log(`fetchHistoryData: ${type} HTML received, length: ${html.length}`)
        if (html && html.length > 1000) {
          break // 成功获取
        }
      } catch (err) {
        console.warn(`fetchHistoryData: ${type} proxy ${proxy} failed:`, err)
        lastError = err
      }
    }
    
    if (!html || html.length < 1000) {
      throw lastError || new Error('所有代理都失败')
    }
    
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
