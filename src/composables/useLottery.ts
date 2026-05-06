import { ref } from 'vue'
import { generateBaguaNumbers } from './useBagua'
import { generateEnhancedNumbers } from './useFortune'
import {
  ssqBlueNumbers,
  ssqRedNumbers,
  ssqBirthday,
  ssqConstellation,
  ssqLuckyNumbers,
  ssqShengchen,
  dltBlueNumbers,
  dltRedNumbers,
  dltBirthday,
  dltConstellation,
  dltLuckyNumbers,
  dltShengchen,
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

function getUserShengchen() {
  return currentLotteryType === 'ssq' ? ssqShengchen : dltShengchen
}

// 获取生辰幸运数字
const getUserShengchenLuckyNumbers = (): number[] => {
  const shengchen = getUserShengchen().value
  if (!shengchen?.luckyNums) return []
  return shengchen.luckyNums
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
// 将多个来源的数字合并，根据出现次数分配权重，用于优先推荐
const getWeightedPool = (sources: number[][], range: [number, number]): Map<number, number> => {
  const [min, max] = range
  const weightMap = new Map<number, number>()

  // 统计每个号码在不同来源中出现的次数，作为权重
  for (const arr of sources) {
    for (const n of arr) {
      if (n >= min && n <= max) {
        weightMap.set(n, (weightMap.get(n) || 0) + 1)
      }
    }
  }

  return weightMap
}

// 根据权重从池中选取号码
const selectFromWeightedPool = (
  weightMap: Map<number, number>,
  exclude: number[],
  count: number
): number[] => {
  if (count <= 0) return []

  // 过滤已排除的号码，并按权重排序
  const candidates = Array.from(weightMap.entries())
    .filter(([num]) => !exclude.includes(num))
    .sort((a, b) => b[1] - a[1]) // 按权重降序

  const selected: number[] = []

  // 优先选择权重大于1的号码（多个来源共同推荐的号码）
  for (const [num, weight] of candidates) {
    if (selected.length >= count) break
    if (weight > 1) {
      selected.push(num)
    }
  }

  // 如果还有剩余名额，从权重为1的号码中随机选择
  if (selected.length < count) {
    const singleWeightCandidates = candidates
      .filter(([num]) => !selected.includes(num) && weightMap.get(num) === 1)
      .map(([num]) => num)

    const remaining = count - selected.length
    const shuffled = [...singleWeightCandidates].sort(() => Math.random() - 0.5)
    selected.push(...shuffled.slice(0, remaining))
  }

  return selected.sort((a, b) => a - b)
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
  const shengchenNums = getUserShengchenLuckyNumbers().filter(n => n <= maxRange)

  return getWeightedPool([birthNums, constNums, luckyNums, shengchenNums], [1, maxRange])
}

/**
 * 生成双色球号码 (融合所有"法号"数据)
 * 根据用户选择的红球/蓝球数量自动判断模式
 */
export function generateSSQ(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): SSQResult[] {
  // 获取用户固定的红蓝球
  const fixedRed = getUserRedNumbers().value.filter(n => n >= 1 && n <= 33)
  const fixedBlue = getUserBlueNumbers().value.filter(n => n >= 1 && n <= 16)

  // 获取加权池
  const redWeightMap = getDivineNumberPools(33)
  const blueWeightMap = getDivineNumberPools(16)

  // 智能合并固定号码和法号推荐（去重+组合）
  const mergeNumbers = (fixed: number[], weightMap: Map<number, number>, range: number, target: number): number[] => {
    const unique = new Set<number>(fixed)

    // 从加权池中按优先级选取（优先选择权重大于1的号码）
    if (unique.size < target) {
      const needed = target - unique.size
      const weightedSelection = selectFromWeightedPool(weightMap, fixed, needed)
      weightedSelection.forEach(n => unique.add(n))
    }

    // 不足则随机补充
    if (unique.size < target) {
      const remaining = Array.from({ length: range }, (_, i) => i + 1).filter(n => !unique.has(n))
      const randomPick = getRandomNumsFromPool(remaining, target - unique.size)
      randomPick.forEach(n => unique.add(n))
    }

    return Array.from(unique).sort((a, b) => a - b)
  }

  // 辅助生成函数
  const generateRed = (count: number, useFixed: boolean) => {
    if (!useFixed || fixedRed.length === 0) {
      return mergeNumbers([], redWeightMap, 33, count)
    }
    if (fixedRed.length >= count) {
      return [...fixedRed].slice(0, count).sort((a, b) => a - b)
    }
    return mergeNumbers(fixedRed, redWeightMap, 33, count)
  }

  const generateBlue = (count: number, useFixed: boolean) => {
    if (!useFixed || fixedBlue.length === 0) {
      return mergeNumbers([], blueWeightMap, 16, count)
    }
    if (fixedBlue.length >= count) {
      return [...fixedBlue].slice(0, count).sort((a, b) => a - b)
    }
    return mergeNumbers(fixedBlue, blueWeightMap, 16, count)
  }

  // 判断实际模式和目标数量
  let finalMode = mode
  let targetRedCount = 6
  let targetBlueCount = 1
  let useFixedRed = fixedRed.length > 0
  let useFixedBlue = fixedBlue.length > 0

  // ====== 规则判断 ======
  if (fixedRed.length === 0 && fixedBlue.length === 0) {
    // 规则1/2/3：都没选，按用户选择的模式
    if (mode === 'multiple') {
      finalMode = 'multiple'
      targetRedCount = 7 + Math.floor(Math.random() * 3) // 7-9
      targetBlueCount = 2 + Math.floor(Math.random() * 2) // 2-3
      useFixedRed = false
      useFixedBlue = false
    } else if (mode === 'dantuo') {
      finalMode = 'dantuo'
      useFixedRed = false
      useFixedBlue = false
    } else {
      finalMode = 'single'
      targetRedCount = 6
      targetBlueCount = 1
      useFixedRed = false
      useFixedBlue = false
    }
  } else if (fixedRed.length > 0 && fixedRed.length < 6 && fixedBlue.length === 0) {
    // 规则4/5/6：红球<6，蓝球未选
    if (mode === 'multiple') {
      finalMode = 'multiple'
      targetRedCount = 7 + Math.floor(Math.random() * 3) // >6
      targetBlueCount = 1
    } else if (mode === 'dantuo') {
      finalMode = 'dantuo'
      targetRedCount = 6
      targetBlueCount = 1
    } else {
      finalMode = 'single'
      targetRedCount = 6
      targetBlueCount = 1
    }
    useFixedRed = true
    useFixedBlue = false
  } else if (fixedRed.length >= 6 && fixedBlue.length === 0) {
    // 规则7/8/9/10：红球≥6，蓝球未选 → 自动复式
    finalMode = 'multiple'
    targetRedCount = Math.max(6, fixedRed.length)
    // 复式模式蓝球固定1个，胆拖模式也固定1个蓝球
    targetBlueCount = 1
    useFixedRed = true
    useFixedBlue = false
  } else if (fixedRed.length === 0 && fixedBlue.length === 1) {
    // 规则11：红球未选，蓝球=1
    if (mode === 'multiple') {
      finalMode = 'multiple'
      targetRedCount = 7 + Math.floor(Math.random() * 3) // >6
      targetBlueCount = 1
    } else if (mode === 'dantuo') {
      finalMode = 'dantuo'
      targetRedCount = 6
      targetBlueCount = 1
    } else {
      finalMode = 'single'
      targetRedCount = 6
      targetBlueCount = 1
    }
    useFixedRed = false
    useFixedBlue = true
  } else if (fixedRed.length === 0 && fixedBlue.length > 1) {
    // 规则12：红球未选，蓝球>1 → 自动复式
    finalMode = 'multiple'
    targetRedCount = 7 + Math.floor(Math.random() * 3) // >6
    targetBlueCount = fixedBlue.length
    useFixedRed = false
    useFixedBlue = true
  } else if (fixedRed.length > 0 && fixedBlue.length === 1 && fixedRed.length < 6) {
    // 规则13：红球<6，蓝球=1 → 根据用户选择的模式决定
    if (mode === 'dantuo') {
      finalMode = 'dantuo'
      targetRedCount = 6
      targetBlueCount = 1
    } else if (mode === 'multiple') {
      finalMode = 'multiple'
      targetRedCount = 7 + Math.floor(Math.random() * 3) // >6
      targetBlueCount = 1
    } else {
      finalMode = 'single'
      targetRedCount = 6
      targetBlueCount = 1
    }
    useFixedRed = true
    useFixedBlue = true
  } else if (fixedRed.length > 0 && fixedBlue.length > 0) {
    // 规则14/15：都选了，按实际数量判断
    if (fixedRed.length === 6 && fixedBlue.length === 1) {
      // 标准单式（6+1），强制单式
      finalMode = 'single'
      targetRedCount = 6
      targetBlueCount = 1
    } else if (fixedRed.length < 6 && fixedBlue.length === 1) {
      finalMode = mode === 'dantuo' ? 'dantuo' : (mode === 'multiple' ? 'multiple' : 'single')
      targetRedCount = mode === 'multiple' ? 7 + Math.floor(Math.random() * 3) : 6
      targetBlueCount = 1
    } else if (fixedRed.length >= 6 || fixedBlue.length > 1) {
      finalMode = 'multiple'
      targetRedCount = Math.max(6, fixedRed.length)
      targetBlueCount = Math.max(1, fixedBlue.length)
    }
    useFixedRed = true
    useFixedBlue = true
  }

  // ====== 生成号码 ======
  if (finalMode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      red: generateRed(targetRedCount, useFixedRed),
      blue: generateBlue(targetBlueCount, useFixedBlue),
    }))
  }

  if (finalMode === 'multiple') {
    return Array.from({ length: notes }, () => ({
      type: 'multiple',
      red: generateRed(targetRedCount, useFixedRed),
      blue: generateBlue(targetBlueCount, useFixedBlue),
    }))
  }

  // 胆拖
  return Array.from({ length: notes }, () => {
    const bankerCount = 1 + Math.floor(Math.random() * 3) // 1-3
    const dragCount = 2 + Math.floor(Math.random() * 3) // 2-4

    // 胆码
    const bankers = useFixedRed && fixedRed.length > 0
      ? fixedRed.slice(0, Math.min(bankerCount, fixedRed.length))
      : mergeNumbers([], redWeightMap, 33, bankerCount)

    // 拖码
    let drags: number[]
    if (useFixedRed && fixedRed.length > bankers.length) {
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

    // 蓝球：有固定则使用，否则从加权池选取1个
    const blues = useFixedBlue && fixedBlue.length > 0
      ? [...fixedBlue].sort((a, b) => a - b)
      : mergeNumbers([], blueWeightMap, 16, 1)

    return {
      type: 'dantuo',
      red: [...bankers, ...drags].sort((a, b) => a - b),
      blue: blues,
      redBanker: bankers.sort((a, b) => a - b),
      redDrag: drags.sort((a, b) => a - b),
    }
  })
}

/**
 * 生成大乐透号码 (融合所有"道号"数据)
 * 根据用户选择的前区/后区数量自动判断模式
 * 规则参考双色球，前区对应红球(5个)，后区对应蓝球(2个)
 */
export function generateDLT(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): DLTResult[] {
  // 获取用户固定的前区(红)和后区(蓝)
  const fixedFront = getUserRedNumbers().value.filter(n => n >= 1 && n <= 35)
  const fixedBack = getUserBlueNumbers().value.filter(n => n >= 1 && n <= 12)

  // 获取加权池
  const frontWeightMap = getDivineNumberPools(35)
  const backWeightMap = getDivineNumberPools(12)

  // 智能合并固定号码和道号推荐（去重+组合）
  const mergeNumbers = (fixed: number[], weightMap: Map<number, number>, range: number, target: number): number[] => {
    const unique = new Set<number>(fixed)

    // 从加权池中按优先级选取（优先选择权重大于1的号码）
    if (unique.size < target) {
      const needed = target - unique.size
      const weightedSelection = selectFromWeightedPool(weightMap, fixed, needed)
      weightedSelection.forEach(n => unique.add(n))
    }

    if (unique.size < target) {
      const remaining = Array.from({ length: range }, (_, i) => i + 1).filter(n => !unique.has(n))
      const randomPick = getRandomNumsFromPool(remaining, target - unique.size)
      randomPick.forEach(n => unique.add(n))
    }

    return Array.from(unique).sort((a, b) => a - b)
  }

  // 辅助生成函数
  const generateFront = (count: number, useFixed: boolean) => {
    if (!useFixed || fixedFront.length === 0) {
      return mergeNumbers([], frontWeightMap, 35, count)
    }
    if (fixedFront.length >= count) {
      return [...fixedFront].slice(0, count).sort((a, b) => a - b)
    }
    return mergeNumbers(fixedFront, frontWeightMap, 35, count)
  }

  const generateBack = (count: number, useFixed: boolean) => {
    if (!useFixed || fixedBack.length === 0) {
      return mergeNumbers([], backWeightMap, 12, count)
    }
    if (fixedBack.length >= count) {
      return [...fixedBack].slice(0, count).sort((a, b) => a - b)
    }
    return mergeNumbers(fixedBack, backWeightMap, 12, count)
  }

  // 判断实际模式和目标数量
  let finalMode = mode
  let targetFrontCount = 5
  let targetBackCount = 2
  let useFixedFront = fixedFront.length > 0
  let useFixedBack = fixedBack.length > 0

  // ====== 规则判断（参考双色球规则，前区5个，后区2个） ======
  if (fixedFront.length === 0 && fixedBack.length === 0) {
    // 规则1/2/3：都没选，按用户选择的模式
    if (mode === 'multiple') {
      finalMode = 'multiple'
      targetFrontCount = 6 + Math.floor(Math.random() * 4) // 6-9
      targetBackCount = 3 + Math.floor(Math.random() * 2) // 3-4
      useFixedFront = false
      useFixedBack = false
    } else if (mode === 'dantuo') {
      finalMode = 'dantuo'
      useFixedFront = false
      useFixedBack = false
    } else {
      finalMode = 'single'
      targetFrontCount = 5
      targetBackCount = 2
      useFixedFront = false
      useFixedBack = false
    }
  } else if (fixedFront.length > 0 && fixedFront.length < 5 && fixedBack.length === 0) {
    // 规则4/5/6：前区<5，后区未选
    if (mode === 'multiple') {
      finalMode = 'multiple'
      targetFrontCount = 6 + Math.floor(Math.random() * 4) // >5
      targetBackCount = 2
    } else if (mode === 'dantuo') {
      finalMode = 'dantuo'
      targetFrontCount = 5
      targetBackCount = 2
    } else {
      finalMode = 'single'
      targetFrontCount = 5
      targetBackCount = 2
    }
    useFixedFront = true
    useFixedBack = false
  } else if (fixedFront.length >= 5 && fixedBack.length === 0) {
    // 规则7/8/9/10：前区≥5，后区未选 → 自动复式
    finalMode = 'multiple'
    targetFrontCount = Math.max(5, fixedFront.length)
    // 复式模式后区固定2个，胆拖模式也固定2个后区
    targetBackCount = 2
    useFixedFront = true
    useFixedBack = false
  } else if (fixedFront.length === 0 && fixedBack.length === 2) {
    // 规则11：前区未选，后区=2
    if (mode === 'multiple') {
      finalMode = 'multiple'
      targetFrontCount = 6 + Math.floor(Math.random() * 4) // >5
      targetBackCount = 2
    } else if (mode === 'dantuo') {
      finalMode = 'dantuo'
      targetFrontCount = 5
      targetBackCount = 2
    } else {
      finalMode = 'single'
      targetFrontCount = 5
      targetBackCount = 2
    }
    useFixedFront = false
    useFixedBack = true
  } else if (fixedFront.length === 0 && fixedBack.length > 2) {
    // 规则12：前区未选，后区>2 → 自动复式
    finalMode = 'multiple'
    targetFrontCount = 6 + Math.floor(Math.random() * 4) // >5
    targetBackCount = fixedBack.length
    useFixedFront = false
    useFixedBack = true
  } else if (fixedFront.length > 0 && fixedBack.length === 2 && fixedFront.length < 5) {
    // 规则13：前区<5，后区=2 → 根据用户选择的模式决定
    if (mode === 'dantuo') {
      finalMode = 'dantuo'
      targetFrontCount = 5
      targetBackCount = 2
    } else if (mode === 'multiple') {
      finalMode = 'multiple'
      targetFrontCount = 6 + Math.floor(Math.random() * 4) // >5
      targetBackCount = 2
    } else {
      finalMode = 'single'
      targetFrontCount = 5
      targetBackCount = 2
    }
    useFixedFront = true
    useFixedBack = true
  } else if (fixedFront.length > 0 && fixedBack.length > 0) {
    // 规则14/15：都选了，按实际数量判断
    if (fixedFront.length === 5 && fixedBack.length === 2) {
      // 标准单式（5+2），强制单式
      finalMode = 'single'
      targetFrontCount = 5
      targetBackCount = 2
    } else if (fixedFront.length < 5 && fixedBack.length === 2) {
      finalMode = mode === 'dantuo' ? 'dantuo' : (mode === 'multiple' ? 'multiple' : 'single')
      targetFrontCount = mode === 'multiple' ? 6 + Math.floor(Math.random() * 4) : 5
      targetBackCount = 2
    } else if (fixedFront.length >= 5 || fixedBack.length > 2) {
      finalMode = 'multiple'
      targetFrontCount = Math.max(5, fixedFront.length)
      targetBackCount = Math.max(2, fixedBack.length)
    }
    useFixedFront = true
    useFixedBack = true
  }

  // ====== 生成号码 ======
  if (finalMode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      front: generateFront(targetFrontCount, useFixedFront),
      back: generateBack(targetBackCount, useFixedBack),
    }))
  }

  if (finalMode === 'multiple') {
    return Array.from({ length: notes }, () => ({
      type: 'multiple',
      front: generateFront(targetFrontCount, useFixedFront),
      back: generateBack(targetBackCount, useFixedBack),
    }))
  }

  // 胆拖
  return Array.from({ length: notes }, () => {
    const bankerCount = 1 + Math.floor(Math.random() * 2) // 1-2
    const dragCount = 2 + Math.floor(Math.random() * 2) // 2-3

    // 胆码
    const bankers = useFixedFront && fixedFront.length > 0
      ? fixedFront.slice(0, Math.min(bankerCount, fixedFront.length))
      : mergeNumbers([], frontWeightMap, 35, bankerCount)

    // 拖码
    let drags: number[]
    if (useFixedFront && fixedFront.length > bankers.length) {
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

    // 后区：有固定则使用，否则从加权池选取2个
    const backs = useFixedBack && fixedBack.length > 0
      ? [...fixedBack].sort((a, b) => a - b)
      : mergeNumbers([], backWeightMap, 12, 2)

    return {
      type: 'dantuo',
      front: [...bankers, ...drags].sort((a, b) => a - b),
      back: backs,
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
