import { ref } from 'vue'
import { generateBaguaNumbers } from './useBagua'
import { generateEnhancedNumbers } from './useFortune'
import {
  ssqBlueNumbers,
  ssqRedNumbers,
  ssqBirthday,
  ssqConstellation,
  ssqLuckyNumbers,
  dltBlueNumbers,
  dltRedNumbers,
  dltBirthday,
  dltConstellation,
  dltLuckyNumbers,
} from './useUserSelections'

// 当前彩种类型（需要外部设置）
let currentLotteryType: 'ssq' | 'dlt' = 'ssq'

export function setCurrentLotteryType(type: 'ssq' | 'dlt') {
  currentLotteryType = type
}

function getUserBlueNumbers() {
  return currentLotteryType === 'ssq' ? ssqBlueNumbers : dltBlueNumbers
}

function getUserRedNumbers() {
  return currentLotteryType === 'ssq' ? ssqRedNumbers : dltRedNumbers
}

function getUserBirthday() {
  return currentLotteryType === 'ssq' ? ssqBirthday : dltBirthday
}

function getUserConstellation() {
  return currentLotteryType === 'ssq' ? ssqConstellation : dltConstellation
}

function getUserLuckyNumbers() {
  return currentLotteryType === 'ssq' ? ssqLuckyNumbers : dltLuckyNumbers
}

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

// 辅助函数：从指定范围内随机获取不重复的排序数字 (使用增强算法)
const getEnhancedNums = (min: number, max: number, count: number): number[] => {
  return generateEnhancedNumbers(min, max, count)
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

// 辅助函数：加权池生成逻辑
// 将多个来源的数字合并去重，用于优先推荐
const getWeightedPool = (sources: number[][], range: [number, number]): number[] => {
  const pool = new Set<number>()
  const [min, max] = range

  for (const arr of sources) {
    for (const n of arr) {
      if (n >= min && n <= max) {
        pool.add(n)
      }
    }
  }

  // 增加权重：池中的数字出现 2-3 次，增加被随机选中的概率
  const weightedArr: number[] = []
  for (const n of pool) {
    weightedArr.push(n, n, n)
  }
  return weightedArr
}

/**
 * 获取生日幸运数字 (简易算法)
 */
const getBirthdayLuckyNumbers = (): number[] => {
  const { year, month, day } = getUserBirthday().value || {}
  if (!year || !month || !day) return []

  // 简单的数字拆解和相加
  const nums = new Set<number>()
  const str = `${year}${month}${day}`
  for (let i = 0; i < str.length; i++) {
    const d = parseInt(str[i], 10)
    if (d > 0) nums.add(d)
  }
  
  // 组合数
  nums.add((month + day) % 35 || 35)
  nums.add((year % 100 + month) % 35 || 35)
  
  return Array.from(nums)
}

/**
 * 获取星座幸运数字 (映射表)
 */
const getConstellationLuckyNumbers = (): number[] => {
  const map: Record<string, number[]> = {
    '白羊座': [1, 9, 18, 24], '金牛座': [4, 6, 12, 20], '双子座': [3, 7, 15, 22],
    '巨蟹座': [2, 8, 11, 26], '狮子座': [5, 10, 19, 30], '处女座': [6, 14, 25, 32],
    '天秤座': [1, 13, 17, 28], '天蝎座': [3, 8, 27, 33], '射手座': [9, 16, 21, 34],
    '摩羯座': [5, 12, 18, 35], '水瓶座': [2, 7, 23, 29], '双鱼座': [4, 11, 14, 31]
  }
  return map[getUserConstellation().value] || []
}

/**
 * 获取所有法号/道号相关的加权池
 */
const getDivineNumberPools = (maxRange: number) => {
  const birthNums = getBirthdayLuckyNumbers().filter(n => n <= maxRange)
  const constNums = getConstellationLuckyNumbers().filter(n => n <= maxRange)
  const luckyNums = getUserLuckyNumbers().value.filter(n => n <= maxRange)

  return getWeightedPool([birthNums, constNums, luckyNums], [1, maxRange])
}

/**
 * 生成双色球号码 (融合所有"法号"数据)
 */
export function generateSSQ(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): SSQResult[] {
  // 获取用户固定的红蓝球
  const fixedRed = getUserRedNumbers().value.filter(n => n >= 1 && n <= 33)
  const fixedBlue = getUserBlueNumbers().value.filter(n => n >= 1 && n <= 16)
  
  // 获取加权池
  const redPool = getDivineNumberPools(33)
  const bluePool = getDivineNumberPools(16)

  // 辅助生成函数：优先使用固定号和加权池，不足则随机补充
  const generateRed = (count: number) => {
    if (fixedRed.length > 0 && fixedRed.length >= count) {
      return fixedRed.slice(0, count).sort((a, b) => a - b)
    }

    const picked = new Set<number>(fixedRed)
    if (redPool.length > 0) {
      while (picked.size < count) {
        const idx = Math.floor(Math.random() * redPool.length)
        picked.add(redPool[idx])
      }
    }
    
    if (picked.size < count) {
      const remaining = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !picked.has(n))
      const randomPick = getRandomNumsFromPool(remaining, count - picked.size)
      randomPick.forEach(n => picked.add(n))
    }

    return Array.from(picked).sort((a, b) => a - b)
  }

  const generateBlue = (count: number) => {
    if (fixedBlue.length > 0 && fixedBlue.length >= count) {
      return fixedBlue.slice(0, count).sort((a, b) => a - b)
    }

    const picked = new Set<number>(fixedBlue)
    if (bluePool.length > 0) {
      while (picked.size < count) {
        const idx = Math.floor(Math.random() * bluePool.length)
        picked.add(bluePool[idx])
      }
    }
    
    if (picked.size < count) {
      const remaining = Array.from({ length: 16 }, (_, i) => i + 1).filter(n => !picked.has(n))
      const randomPick = getRandomNumsFromPool(remaining, count - picked.size)
      randomPick.forEach(n => picked.add(n))
    }

    return Array.from(picked).sort((a, b) => a - b)
  }

  if (mode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      red: generateRed(6),
      blue: generateBlue(1),
    }))
  }

  if (mode === 'multiple') {
    return Array.from({ length: notes }, () => {
      const redCount = Math.max(7, fixedRed.length || (7 + Math.floor(Math.random() * 3)))
      const blueCount = Math.max(2, fixedBlue.length || (1 + Math.floor(Math.random() * 2)))
      return {
        type: 'multiple',
        red: generateRed(redCount),
        blue: generateBlue(blueCount),
      }
    })
  }

  // 胆拖
  return Array.from({ length: notes }, () => {
    const bankerCount = 1 + Math.floor(Math.random() * 3)
    const dragCount = 2 + Math.floor(Math.random() * 3)
    
    // 胆码优先使用固定红球的前几个
    const bankers = fixedRed.length > 0 
      ? fixedRed.slice(0, Math.min(bankerCount, fixedRed.length)) 
      : generateRed(bankerCount)

    // 拖码
    let drags: number[]
    if (fixedRed.length > bankers.length) {
      drags = fixedRed.slice(bankers.length, bankers.length + dragCount)
      if (drags.length < dragCount) {
        const need = dragCount - drags.length
        const pool = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !bankers.includes(n) && !drags.includes(n))
        drags.push(...getRandomNumsFromPool(pool, need))
      }
    } else {
      const pool = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !bankers.includes(n))
      drags = getRandomNumsFromPool(pool, dragCount)
    }

    return {
      type: 'dantuo',
      red: [...bankers, ...drags].sort((a, b) => a - b),
      blue: generateBlue(1),
      redBanker: bankers.sort((a, b) => a - b),
      redDrag: drags.sort((a, b) => a - b),
    }
  })
}

/**
 * 生成大乐透号码 (融合所有"道号"数据)
 */
export function generateDLT(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): DLTResult[] {
  // 获取用户固定的前区(红)和后区(蓝)
  const fixedFront = getUserRedNumbers().value.filter(n => n >= 1 && n <= 35)
  const fixedBack = getUserBlueNumbers().value.filter(n => n >= 1 && n <= 12)
  
  // 获取加权池
  const frontPool = getDivineNumberPools(35)
  const backPool = getDivineNumberPools(12)

  const generateFront = (count: number) => {
    if (fixedFront.length > 0 && fixedFront.length >= count) {
      return fixedFront.slice(0, count).sort((a, b) => a - b)
    }

    const picked = new Set<number>(fixedFront)
    if (frontPool.length > 0) {
      while (picked.size < count) {
        const idx = Math.floor(Math.random() * frontPool.length)
        picked.add(frontPool[idx])
      }
    }
    
    if (picked.size < count) {
      const remaining = Array.from({ length: 35 }, (_, i) => i + 1).filter(n => !picked.has(n))
      const randomPick = getRandomNumsFromPool(remaining, count - picked.size)
      randomPick.forEach(n => picked.add(n))
    }

    return Array.from(picked).sort((a, b) => a - b)
  }

  const generateBack = (count: number) => {
    if (fixedBack.length > 0 && fixedBack.length >= count) {
      return fixedBack.slice(0, count).sort((a, b) => a - b)
    }

    const picked = new Set<number>(fixedBack)
    if (backPool.length > 0) {
      while (picked.size < count) {
        const idx = Math.floor(Math.random() * backPool.length)
        picked.add(backPool[idx])
      }
    }
    
    if (picked.size < count) {
      const remaining = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => !picked.has(n))
      const randomPick = getRandomNumsFromPool(remaining, count - picked.size)
      randomPick.forEach(n => picked.add(n))
    }

    return Array.from(picked).sort((a, b) => a - b)
  }

  if (mode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      front: generateFront(5),
      back: generateBack(2),
    }))
  }

  if (mode === 'multiple') {
    return Array.from({ length: notes }, () => {
      const frontCount = Math.max(6, fixedFront.length || (6 + Math.floor(Math.random() * 4)))
      const backCount = Math.max(3, fixedBack.length || (2 + Math.floor(Math.random() * 2)))
      return {
        type: 'multiple',
        front: generateFront(frontCount),
        back: generateBack(backCount),
      }
    })
  }

  // 胆拖
  return Array.from({ length: notes }, () => {
    const bankerCount = 1 + Math.floor(Math.random() * 2)
    const dragCount = 2 + Math.floor(Math.random() * 2)

    const bankers = fixedFront.length > 0 
      ? fixedFront.slice(0, Math.min(bankerCount, fixedFront.length)) 
      : generateFront(bankerCount)

    let drags: number[]
    if (fixedFront.length > bankers.length) {
      drags = fixedFront.slice(bankers.length, bankers.length + dragCount)
      if (drags.length < dragCount) {
        const need = dragCount - drags.length
        const pool = Array.from({ length: 35 }, (_, i) => i + 1).filter(n => !bankers.includes(n) && !drags.includes(n))
        drags.push(...getRandomNumsFromPool(pool, need))
      }
    } else {
      const pool = Array.from({ length: 35 }, (_, i) => i + 1).filter(n => !bankers.includes(n))
      drags = getRandomNumsFromPool(pool, dragCount)
    }

    return {
      type: 'dantuo',
      front: [...bankers, ...drags].sort((a, b) => a - b),
      back: generateBack(2),
      frontBanker: bankers.sort((a, b) => a - b),
      frontDrag: drags.sort((a, b) => a - b),
    }
  })
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
 * 期号变量（可动态修改）
 */
export const currentIssueNumber = ref<string>('')

/**
 * 期号前缀变量（例如：260）
 */
export const currentIssuePrefix = ref<string>('')

/**
 * 期号后缀变量（例如：038）
 */
export const currentIssueSuffix = ref<string>('')

/**
 * 获取推荐期号（下一期）
 * 双色球：每周二、四、日21:00开奖，每年约150期
 * 大乐透：每周一、三、六21:00开奖，每年约156期
 *
 * 返回的是"下一期推荐"的期号：
 * - 未过21:00：显示下一期
 * - 已过21:00：开奖后自动+1
 */
export function getIssueNumber(type: 'ssq' | 'dlt'): string {
  const now = new Date()
  const year = now.getFullYear()
  const shortYear = String(year).slice(-2)

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const currentHour = now.getHours()

  let issueNum: number

  if (type === 'ssq') {
    // 双色球：26038期开奖日：2026-04-07（周二）
    const refDate = new Date(2026, 3, 7) // 2026-04-07 周二
    const refIssue = 38
    const daysDiff = Math.floor((today.getTime() - refDate.getTime()) / 86400000)

    if (daysDiff < 0) {
      // 参考日期之前
      issueNum = refIssue
    } else {
      const weeksDiff = Math.floor(daysDiff / 7)
      const daysIntoWeek = daysDiff % 7
      const refDayOfWeek = refDate.getDay() // 2 (周二)

      // 基础期数
      issueNum = refIssue + weeksDiff * 3

      // 双色球开奖日：周日(0)、周二(2)、周四(4)
      const ssqDrawDays = [0, 2, 4]

      // 计算当前周期已过的开奖日（跳过参考日本身）
      for (const drawDay of ssqDrawDays) {
        let offset = (drawDay - refDayOfWeek + 7) % 7

        // 跳过参考日（期号已包含）
        if (offset === 0) continue

        if (offset < daysIntoWeek) {
          issueNum += 1
        } else if (offset === daysIntoWeek && currentHour >= 21) {
          issueNum += 1
        }
      }

      // 推荐的是下一期，所以+1
      issueNum += 1
    }
  } else {
    // 大乐透：26036期开奖日：2026-04-06（周一）
    const refDate = new Date(2026, 3, 6) // 2026-04-06 周一
    const refIssue = 36
    const daysDiff = Math.floor((today.getTime() - refDate.getTime()) / 86400000)

    if (daysDiff < 0) {
      // 参考日期之前
      issueNum = refIssue
    } else {
      const weeksDiff = Math.floor(daysDiff / 7)
      const daysIntoWeek = daysDiff % 7
      const refDayOfWeek = refDate.getDay() // 1 (周一)

      // 基础期数
      issueNum = refIssue + weeksDiff * 3

      // 大乐透开奖日：周一(1)、周三(3)、周六(6)
      const dltDrawDays = [1, 3, 6]

      // 计算当前周期已过的开奖日（跳过参考日本身）
      for (const drawDay of dltDrawDays) {
        let offset = (drawDay - refDayOfWeek + 7) % 7

        // 跳过参考日（期号已包含）
        if (offset === 0) continue

        if (offset < daysIntoWeek) {
          issueNum += 1
        } else if (offset === daysIntoWeek && currentHour >= 21) {
          issueNum += 1
        }
      }

      // 推荐的是下一期，所以+1
      issueNum += 1
    }
  }

  // 限制在合理范围内
  issueNum = Math.min(type === 'ssq' ? 150 : 156, Math.max(1, issueNum))
  
  const issueStr = `${shortYear}${String(issueNum).padStart(3, '0')}`
  currentIssuePrefix.value = issueStr.slice(0, 3)
  currentIssueSuffix.value = issueStr.slice(3)
  
  return issueStr
}

/**
 * 手动设置期号
 */
export function setIssueNumber(issue: string) {
  currentIssueNumber.value = issue
}
