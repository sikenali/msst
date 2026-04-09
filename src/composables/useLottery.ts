import { ref } from 'vue'
import { generateBaguaNumbers } from './useBagua'
import { generateEnhancedNumbers } from './useFortune'
import {
  userBlueNumbers,
  userRedNumbers,
  userBirthday,
  userConstellation,
  userLuckyNumbers,
} from './useUserSelections'

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
  const { year, month, day } = userBirthday.value || {}
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
  return map[userConstellation.value] || []
}

/**
 * 获取所有法号/道号相关的加权池
 */
const getDivineNumberPools = (maxRange: number) => {
  const birthNums = getBirthdayLuckyNumbers().filter(n => n <= maxRange)
  const constNums = getConstellationLuckyNumbers().filter(n => n <= maxRange)
  const luckyNums = userLuckyNumbers.value.filter(n => n <= maxRange)

  return getWeightedPool([birthNums, constNums, luckyNums], [1, maxRange])
}

/**
 * 生成双色球号码 (融合所有"法号"数据)
 */
export function generateSSQ(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): SSQResult[] {
  // 获取用户固定的红蓝球
  const fixedRed = userRedNumbers.value.filter(n => n >= 1 && n <= 33)
  const fixedBlue = userBlueNumbers.value.filter(n => n >= 1 && n <= 16)
  
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
  const fixedFront = userRedNumbers.value.filter(n => n >= 1 && n <= 35)
  const fixedBack = userBlueNumbers.value.filter(n => n >= 1 && n <= 12)
  
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
 * 获取推荐期号（下一期）
 */
export function getIssueNumber(type: 'ssq' | 'dlt'): string {
  // 如果手动设置了期号，直接返回
  if (currentIssueNumber.value) {
    return currentIssueNumber.value
  }
  
  // 否则按日期自动生成
  const now = new Date()
  const year = now.getFullYear()
  const shortYear = String(year).slice(-2)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 简易算法：基于当前时间戳生成相对稳定的期号偏移
  const dayOfYear = Math.floor((today.getTime() - new Date(year, 0, 1).getTime()) / 86400000)
  const baseNum = (dayOfYear % 150) + 1

  return `${shortYear}${String(baseNum).padStart(3, '0')}`
}

/**
 * 手动设置期号
 */
export function setIssueNumber(issue: string) {
  currentIssueNumber.value = issue
}
