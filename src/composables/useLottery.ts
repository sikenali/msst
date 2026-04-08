import { generateBaguaNumbers } from './useBagua'

export interface SSQResult {
  type: 'single' | 'multiple' | 'dantuo'
  red: number[]
  blue: number[]
  redBanker?: number[]
  redDrag?: number[]
}

export interface DLTResult {
  type: 'single' | 'multiple' | 'dantuo'
  front: number[]
  back: number[]
  frontBanker?: number[]
  frontDrag?: number[]
}

export interface LotteryMeta {
  type: 'ssq' | 'dlt'
  notes: number
  mode: 'single' | 'multiple' | 'dantuo'
  time: string
}

// 辅助函数：从指定范围内随机获取不重复的排序数字 (使用八卦算法)
const getBaguaNums = (min: number, max: number, count: number): number[] => {
  return generateBaguaNumbers(min, max, count)
}

// 辅助函数：从池中随机获取数字
const getRandomNumsFromPool = (pool: number[], count: number): number[] => {
  const res: number[] = []
  const p = [...pool]
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * p.length)
    res.push(p[idx])
    p.splice(idx, 1)
  }
  return res.sort((a, b) => a - b)
}

/**
 * 生成双色球号码 (基于八卦时辰算法)
 */
export function generateSSQ(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): SSQResult[] {
  if (mode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      red: getBaguaNums(1, 33, 6),
      blue: getBaguaNums(1, 16, 1),
    }))
  }

  if (mode === 'multiple') {
    const redCount = 7 + Math.floor(Math.random() * 4)
    const blueCount = 1 + Math.floor(Math.random() * 2)
    return [{
      type: 'multiple',
      red: getBaguaNums(1, 33, redCount),
      blue: getBaguaNums(1, 16, blueCount),
    }]
  }

  // 胆拖：结合八卦方位
  const bankerCount = 1 + Math.floor(Math.random() * 4)
  const dragCount = 2 + Math.floor(Math.random() * 4)

  const bankers = getBaguaNums(1, 33, bankerCount)
  const remaining = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !bankers.includes(n))
  const drags = getRandomNumsFromPool(remaining, dragCount)

  return [{
    type: 'dantuo',
    red: [...bankers, ...drags].sort((a, b) => a - b),
    blue: getBaguaNums(1, 16, 1),
    redBanker: bankers,
    redDrag: drags,
  }]
}

/**
 * 生成大乐透号码 (基于八卦时辰算法)
 */
export function generateDLT(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): DLTResult[] {
  if (mode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      front: getBaguaNums(1, 35, 5),
      back: getBaguaNums(1, 12, 2),
    }))
  }

  if (mode === 'multiple') {
    const frontCount = 6 + Math.floor(Math.random() * 5)
    const backCount = 3 + Math.floor(Math.random() * 2)
    return [{
      type: 'multiple',
      front: getBaguaNums(1, 35, frontCount),
      back: getBaguaNums(1, 12, backCount),
    }]
  }

  // 胆拖
  const bankerCount = 1 + Math.floor(Math.random() * 3)
  const dragCount = 2 + Math.floor(Math.random() * 3)

  const bankers = getBaguaNums(1, 35, bankerCount)
  const remaining = Array.from({ length: 35 }, (_, i) => i + 1).filter(n => !bankers.includes(n))
  const drags = getRandomNumsFromPool(remaining, dragCount)

  return [{
    type: 'dantuo',
    front: [...bankers, ...drags].sort((a, b) => a - b),
    back: getBaguaNums(1, 12, 2),
    frontBanker: bankers,
    frontDrag: drags,
  }]
}

/**
 * 格式化当前时间
 */
export function formatTime(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

/**
 * 获取下一期期号
 */
export function getIssueNumber(type: 'ssq' | 'dlt'): string {
  const now = new Date()
  const year = now.getFullYear()
  const shortYear = String(year).slice(-2)
  
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  const refDay = 96
  
  let issueNum: number
  
  if (type === 'ssq') {
    const refIssue = 37
    const daysDiff = dayOfYear - refDay
    const issueDiff = Math.floor(daysDiff * 3 / 7)
    issueNum = refIssue + issueDiff
  } else {
    const refIssue = 36
    const daysDiff = dayOfYear - refDay
    const issueDiff = Math.floor(daysDiff * 3 / 7)
    issueNum = refIssue + issueDiff
  }
  
  issueNum = Math.min(type === 'ssq' ? 150 : 156, Math.max(1, issueNum + 1))
  return `${shortYear}${String(issueNum).padStart(3, '0')}`
}
