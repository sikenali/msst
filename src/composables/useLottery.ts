import { generateBaguaNumbers } from './useBagua'
import { generateEnhancedNumbers } from './useFortune'

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

/**
 * 生成双色球号码 (基于增强算法：农历+星座+天干地支+八卦)
 */
export function generateSSQ(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): SSQResult[] {
  if (mode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      red: getEnhancedNums(1, 33, 6),
      blue: getEnhancedNums(1, 16, 1),
    }))
  }

  if (mode === 'multiple') {
    // 复式：根据注数生成多组复式号码
    return Array.from({ length: notes }, () => {
      const redCount = 7 + Math.floor(Math.random() * 4)
      const blueCount = 1 + Math.floor(Math.random() * 2)
      return {
        type: 'multiple',
        red: getEnhancedNums(1, 33, redCount),
        blue: getEnhancedNums(1, 16, blueCount),
      }
    })
  }

  // 胆拖：根据注数生成多组胆拖号码
  return Array.from({ length: notes }, () => {
    const bankerCount = 1 + Math.floor(Math.random() * 4)
    const dragCount = 2 + Math.floor(Math.random() * 4)

    const bankers = getEnhancedNums(1, 33, bankerCount)
    const remaining = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !bankers.includes(n))
    const drags = getRandomNumsFromPool(remaining, dragCount)

    return {
      type: 'dantuo',
      red: [...bankers, ...drags].sort((a, b) => a - b),
      blue: getEnhancedNums(1, 16, 1),
      redBanker: bankers,
      redDrag: drags,
    }
  })
}

/**
 * 生成大乐透号码 (基于增强算法：农历+星座+天干地支+八卦)
 */
export function generateDLT(notes: number, mode: 'single' | 'multiple' | 'dantuo' = 'single'): DLTResult[] {
  if (mode === 'single') {
    return Array.from({ length: notes }, () => ({
      type: 'single',
      front: getEnhancedNums(1, 35, 5),
      back: getEnhancedNums(1, 12, 2),
    }))
  }

  if (mode === 'multiple') {
    // 复式：根据注数生成多组复式号码
    return Array.from({ length: notes }, () => {
      const frontCount = 6 + Math.floor(Math.random() * 5)
      const backCount = 3 + Math.floor(Math.random() * 2)
      return {
        type: 'multiple',
        front: getEnhancedNums(1, 35, frontCount),
        back: getEnhancedNums(1, 12, backCount),
      }
    })
  }

  // 胆拖：根据注数生成多组胆拖号码
  return Array.from({ length: notes }, () => {
    const bankerCount = 1 + Math.floor(Math.random() * 3)
    const dragCount = 2 + Math.floor(Math.random() * 3)

    const bankers = getEnhancedNums(1, 35, bankerCount)
    const remaining = Array.from({ length: 35 }, (_, i) => i + 1).filter(n => !bankers.includes(n))
    const drags = getRandomNumsFromPool(remaining, dragCount)

    return {
      type: 'dantuo',
      front: [...bankers, ...drags].sort((a, b) => a - b),
      back: getEnhancedNums(1, 12, 2),
      frontBanker: bankers,
      frontDrag: drags,
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
  return `${shortYear}${String(issueNum).padStart(3, '0')}`
}
