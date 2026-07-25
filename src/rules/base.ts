import type { LotteryType } from './types'

export const SSQ_PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31])
export const SSQ_COMPOSITES = new Set([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33])
export const DLT_FRONT_PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31])
export const DLT_FRONT_COMPOSITES = new Set([1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35])
export const DLT_BACK_PRIMES = new Set([2, 3, 5, 7, 11])
export const DLT_BACK_COMPOSITES = new Set([1, 4, 6, 8, 9, 10, 12])

export const SSQ_ZONE_3: [number, number][] = [[1, 11], [12, 22], [23, 33]]
export const SSQ_ZONE_4: [number, number][] = [[1, 8], [9, 16], [18, 25], [26, 33]]

export const SSQ_ODD = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33])
export const SSQ_EVEN = new Set([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32])
export const DLT_FRONT_ODD = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35])
export const DLT_FRONT_EVEN = new Set([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34])

export const DLT_CROSS_ROWS: number[][] = [
  [1, 2, 3, 4, 5],       // 横标1
  [6, 7, 8, 9, 10],      // 横标2
  [11, 12, 13, 14, 15],  // 横标3
  [16, 17, 18, 19, 20],  // 横标4
  [21, 22, 23, 24, 25],  // 横标5
  [26, 27, 28, 29, 30],  // 横标6
  [31, 32, 33, 34, 35],  // 横标7
]

export const DLT_CROSS_COLS: number[][] = [
  [1, 6, 11, 16, 21, 26, 31],    // 纵标1
  [2, 7, 12, 17, 22, 27, 32],    // 纵标2
  [3, 8, 13, 18, 23, 28, 33],    // 纵标3
  [4, 9, 14, 19, 24, 29, 34],    // 纵标4
  [5, 10, 15, 20, 25, 30, 35],   // 纵标5
]

export const DLT_BACK_ROWS: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
]

export const SSQ_REMAINDER_0 = new Set([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33])
export const SSQ_REMAINDER_1 = new Set([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31])
export const SSQ_REMAINDER_2 = new Set([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32])

export const SSQ_UNIVERSAL_13 = new Set([6, 9, 10, 13, 14, 17, 21, 22, 26, 28, 29, 32, 33])

// ===== cp1.md 新常量 =====

// 九宫红球分区 (洛书九宫)
export const NINE_PALACES: Record<number, number[]> = {
  1: [1, 10, 19, 28],
  2: [2, 11, 20, 29],
  3: [3, 12, 21, 30],
  4: [4, 13, 22, 31],
  5: [5, 14, 23, 32],
  6: [6, 15, 24, 33],
  7: [7, 16, 25],
  8: [8, 17, 26],
  9: [9, 18, 27],
}

// 双子星配对 (大乐透后区)
export const TWIN_STAR_GROUPS: [number, number][] = [
  [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
]

// 五行七列矩阵 (大乐透前区)
export const FIVE_ROWS: number[][] = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 32, 33, 34, 35],
]

export const SEVEN_COLS: number[][] = Array.from(
  { length: 7 },
  (_, col) => Array.from({ length: 5 }, (_, row) => 1 + row * 7 + col)
)

// 奇异数 (双色球红球, 十位+个位=奇数)
export const SINGULAR_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 21, 23, 25, 27, 29, 30, 32, 33])
export const STABLE_NUMBERS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 28, 31])

// 尾数对码 (相加=10)
export const TAIL_PAIRS: [number, number][] = [[1, 9], [2, 8], [3, 7], [4, 6], [0, 5]]

// 新版万能13码
export const UNIVERSAL_13_NEW = {
  core: [5, 11, 24, 29],
  stable: [7, 16, 21, 23, 30],
  flexible: [8, 18, 27, 32],
  all: new Set([5, 7, 8, 11, 16, 18, 21, 23, 24, 27, 29, 30, 32]),
}

// 大乐透黄金分割锚点
export const DLT_GOLDEN_ANCHOR_A = 13
export const DLT_GOLDEN_ANCHOR_B = 22
export const DLT_GOLDEN_BACK_A = 5
export const DLT_GOLDEN_BACK_B = 7

// 蓝球质数
export const BLUE_PRIMES = new Set([2, 3, 5, 7, 11, 13])

// 双色球三区间(Zone3) + 四区间(Zone4)辅助
export const SSQ_ZONE3_RANGES = [[1, 11], [12, 22], [23, 33]]

export function isPrime(n: number): boolean {
  if (n <= 1) return false
  if (n <= 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false
  }
  return true
}

export function getTails(nums: number[]): number[] {
  return nums.map(n => n % 10)
}

export function tailFreq(nums: number[], period: number = 10): Record<number, number> {
  const freq: Record<number, number> = {}
  for (let i = 0; i <= 9; i++) freq[i] = 0
  for (const n of nums.slice(0, period)) {
    freq[n % 10]++
  }
  return freq
}

export function getMainNums(draw: number[], type: LotteryType): number[] {
  return type === 'dlt' ? draw.slice(0, 5) : draw.slice(0, 6)
}

export function sortAsc(nums: number[]): number[] {
  return [...nums].sort((a, b) => a - b)
}

export function isSingular(n: number): boolean {
  const sum = Math.floor(n / 10) + (n % 10)
  return sum % 2 === 1
}

export function numToPalace(n: number): number {
  for (const [palace, nums] of Object.entries(NINE_PALACES)) {
    if (nums.includes(n)) return parseInt(palace)
  }
  return 0
}

export function getBackNums(draw: number[], type: LotteryType): number[] {
  return type === 'dlt' ? draw.slice(5, 7) : [draw[draw.length - 1]]
}

export function missHistory(n: number, history: number[][]): number {
  let miss = 0
  for (const d of history) {
    if (d.includes(n)) break
    miss++
  }
  return miss
}

export function numFreq(history: number[][], range: number): Map<number, number> {
  const freq = new Map<number, number>()
  for (let n = 1; n <= range; n++) freq.set(n, 0)
  for (const d of history) {
    for (const n of d) freq.set(n, (freq.get(n) || 0) + 1)
  }
  return freq
}
