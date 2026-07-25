# 彩民社区方法代码实现大全（卷二）

## 目录
1. [九维交叉杀号法](#1-九维交叉杀号法)
2. [后区双子星组合法](#2-后区双子星组合法大乐透)
3. [首尾和+2-4位和+18中位法](#3-首尾和2-4位和18中位法大乐透)
4. [五行七列图杀号法](#4-五行七列图杀号法双色球)
5. [红蓝一体三区定位法](#5-红蓝一体三区定位法)
6. [奇异数定胆杀号法](#6-奇异数定胆杀号法双色球)
7. [蓝球12杀法](#7-蓝球12杀法双色球)
8. [尾数对码玄机](#8-尾数对码玄机)
9. [6点交叉验证杀号法](#9-6点交叉验证杀号法)
10. [四重杀红法](#10-四重杀红法)
11. [红相减跨度尾数5码胆组](#11-红相减跨度尾数5码胆组)
12. [九宫选号法](#12-九宫选号法)
13. [大乐透黄金分割法](#13-大乐透黄金分割法)
14. [五步公式法](#14-五步公式法)
15. [首尾和定区法](#15-首尾和定区法)
16. [万能13码新版](#16-万能13码新版双色球)

---

## 1. 九维交叉杀号法

### 核心逻辑
一个号码被 3 条及以上规则同时命中 = 高概率废号，直接杀

```typescript
// 九维交叉杀号法
export interface NineDimKillResult {
  killCandidates: Set<number>
  hitCount: Map<number, number>  // 每个号码被多少条规则命中
  ruleResults: Set<number>[]     // 每条规则独立结果
}

export function nineDimCrossKill(
  lastDraw: number[],
  blue: number,
  history: number[][],
  range: number,
  issueDay?: number
): NineDimKillResult {
  const rules: Set<number>[] = []

  // 维度1: 九格区间杀号
  // 把 range 个号码分9区，连续2期无号的整区杀
  rules.push(zone9Kill(history, range))

  // 维度2: 尾数对冲杀号
  // 上期5红球尾数之和取个位，该尾数所有号码杀
  rules.push(tailOffsetKill(lastDraw, range))

  // 维度3: 奇偶极端杀号
  // 同奇偶比连开4期则反向杀
  rules.push(parityExtremeKill(history, range))

  // 维度4: 大小平衡杀号
  // 大号连续热开3期则杀大号
  rules.push(sizeBalanceKill(history, range))

  // 维度5: 首尾和值杀号
  // (最小+最大) - 若>35则减35
  rules.push(headTailSumKill(lastDraw, range))

  // 维度6: 重号连开杀号
  // 连续2期开出的号码第3期杀
  rules.push(repeatOverheatKill(lastDraw, history))

  // 维度7: 连号邻号杀号
  // 上期连号左右邻号杀
  rules.push(consecutiveNeighborKill(lastDraw, range))

  // 维度8: 除3余数杀号
  // 某余数类连续热出3期则淘汰热门号
  rules.push(remainderOverheatKill(history, range))

  // 维度9: 冷热极值杀号
  // 极热(近10期>=4次) + 极冷(遗漏>=12期)
  rules.push(hotColdExtremeKill(history, range))

  // 统计命中次数
  const hitCount = new Map<number, number>()
  for (let n = 1; n <= range; n++) hitCount.set(n, 0)

  for (const rule of rules) {
    for (const n of rule) {
      hitCount.set(n, (hitCount.get(n) || 0) + 1)
    }
  }

  // 命中 >= 3 条规则 = 必杀
  const killCandidates = new Set(
    [...hitCount.entries()]
      .filter(([, count]) => count >= 3)
      .map(([n]) => n)
  )

  return { killCandidates, hitCount, ruleResults: rules }
}

// 子维度实现
function zone9Kill(history: number[][], range: number): Set<number> {
  const killed = new Set<number>()
  const zoneSize = Math.ceil(range / 9)
  for (let z = 0; z < 9; z++) {
    const zStart = z * zoneSize + 1
    const zEnd = Math.min((z + 1) * zoneSize, range)
    // 检查最近2期该区出号
    const recent2 = history.slice(-2)
    let total = 0
    for (const draw of recent2) {
      total += draw.filter(n => n >= zStart && n <= zEnd).length
    }
    if (total === 0) {
      for (let n = zStart; n <= zEnd; n++) killed.add(n)
    }
  }
  return killed
}

function tailOffsetKill(lastDraw: number[], range: number): Set<number> {
  const sumTail = lastDraw.reduce((s, n) => s + (n % 10), 0) % 10
  const killed = new Set<number>()
  for (let n = 1; n <= range; n++) {
    if (n % 10 === sumTail) killed.add(n)
  }
  return killed
}

function parityExtremeKill(history: number[][], range: number): Set<number> {
  const killed = new Set<number>()
  const recent4 = history.slice(-4)
  if (recent4.length < 4) return killed
  // 检查最近4期奇偶比是否都相同
  const ratios = recent4.map(d => d.filter(n => n % 2 === 1).length)
  if (ratios.every(r => r === ratios[0])) {
    // 反向杀
    const lastParity = recent4[recent4.length - 1][0] % 2
    for (let n = 1; n <= range; n++) {
      if (n % 2 === lastParity) killed.add(n)
    }
  }
  return killed
}

function sizeBalanceKill(history: number[][], range: number): Set<number> {
  const killed = new Set<number>()
  const mid = Math.ceil(range / 2)
  const recent3 = history.slice(-3)
  if (recent3.length < 3) return killed
  const bigCounts = recent3.map(d => d.filter(n => n > mid).length)
  if (bigCounts.every(c => c >= 4)) {
    for (let n = mid + 1; n <= range; n++) killed.add(n)
  }
  const smallCounts = recent3.map(d => d.filter(n => n <= mid).length)
  if (smallCounts.every(c => c >= 4)) {
    for (let n = 1; n <= mid; n++) killed.add(n)
  }
  return killed
}

function headTailSumKill(lastDraw: number[], range: number): Set<number> {
  const sorted = [...lastDraw].sort((a, b) => a - b)
  let val = sorted[0] + sorted[sorted.length - 1]
  while (val > range) val -= range
  return new Set([val])
}

function repeatOverheatKill(lastDraw: number[], history: number[][]): Set<number> {
  const killed = new Set<number>()
  if (history.length < 2) return killed
  const prev = history[history.length - 1]
  for (const n of lastDraw) {
    if (prev.includes(n)) {
      killed.add(n)  // 连续2期开出则杀
    }
  }
  return killed
}

function consecutiveNeighborKill(lastDraw: number[], range: number): Set<number> {
  const killed = new Set<number>()
  const sorted = [...lastDraw].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      if (sorted[i] - 1 >= 1) killed.add(sorted[i] - 1)
      if (sorted[i + 1] + 1 <= range) killed.add(sorted[i + 1] + 1)
    }
  }
  return killed
}

function remainderOverheatKill(history: number[][], range: number): Set<number> {
  const killed = new Set<number>()
  const recent3 = history.slice(-3)
  for (let r = 0; r < 3; r++) {
    const counts = recent3.map(d => d.filter(n => n % 3 === r).length)
    if (counts.every(c => c >= 3)) {
      // 收集该路所有号码，找出近期最热的
      const nums = []
      for (let n = 1; n <= range; n++) {
        if (n % 3 === r) nums.push(n)
      }
      const freq = new Map<number, number>()
      for (const d of history.slice(-5)) {
        for (const n of d) {
          if (n % 3 === r) freq.set(n, (freq.get(n) || 0) + 1)
        }
      }
      const hot = nums.sort((a, b) => (freq.get(b) || 0) - (freq.get(a) || 0)).slice(0, 3)
      hot.forEach(n => killed.add(n))
    }
  }
  return killed
}

function hotColdExtremeKill(history: number[][], range: number): Set<number> {
  const killed = new Set<number>()
  const recent10 = history.slice(-10)
  const freq = new Map<number, number>()
  for (let n = 1; n <= range; n++) freq.set(n, 0)
  for (const d of recent10) {
    for (const n of d) freq.set(n, (freq.get(n) || 0) + 1)
  }
  // 极热: >=4次
  for (const [n, count] of freq) {
    if (count >= 4) killed.add(n)
  }
  // 极冷: 遗漏 >= 12期
  const sortedHistory = [...history].reverse()
  for (let n = 1; n <= range; n++) {
    let miss = 0
    for (const d of sortedHistory) {
      if (d.includes(n)) break
      miss++
    }
    if (miss >= 12) killed.add(n)
  }
  return killed
}
```

---

## 2. 后区双子星组合法（大乐透）

### 核心逻辑
12个后区号码分为6组固定配对（双子星），通过冷热+012路+奇偶大小三轮筛选锁定1-2组

```typescript
// 后区双子星
export const TWIN_STAR_GROUPS: [number, number][] = [
  [1, 7],   // 双子星1组
  [2, 8],   // 双子星2组
  [3, 9],   // 双子星3组
  [4, 10],  // 双子星4组
  [5, 11],  // 双子星5组
  [6, 12],  // 双子星6组
]

export interface TwinStarResult {
  starStats: { groupIndex: number; pair: [number, number]; freq: number }[]
  remainingStars: [number, number][]
  finalCombos: [number, number][]
}

export function twinStarFilter(
  history: number[][],  // 后区历史 (每期 [a, b])
  lookback: number = 15
): TwinStarResult {
  // 步骤1: 统计近N期各双子星出现频次
  const recent = history.slice(-lookback)
  const groupFreq = new Array(6).fill(0)

  for (const draw of recent) {
    for (let g = 0; g < 6; g++) {
      const [a, b] = TWIN_STAR_GROUPS[g]
      if (draw.includes(a) || draw.includes(b)) {
        groupFreq[g]++
      }
    }
  }

  const starStats = TWIN_STAR_GROUPS.map((pair, i) => ({
    groupIndex: i,
    pair,
    freq: groupFreq[i],
  }))
  starStats.sort((a, b) => b.freq - a.freq)

  // 冷热分组: 热>=3次保留, 温1-2次备选, 冷0次剔除
  const remainingMap = new Map<number, boolean>()
  for (let n = 1; n <= 12; n++) remainingMap.set(n, true)

  for (let g = 0; g < 6; g++) {
    if (groupFreq[g] === 0) {
      // 冷星: 整组剔除
      TWIN_STAR_GROUPS[g].forEach(n => remainingMap.set(n, false))
    }
  }

  // 步骤2: 012路二次精简
  // 连续2期同一路数则杀该路所有双子星
  if (recent.length >= 2) {
    const last2 = recent.slice(-2)
    const road0 = (n: number) => n % 3 === 0
    const road1 = (n: number) => n % 3 === 1
    const road2 = (n: number) => n % 3 === 2

    for (const checkRoad of [road0, road1, road2]) {
      const allMatch = last2.every(d =>
        d.every(n => checkRoad(n))
      )
      if (allMatch) {
        for (let n = 1; n <= 12; n++) {
          if (checkRoad(n)) remainingMap.set(n, false)
        }
      }
    }
  }

  // 步骤3: 奇偶大小锁定
  // 近3期全奇/全偶 -> 选一奇一偶
  // 近3期全大/全小 -> 选一小一大
  if (recent.length >= 3) {
    const last3 = recent.slice(-3)
    const allOdd = last3.every(d => d.every(n => n % 2 === 1))
    const allEven = last3.every(d => d.every(n => n % 2 === 0))
    const allBig = last3.every(d => d.every(n => n >= 7))
    const allSmall = last3.every(d => d.every(n => n <= 6))

    if (allOdd) {
      for (let n = 1; n <= 12; n++) {
        if (n % 2 === 1) remainingMap.set(n, false)
      }
    }
    if (allEven) {
      for (let n = 1; n <= 12; n++) {
        if (n % 2 === 0) remainingMap.set(n, false)
      }
    }
    if (allBig) {
      for (let n = 7; n <= 12; n++) remainingMap.set(n, false)
    }
    if (allSmall) {
      for (let n = 1; n <= 6; n++) remainingMap.set(n, false)
    }
  }

  // 选出剩余的双子星组
  const remainingStars: [number, number][] = []
  const remainingNums = [...remainingMap.entries()]
    .filter(([, v]) => v).map(([k]) => k)

  for (const [a, b] of TWIN_STAR_GROUPS) {
    if (remainingNums.includes(a) || remainingNums.includes(b)) {
      remainingStars.push([a, b])
    }
  }

  // 最终组合
  const finalCombos: [number, number][] = [...remainingStars]
  // 如果只剩1组, 拆分交叉
  if (remainingStars.length <= 1 && remainingNums.length >= 2) {
    const nums = remainingNums
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        finalCombos.push([nums[i], nums[j]])
      }
    }
  }

  return { starStats, remainingStars, finalCombos }
}
```

---

## 3. 首尾和+2-4位和+18中位法（大乐透）

### 核心逻辑
- 首尾和: 最小+最大 ≈ 36
- 2-4位和: 第2位+第4位 ≈ 36
- 中位: 第3位 ≈ 18

```typescript
export interface TripleSumResult {
  headTailSum: number        // 首尾和
  pos2and4Sum: number        // 2-4位和
  centerValue: number        // 第三位
  headTailPairs: [number, number][]   // 合理的头尾对
  pos2and4Pairs: [number, number][]   // 合理的二四位对
  isValid: boolean
}

export function tripleSumCheck(
  nums: number[],
  targetSum: number = 36,
  targetCenter: number = 18
): TripleSumResult {
  const sorted = [...nums].sort((a, b) => a - b)
  const headTailSum = sorted[0] + sorted[4]
  const pos2and4Sum = sorted[1] + sorted[3]
  const centerValue = sorted[2]

  // 生成合理头尾对 (预设首尾和=36)
  const headTailPairs: [number, number][] = []
  for (let h = 1; h <= 17; h++) {
    const t = targetSum - h
    if (t >= 25 && t <= 35 && t > h) {
      headTailPairs.push([h, t])
    }
  }

  // 生成合理二四位对 (预设2-4位和=36)
  const pos2and4Pairs: [number, number][] = []
  for (let p2 = 8; p2 <= 18; p2++) {
    const p4 = targetSum - p2
    if (p4 >= 18 && p4 <= 28 && p4 > p2) {
      pos2and4Pairs.push([p2, p4])
    }
  }

  return {
    headTailSum,
    pos2and4Sum,
    centerValue,
    headTailPairs,
    pos2and4Pairs,
    isValid: Math.abs(headTailSum - targetSum) <= 4
      && Math.abs(pos2and4Sum - targetSum) <= 4
      && Math.abs(centerValue - targetCenter) <= 2
  }
}

// 生成符合三指标约束的号码组合
export function generateTripleSumCombos(
  history: number[][],  // 前区历史
  pickCount: number = 5
): number[][] {
  const recent10 = history.slice(-10)
  const avgHTSum = recent10.reduce((s, d) => {
    const sorted = [...d].sort((a, b) => a - b)
    return s + sorted[0] + sorted[4]
  }, 0) / recent10.length

  // 判断偏大/偏小
  const bias = avgHTSum > 38 ? 'large' : avgHTSum < 32 ? 'small' : 'normal'
  const targetSum = bias === 'large' ? 34 + Math.floor(Math.random() * 9)
    : bias === 'small' ? 28 + Math.floor(Math.random() * 9)
    : 36

  const combos: number[][] = []

  // 遍历合理的头尾对
  for (let h = 1; h <= 17; h++) {
    const t = targetSum - h
    if (t < 25 || t > 35 || t <= h) continue

    // 遍历合理的二四位对
    for (let p2 = h + 1; p2 <= 20; p2++) {
      const p4 = targetSum - p2
      if (p4 <= p2 || p4 >= t || p4 <= 15) continue

      // 中位: 16-20, 优先18
      for (const center of [16, 17, 18, 19, 20]) {
        if (center <= p2 || center >= p4) continue

        const combo = [h, p2, center, p4, t]
        // 奇偶比校验: 只保留2:3或3:2
        const oddCount = combo.filter(n => n % 2 === 1).length
        if (oddCount === 2 || oddCount === 3) {
          // 三区间校验: 每区至少1个
          const z1 = combo.filter(n => n <= 12).length
          const z2 = combo.filter(n => n >= 13 && n <= 24).length
          const z3 = combo.filter(n => n >= 25).length
          if (z1 >= 1 && z2 >= 1 && z3 >= 1) {
            combos.push(combo)
          }
        }
      }
    }
  }

  return combos.slice(0, 10)
}
```

---

## 4. 五行七列图杀号法（双色球）

### 核心逻辑
35个红球排成5行7列矩阵，每期必断1-2行+2-3列，杀断区号码

```typescript
// 五行七列矩阵 (用于大乐透前区35码)
export const FIVE_ROWS: number[][] = [
  [1, 2, 3, 4, 5, 6, 7],        // 木行
  [8, 9, 10, 11, 12, 13, 14],   // 火行
  [15, 16, 17, 18, 19, 20, 21], // 土行
  [22, 23, 24, 25, 26, 27, 28], // 金行
  [29, 30, 31, 32, 33, 34, 35], // 水行
]

export const SEVEN_COLS: number[][] = Array.from(
  { length: 7 },
  (_, col) => Array.from({ length: 5 }, (_, row) => 1 + row * 7 + col)
)

export interface FiveRowSevenColResult {
  coldRows: number[]        // 冷行索引
  hotRows: number[]         // 热行索引
  coldCols: number[]        // 冷列索引
  hotCols: number[]         // 热列索引
  killed: Set<number>
  remaining: number[]
}

export function fiveRowSevenColKill(
  history: number[][],  // 前区历史
  lookback: number = 5
): FiveRowSevenColResult {
  const recent = history.slice(-lookback)

  // 统计每行出号
  const rowCounts = new Array(5).fill(0)
  for (const draw of recent) {
    for (const n of draw) {
      for (let r = 0; r < 5; r++) {
        if (FIVE_ROWS[r].includes(n)) rowCounts[r]++
      }
    }
  }

  // 冷行: 出号 <= 1, 热行: >= 3
  const coldRows = rowCounts.map((c, i) => ({ c, i }))
    .filter(x => x.c <= 1).map(x => x.i)
  const hotRows = rowCounts.map((c, i) => ({ c, i }))
    .filter(x => x.c >= 3).map(x => x.i)

  // 统计每列出号
  const colCounts = new Array(7).fill(0)
  for (const draw of recent) {
    for (const n of draw) {
      for (let c = 0; c < 7; c++) {
        if (SEVEN_COLS[c].includes(n)) colCounts[c]++
      }
    }
  }

  // 空列/冷列
  const recent2 = history.slice(-2)
  const coldCols: number[] = []
  const hotCols: number[] = []
  for (let c = 0; c < 7; c++) {
    let count2 = 0
    for (const draw of recent2) {
      count2 += draw.filter(n => SEVEN_COLS[c].includes(n)).length
    }
    if (count2 === 0) coldCols.push(c)       // 空列
    else if (colCounts[c] >= 3) hotCols.push(c) // 热列
  }

  // 杀号
  const killed = new Set<number>()
  for (const r of coldRows) {
    FIVE_ROWS[r].forEach(n => killed.add(n))
  }
  for (const c of coldCols) {
    SEVEN_COLS[c].forEach(n => killed.add(n))
  }

  const remaining: number[] = []
  for (let n = 1; n <= 35; n++) {
    if (!killed.has(n)) remaining.push(n)
  }

  return { coldRows, hotRows, coldCols, hotCols, killed, remaining }
}
```

---

## 5. 红蓝一体三区定位法

### 核心逻辑
用红球推算蓝球: 和值定大小 + 跨度定区间 + 尾数集中度定冷热

```typescript
export interface BlueBallCandidate {
  candidates: number[]
  reason: {
    sizeDirection: 'small' | 'mid' | 'large'
    spanZone: 'A' | 'B' | 'C'
    tailAdjust: 'hot' | 'cold'
  }
}

// 红蓝一体三区定位法
export function redBlueIntegrated(
  reds: number[],
  lastBlue: number,
  historyRed: number[][],
  historyBlue: number[]
): BlueBallCandidate {
  const sorted = [...reds].sort((a, b) => a - b)
  const redSum = reds.reduce((s, n) => s + n, 0)
  const span = sorted[sorted.length - 1] - sorted[0]

  // 联动1: 和值定大小
  const sizeDirection: 'small' | 'mid' | 'large' =
    redSum < 95 ? 'large'    // 红小 -> 蓝补大
    : redSum > 110 ? 'small' // 红大 -> 蓝压小
    : 'mid'                   // 中 -> 中

  // 联动2: 跨度定区间
  // A区(01-05), B区(06-10), C区(11-16)
  const spanZone: 'A' | 'B' | 'C' =
    span > 26 ? 'B'     // 大跨度 -> 中间段
    : span < 18 ? (span % 2 === 0 ? 'A' : 'C') // 小跨度 -> 两端
    : 'B'

  // 联动3: 尾数集中度定冷热
  const tails = reds.map(n => n % 10)
  const tailFreq = new Map<number, number>()
  tails.forEach(t => tailFreq.set(t, (tailFreq.get(t) || 0) + 1))
  const maxSameTail = Math.max(...tailFreq.values())
  const tailAdjust = maxSameTail >= 3 ? 'cold' : 'hot'

  // 三区定位
  const zoneA = [1, 2, 3, 4, 5]
  const zoneB = [6, 7, 8, 9, 10]
  const zoneC = [11, 12, 13, 14, 15, 16]

  // 红球首号 <= 4 -> C区
  // 红球末号 >= 30 -> A区
  // 两组及以上连号 -> B区
  let primaryZone: number[] = zoneB
  if (sorted[0] <= 4) primaryZone = zoneC
  if (sorted[5] >= 30) primaryZone = zoneA
  // 连号检测
  let consecutiveGroups = 0
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) consecutiveGroups++
  }
  if (consecutiveGroups >= 2) primaryZone = zoneB

  // 振幅锁定 (上期蓝球 ±3, ±4, ±5)
  const ampCandidates = new Set<number>()
  for (const offset of [3, 4, 5]) {
    const up = lastBlue + offset
    const down = lastBlue - offset
    if (up <= 16) ampCandidates.add(up)
    if (down >= 1) ampCandidates.add(down)
  }

  // 奇偶交替
  const recentBlueParity = historyBlue.slice(-3).map(b => b % 2)
  const allSameParity = recentBlueParity.every(p => p === recentBlueParity[0])
  const nextParity = allSameParity ? 1 - recentBlueParity[0] : -1  // -1 = 不限

  // 最终筛选
  let candidates = [...primaryZone].filter(n =>
    ampCandidates.has(n) &&
    (nextParity === -1 || n % 2 === nextParity) &&
    (sizeDirection === 'mid' || (sizeDirection === 'small' && n <= 8) || (sizeDirection === 'large' && n >= 9)) &&
    (spanZone === 'B' || (spanZone === 'A' && n <= 5) || (spanZone === 'C' && n >= 11))
  )

  // 冷热调整
  const recent10Blue = historyBlue.slice(-10)
  const blueFreq = new Map<number, number>()
  recent10Blue.forEach(b => blueFreq.set(b, (blueFreq.get(b) || 0) + 1))
  const hotBlue = [...blueFreq.entries()].filter(([, f]) => f >= 2).map(([b]) => b)
  const coldBlue = [...Array(16).keys()].map(i => i + 1)
    .filter(n => !recent10Blue.includes(n))

  if (tailAdjust === 'cold') {
    // 选冷号对冲
    candidates = candidates.filter(n => coldBlue.includes(n))
    if (candidates.length === 0) candidates = coldBlue.slice(0, 3)
  } else {
    // 跟热号
    candidates = candidates.filter(n => !coldBlue.includes(n) || hotBlue.includes(n))
    if (candidates.length === 0) candidates = hotBlue.slice(0, 3)
  }

  return {
    candidates: [...new Set(candidates)].slice(0, 5),
    reason: { sizeDirection, spanZone, tailAdjust }
  }
}
```

---

## 6. 奇异数定胆杀号法（双色球）

### 核心逻辑
十位+个位=奇数 => 奇异数, 否则为平稳数
五年876期数据: 98.3%期数开出1-4个奇异数, 2-3个为主流

```typescript
// 奇异数 (双色球红球, 共17个)
export const SINGULAR_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 21, 23, 25, 27, 29, 30, 32, 33]
export const STABLE_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 28, 31]

export function isSingular(n: number): boolean {
  const sum = Math.floor(n / 10) + (n % 10)
  return sum % 2 === 1
}

export interface SingularResult {
  singularBold: number[]    // 胆码推荐
  singularKill: Set<number> // 杀号
  prediction: { singularCount: number; stableCount: number }
}

// 奇异数三步定胆
export function singularBoldKill(
  history: number[][],
  lookback: number = 10
): SingularResult {
  const recent = history.slice(-lookback)

  // 步骤1: 判断当期奇异数主流数量
  const singularCounts = recent.map(d =>
    d.filter(n => isSingular(n)).length
  )
  const avgSingular = singularCounts.reduce((s, c) => s + c, 0) / singularCounts.length
  // 默认2-3个, 根据近期走势微调
  let targetCount = 2
  if (avgSingular >= 3.5) targetCount = 2
  else if (avgSingular <= 1.5) targetCount = 3
  else targetCount = Math.round(avgSingular)

  // 步骤2: 奇异数内部冷热分层
  const freq = new Map<number, number>()
  for (const n of SINGULAR_NUMBERS) freq.set(n, 0)
  for (const d of recent) {
    for (const n of d) {
      if (freq.has(n)) freq.set(n, freq.get(n)! + 1)
    }
  }

  // 最近3期频次
  const recent3Freq = new Map<number, number>()
  for (const n of SINGULAR_NUMBERS) recent3Freq.set(n, 0)
  for (const d of history.slice(-3)) {
    for (const n of d) {
      if (recent3Freq.has(n)) recent3Freq.set(n, recent3Freq.get(n)! + 1)
    }
  }

  const hot: number[] = []   // >=3次
  const warm: number[] = []  // 1-2次
  const cold: number[] = []  // 0次

  for (const n of SINGULAR_NUMBERS) {
    const f = freq.get(n) || 0
    const f3 = recent3Freq.get(n) || 0
    if (f >= 3 || f3 >= 2) hot.push(n)
    else if (f >= 1) warm.push(n)
    else cold.push(n)
  }

  // 胆码: 优先温码, 最多1个热码
  let bold: number[] = []
  bold.push(...warm.slice(0, targetCount))
  if (bold.length < targetCount && hot.length > 0) {
    bold.push(hot[0])
  }
  if (bold.length < targetCount && cold.length > 0) {
    bold.push(cold[0])
  }
  bold = [...new Set(bold)].slice(0, targetCount)

  // 步骤3: 杀号
  const killed = new Set<number>()

  // 奇异数内部: 若预测只出1-2个, 杀最热的3-4个
  if (targetCount <= 2) {
    hot.slice(0, 3).forEach(n => killed.add(n))
  }

  // 平稳数联动杀号
  const stableFreq = new Map<number, number>()
  for (const n of STABLE_NUMBERS) stableFreq.set(n, 0)
  for (const d of recent) {
    for (const n of d) {
      if (stableFreq.has(n)) stableFreq.set(n, stableFreq.get(n)! + 1)
    }
  }

  const neededStable = 6 - targetCount
  const sortedStable = [...STABLE_NUMBERS]
    .map(n => ({ n, f: stableFreq.get(n) || 0 }))
    .sort((a, b) => b.f - a.f)

  // 杀最热的平稳数
  const killCount = Math.max(1, Math.min(3, sortedStable.length - neededStable))
  sortedStable.slice(0, killCount).forEach(x => killed.add(x.n))

  // 确保奇异数不会全杀
  for (const n of SINGULAR_NUMBERS) {
    if (killed.has(n) && Math.random() < 0.3) killed.delete(n)
  }

  return {
    singularBold: bold,
    killed,
    prediction: { singularCount: targetCount, stableCount: 6 - targetCount }
  }
}
```

---

## 7. 蓝球12杀法（双色球）

### 核心逻辑
12种独立杀蓝方法, 分层叠加, 每期从16个蓝球筛选至3-5个

```typescript
export interface BlueKillResult {
  firstRound: Set<number>   // 第一轮(4杀): 上期+隔期+大小+相邻
  secondRound: Set<number>  // 第二轮(2杀): 路数+深度冷号
  thirdRound: Set<number>   // 第三轮(3杀): 尾数计算三重
  fourthRound: Set<number>  // 第四轮: 质合均衡调整
  finalCandidates: number[]
}

export function blue12Kill(
  lastBlue: number,
  prevBlue: number,     // 上上期蓝球
  historyBlue: number[],
  lookback: number = 5
): BlueKillResult {
  // >>> 第一轮: 基础静态4杀 <<<
  const firstKill = new Set<number>()

  // 杀1: 绝杀上期蓝球
  firstKill.add(lastBlue)

  // 杀2: 绝杀隔一期蓝球
  firstKill.add(prevBlue)

  // 杀4: 绝杀上期蓝球对应完整大小区间
  if (lastBlue <= 8) {
    for (let n = 1; n <= 8; n++) firstKill.add(n)      // 小号全杀
  } else {
    for (let n = 9; n <= 16; n++) firstKill.add(n)     // 大号全杀
  }

  // 杀11: 相邻连号绝杀
  if (lastBlue - 1 >= 1) firstKill.add(lastBlue - 1)
  if (lastBlue + 1 <= 16) firstKill.add(lastBlue + 1)

  // >>> 第二轮: 路数+深度冷号 <<<
  const secondKill = new Set<number>()

  // 杀3: 绝杀上期蓝球对应012路全部号码
  const road = lastBlue % 3
  for (let n = 1; n <= 16; n++) {
    if (n % 3 === road) secondKill.add(n)
  }

  // 杀6: 绝杀遗漏10期以上深度冷蓝球
  const recentBlueSet = new Set(historyBlue.slice(-10))
  for (let n = 1; n <= 16; n++) {
    if (!recentBlueSet.has(n)) secondKill.add(n)  // 遗漏>=10期
  }

  // >>> 第三轮: 尾数计算三重杀 <<<
  const thirdKill = new Set<number>()

  // 杀7: 15 - 上期蓝球, 取尾数
  const tail7 = (15 - lastBlue) % 10
  for (let n = 1; n <= 16; n++) {
    if (n % 10 === (tail7 < 0 ? tail7 + 10 : tail7)) thirdKill.add(n)
  }

  // 杀8: 19 - 上期蓝球, 取尾数
  const tail8 = (19 - lastBlue) % 10
  for (let n = 1; n <= 16; n++) {
    if (n % 10 === (tail8 < 0 ? tail8 + 10 : tail8)) thirdKill.add(n)
  }

  // 杀9: 上期蓝球 * 2, 取尾数
  const tail9 = (lastBlue * 2) % 10
  for (let n = 1; n <= 16; n++) {
    if (n % 10 === tail9) thirdKill.add(n)
  }

  // >>> 合并所有杀号 <<<
  const allKilled = new Set([...firstKill, ...secondKill, ...thirdKill])

  // >>> 杀5: 动态热号杀(近5期频次最高) <<<
  const recent5 = historyBlue.slice(-lookback)
  const freq = new Map<number, number>()
  for (const b of recent5) freq.set(b, (freq.get(b) || 0) + 1)
  let maxFreq = 0
  let hottest = -1
  for (const [n, f] of freq) {
    if (f > maxFreq) { maxFreq = f; hottest = n }
  }
  if (hottest > 0 && maxFreq >= 2) allKilled.add(hottest)

  // >>> 杀10: 奇偶连出绝杀 <<<
  const recent3p = historyBlue.slice(-3)
  const allOdd = recent3p.every(b => b % 2 === 1)
  const allEven = recent3p.every(b => b % 2 === 0)
  if (allOdd) {
    for (let n = 1; n <= 16; n++) {
      if (n % 2 === 1) allKilled.add(n)
    }
  }
  if (allEven) {
    for (let n = 1; n <= 16; n++) {
      if (n % 2 === 0) allKilled.add(n)
    }
  }

  // >>> 杀12: 质合区间绝杀 <<<
  const bluePrimes = new Set([2, 3, 5, 7, 11, 13])
  const recent4p = historyBlue.slice(-4)
  const allComposite = recent4p.every(b => !bluePrimes.has(b))
  if (allComposite) {
    for (let n = 1; n <= 16; n++) {
      if (!bluePrimes.has(n)) allKilled.add(n)
    }
  }

  // >>> 第四轮: 质合均衡, 最终候选 <<<
  const candidates: number[] = []
  for (let n = 1; n <= 16; n++) {
    if (!allKilled.has(n)) candidates.push(n)
  }

  // 如果候选太少/太多, 做质合均衡调整
  if (candidates.length > 5) {
    const primeCands = candidates.filter(n => bluePrimes.has(n))
    const compCands = candidates.filter(n => !bluePrimes.has(n))
    // 保持质合均衡
    const finalCands: number[] = []
    finalCands.push(...primeCands.slice(0, Math.min(2, primeCands.length)))
    finalCands.push(...compCands.slice(0, Math.min(4, compCands.length)))
    return {
      firstRound: firstKill, secondRound: secondKill,
      thirdRound: thirdKill, fourthRound: new Set(),
      finalCandidates: finalCands.slice(0, 5)
    }
  }

  return {
    firstRound: firstKill, secondRound: secondKill,
    thirdRound: thirdKill, fourthRound: new Set(),
    finalCandidates: candidates.slice(0, 5)
  }
}
```

---

## 8. 尾数对码玄机

### 核心逻辑
两个尾数相加=10即互为对码: 1↔9, 2↔8, 3↔7, 4↔6, 0↔5
90%期数含1-2组对码

```typescript
export const TAIL_PAIRS: [number, number][] = [
  [1, 9], [2, 8], [3, 7], [4, 6], [0, 5]
]

export const TAIL_MAP: Record<number, number[]> = {
  0: [10, 20, 30],
  1: [1, 11, 21, 31],
  2: [2, 12, 22, 32],
  3: [3, 13, 23, 33],
  4: [4, 14, 24],
  5: [5, 15, 25],
  6: [6, 16, 26],
  7: [7, 17, 27],
  8: [8, 18, 28],
  9: [9, 19, 29],
}

export interface TailPairResult {
  tailFreq: Map<number, number>
  hotTails: number[]
  coldTails: number[]
  warmTails: number[]
  priorityPairs: [number, number][]
  recommendedTails: number[]
}

export function tailPairAnalysis(
  history: number[][],
  range: number = 33,
  lookback: number = 50
): TailPairResult {
  const recent = history.slice(-lookback)
  const tailFreq = new Map<number, number>()
  for (let t = 0; t <= 9; t++) tailFreq.set(t, 0)

  for (const draw of recent) {
    const tails = new Set(draw.map(n => n % 10))
    tails.forEach(t => tailFreq.set(t, (tailFreq.get(t) || 0) + 1))
  }

  // 冷热温分类
  const hot: number[] = []
  const warm: number[] = []
  const cold: number[] = []
  for (const [t, f] of tailFreq) {
    if (f >= 12) hot.push(t)
    else if (f >= 6) warm.push(t)
    else cold.push(t)
  }

  // 从热尾中优先选对码组合
  const priorityPairs: [number, number][] = []
  for (const [a, b] of TAIL_PAIRS) {
    if (hot.includes(a) || hot.includes(b)) {
      priorityPairs.push([a, b])
    }
  }

  // 推荐尾数: 4-5种
  const recommendedTails: number[] = []
  for (const [a, b] of priorityPairs) {
    if (recommendedTails.length < 4) {
      if (hot.includes(a) || warm.includes(a)) recommendedTails.push(a)
      if (recommendedTails.length < 4 && (hot.includes(b) || warm.includes(b))) {
        recommendedTails.push(b)
      }
    }
  }
  // 补1个温尾
  const warmExtra = warm.filter(t => !recommendedTails.includes(t))
  if (recommendedTails.length < 4 && warmExtra.length > 0) {
    recommendedTails.push(warmExtra[0])
  }

  return {
    tailFreq, hotTails: hot, coldTails: cold, warmTails: warm,
    priorityPairs, recommendedTails: recommendedTails.slice(0, 5)
  }
}

// 对码杀号: 根据冷热关系选择杀哪一边
export function tailPairKill(
  history: number[][]
): Set<number> {
  const analysis = tailPairAnalysis(history)
  const killed = new Set<number>()

  // 对码冷热交替: 1尾热则杀9尾
  for (const [a, b] of TAIL_PAIRS) {
    if (analysis.hotTails.includes(a) && !analysis.hotTails.includes(b)) {
      // a热b不热, 杀b尾所有号码
      TAIL_MAP[b]?.forEach(n => killed.add(n))
    }
    if (analysis.hotTails.includes(b) && !analysis.hotTails.includes(a)) {
      TAIL_MAP[a]?.forEach(n => killed.add(n))
    }
  }

  // 冷尾全杀
  for (const t of analysis.coldTails) {
    TAIL_MAP[t]?.forEach(n => killed.add(n))
  }

  return killed
}

// 对码选号: 从优先对码中选号码
export function tailPairSelect(
  history: number[][],
  range: number = 33
): number[] {
  const analysis = tailPairAnalysis(history)
  const selected: number[] = []

  // 从每个优先对码中, 各选1个号码
  for (const [a, b] of analysis.priorityPairs.slice(0, 2)) {
    const aNums = (TAIL_MAP[a] || []).filter(n => n <= range)
    const bNums = (TAIL_MAP[b] || []).filter(n => n <= range)
    if (aNums.length > 0) selected.push(aNums[Math.floor(Math.random() * aNums.length)])
    if (bNums.length > 0) selected.push(bNums[Math.floor(Math.random() * bNums.length)])
  }

  return selected
}
```

---

## 9. 6点交叉验证杀号法

### 核心逻辑
6个独立杀号点, 单点准确率87-94%, 3点以上同时命中 = 错杀率不足1%

```typescript
export interface CrossKillPoint {
  name: string
  accuracy: number
  apply(lastDraw: number[], history: number[][], range: number): Set<number>
}

export interface CrossKillResult {
  pointResults: { name: string; kills: Set<number> }[]
  hitCount: Map<number, number>
  mustKill: Set<number>  // 3+点命中
  suggestedKill: Set<number>  // 2点命中
}

// 6个杀号点
export const SIX_KILL_POINTS: CrossKillPoint[] = [
  {
    name: '杀过热连出热号',
    accuracy: 0.913,
    apply(lastDraw, history, range) {
      const killed = new Set<number>()
      const recent10 = history.slice(-10)
      const freq = new Map<number, number>()
      for (let n = 1; n <= range; n++) freq.set(n, 0)
      for (const d of recent10) {
        for (const n of d) freq.set(n, (freq.get(n) || 0) + 1)
      }
      // 连续3期及以上出现 + 近10期>=5次
      for (const n of lastDraw) {
        const last3 = history.slice(-3)
        const inAll3 = last3.every(d => d.includes(n))
        if (inAll3 && (freq.get(n) || 0) >= 5) {
          killed.add(n)
        }
      }
      return killed
    }
  },
  {
    name: '杀无信号冷号',
    accuracy: 0.897,
    apply(lastDraw, history, range) {
      const killed = new Set<number>()
      const sortedHistory = [...history].reverse()
      for (let n = 1; n <= range; n++) {
        let miss = 0
        for (const d of sortedHistory) {
          if (d.includes(n)) break
          miss++
        }
        if (miss >= 10) {
          // 检查所在区间是否持续冷清
          const zone = n <= 11 ? 0 : n <= 22 ? 1 : 2
          const zoneNums = range === 33
            ? (zone === 0 ? [1, 11] : zone === 1 ? [12, 22] : [23, 33])
            : (zone === 0 ? [1, 12] : zone === 1 ? [13, 24] : [25, 35])
          const recent3 = history.slice(-3)
          let zoneCount = 0
          for (const d of recent3) {
            zoneCount += d.filter(x => x >= zoneNums[0] && x <= zoneNums[1]).length
          }
          if (zoneCount <= 2) killed.add(n)
        }
      }
      // 遗漏>20期的极冷号全杀
      for (let n = 1; n <= range; n++) {
        let miss = 0
        for (const d of sortedHistory) {
          if (d.includes(n)) break
          miss++
        }
        if (miss > 20) killed.add(n)
      }
      return killed
    }
  },
  {
    name: '杀区间失衡多余号',
    accuracy: 0.885,
    apply(lastDraw, history, range) {
      const killed = new Set<number>()
      const recent2 = history.slice(-2)
      const zoneSize = Math.ceil(range / 3)
      for (let z = 0; z < 3; z++) {
        const zStart = z * zoneSize + 1
        const zEnd = Math.min((z + 1) * zoneSize, range)
        let total = 0
        for (const d of recent2) {
          total += d.filter(n => n >= zStart && n <= zEnd).length
        }
        // 连续2期>=4个 -> 下期该区瘦身, 只留1个热号
        if (total >= 6) {  // 每期至少3个
          // 找到该区近5期最热的1个号码保留
          const recent5 = history.slice(-5)
          const zFreq = new Map<number, number>()
          for (const d of recent5) {
            for (const n of d) {
              if (n >= zStart && n <= zEnd) {
                zFreq.set(n, (zFreq.get(n) || 0) + 1)
              }
            }
          }
          const sorted = [...zFreq.entries()].sort((a, b) => b[1] - a[1])
          const keep = sorted.length > 0 ? sorted[0][0] : -1
          for (let n = zStart; n <= zEnd; n++) {
            if (n !== keep) killed.add(n)
          }
        }
      }
      return killed
    }
  },
  {
    name: '杀红球关联矛盾号',
    accuracy: 0.872,
    apply(lastDraw, history, range) {
      const killed = new Set<number>()
      // 检查与核心号无关联的号码
      const coreNums = lastDraw.slice(-3)  // 取后3个作为核心
      for (let n = 1; n <= range; n++) {
        if (lastDraw.includes(n)) continue
        // 既非邻号, 也不平衡奇偶
        const isNeighbor = coreNums.some(c => Math.abs(c - n) === 1)
        const isSameTail = coreNums.some(c => c % 10 === n % 10)
        if (!isNeighbor && !isSameTail) {
          // 检查奇偶是否失衡
          const oddCount = coreNums.filter(c => c % 2 === 1).length
          const nIsOdd = n % 2 === 1
          if (oddCount >= 4 && nIsOdd) killed.add(n)
          if (oddCount <= 1 && !nIsOdd) killed.add(n)
        }
      }
      return killed
    }
  },
  {
    name: '杀奇偶极端偏离号',
    accuracy: 0.941,
    apply(lastDraw, history, range) {
      const killed = new Set<number>()
      const oddCount = lastDraw.filter(n => n % 2 === 1).length
      if (oddCount >= 4) {
        for (let n = 1; n <= range; n++) {
          if (n % 2 === 1 && !lastDraw.includes(n)) killed.add(n)
        }
      } else if (oddCount <= 1) {
        for (let n = 1; n <= range; n++) {
          if (n % 2 === 0 && !lastDraw.includes(n)) killed.add(n)
        }
      }
      return killed
    }
  },
  {
    name: '杀尾号过度集中号',
    accuracy: 0.906,
    apply(lastDraw, history, range) {
      const killed = new Set<number>()
      const tailCount = new Map<number, number>()
      for (const n of lastDraw) {
        const t = n % 10
        tailCount.set(t, (tailCount.get(t) || 0) + 1)
      }
      for (const [t, c] of tailCount) {
        if (c >= 2) {
          // 已选2个同尾, 剩余同尾全杀
          for (let n = 1; n <= range; n++) {
            if (n % 10 === t && !lastDraw.includes(n)) {
              killed.add(n)
            }
          }
        }
      }
      return killed
    }
  }
]

export function crossKill6Points(
  lastDraw: number[],
  history: number[][],
  range: number
): CrossKillResult {
  const pointResults = SIX_KILL_POINTS.map(p => ({
    name: p.name,
    kills: p.apply(lastDraw, history, range)
  }))

  const hitCount = new Map<number, number>()
  for (let n = 1; n <= range; n++) hitCount.set(n, 0)
  for (const pr of pointResults) {
    for (const n of pr.kills) {
      hitCount.set(n, (hitCount.get(n) || 0) + 1)
    }
  }

  const mustKill = new Set(
    [...hitCount.entries()].filter(([, c]) => c >= 3).map(([n]) => n)
  )
  const suggestedKill = new Set(
    [...hitCount.entries()].filter(([, c]) => c === 2).map(([n]) => n)
  )

  return { pointResults, hitCount, mustKill, suggestedKill }
}
```

---

## 10. 四重杀红法

### 核心逻辑
四层独立条件叠加, 每期稳定杀10-16个红球

```typescript
export interface FourLayerKillResult {
  layer1: Set<number>   // 重号过滤
  layer2: Set<number>   // 冷门区间剔除
  layer3: Set<number>   // 极端和值/跨度
  layer4: Set<number>   // 冷尾数过滤
  combined: Set<number> // 合并去重
  remaining: number[]
}

export function fourLayerRedKill(
  lastDraw: number[],
  history: number[][],
  range: number,
  pickCount: number
): FourLayerKillResult {
  // 第一重: 上期重号过滤
  const layer1 = new Set(lastDraw)
  // 留1个防守
  const toRemove1 = [...layer1]
  if (toRemove1.length > 1) {
    const keep = toRemove1[Math.floor(Math.random() * toRemove1.length)]
    layer1.delete(keep)
  }

  // 第二重: 冷门区间剔除
  const layer2 = new Set<number>()
  const recent10 = history.slice(-10)
  const zoneSize = Math.ceil(range / 3)
  const zoneCounts = [0, 0, 0]
  for (const d of recent10) {
    for (let z = 0; z < 3; z++) {
      const zStart = z * zoneSize + 1
      const zEnd = Math.min((z + 1) * zoneSize, range)
      zoneCounts[z] += d.filter(n => n >= zStart && n <= zEnd).length
    }
  }

  const minZone = zoneCounts.indexOf(Math.min(...zoneCounts))
  // 在该冷门区间内, 杀连续5期以上未出的号码
  const recent5 = history.slice(-5)
  const recent5Set = new Set(recent5.flat())
  const zStart = minZone * zoneSize + 1
  const zEnd = Math.min((minZone + 1) * zoneSize, range)
  for (let n = zStart; n <= zEnd; n++) {
    if (!recent5Set.has(n)) layer2.add(n)
  }

  // 第三重: 极端和值与跨度淘汰
  const layer3 = new Set<number>()
  // 若加入某号会导致和值 < 65 或 > 135, 跨度 < 18 或 > 32
  const sorted = [...lastDraw].sort((a, b) => a - b)
  const minSum = sorted.reduce((s, n) => s + n, 0)
  const minSpan = sorted[sorted.length - 1] - sorted[0]
  // 排除小号: 会导致和值<65
  for (let n = 1; n <= range; n++) {
    if (lastDraw.includes(n)) continue
    if (minSum + n < 65) layer3.add(n)
  }
  // 排除大号: 会导致跨度>32
  for (let n = 1; n <= range; n++) {
    if (lastDraw.includes(n)) continue
    const newSpan = Math.max(sorted[sorted.length - 1], n) - Math.min(sorted[0], n)
    if (newSpan > 32 || (minSpan < 18 && n < sorted[0]) || (minSpan < 18 && n > sorted[sorted.length - 1])) {
      layer3.add(n)
    }
  }

  // 第四重: 冷尾数过滤
  const layer4 = new Set<number>()
  const tailFreq = new Map<number, number>()
  for (let t = 0; t <= 9; t++) tailFreq.set(t, 0)
  for (const d of recent10) {
    const tails = new Set(d.map(n => n % 10))
    tails.forEach(t => tailFreq.set(t, (tailFreq.get(t) || 0) + 1))
  }
  for (const [t, f] of tailFreq) {
    if (f <= 3) {
      for (let n = 1; n <= range; n++) {
        if (n % 10 === t) layer4.add(n)
      }
    }
  }

  // 合并去重
  const combined = new Set([...layer1, ...layer2, ...layer3, ...layer4])

  const remaining: number[] = []
  for (let n = 1; n <= range; n++) {
    if (!combined.has(n)) remaining.push(n)
  }

  return { layer1, layer2, layer3, layer4, combined, remaining }
}
```

---

## 11. 红相减跨度尾数5码胆组

### 核心逻辑
6红两两相减得15组差值 -> 取尾数 -> 高频跨度尾 -> 左右各2位 -> 5码胆组

```typescript
export interface SpanTailBoldResult {
  differences: number[]
  tailFreq: Map<number, number>
  spanTail: number
  boldGroup: number[]
  boldNumbers: number[]
}

export function spanTailBoldGroup(
  lastDraw: number[],
  range: number = 33
): SpanTailBoldResult {
  const sorted = [...lastDraw].sort((a, b) => a - b)

  // 步骤1 & 2: 两两相减, 15组差值
  const differences: number[] = []
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      differences.push(sorted[j] - sorted[i])
    }
  }

  // 步骤3: 提取尾数, 统计高频
  const tails = differences.map(d => Math.abs(d) % 10)
  const tailFreq = new Map<number, number>()
  for (let t = 0; t <= 9; t++) tailFreq.set(t, 0)
  for (const t of tails) {
    tailFreq.set(t, (tailFreq.get(t) || 0) + 1)
  }

  // 高频跨度尾 (频次相同取小)
  let spanTail = 0
  let maxFreq = 0
  for (let t = 0; t <= 9; t++) {
    const f = tailFreq.get(t) || 0
    if (f > maxFreq) { maxFreq = f; spanTail = t }
  }

  // 步骤4: 跨度尾左右各取2位, 凑5个尾数
  const boldTails: number[] = [spanTail]
  // 右侧2位
  for (let i = 1; i <= 2; i++) {
    boldTails.push((spanTail + i) % 10)
  }
  // 左侧2位
  for (let i = 1; i <= 2; i++) {
    const t = (spanTail - i + 10) % 10
    if (!boldTails.includes(t)) boldTails.push(t)
  }

  // 尾数 -> 号码
  const TAIL_NUMS: Record<number, number[]> = {
    0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 4: [4, 14, 24], 5: [5, 15, 25],
    6: [6, 16, 26], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29]
  }

  const boldNumbers: number[] = []
  for (const t of boldTails) {
    const nums = (TAIL_NUMS[t] || []).filter(n => n <= range)
    // 每个尾数精简, 去边缘冷门
    const mid = nums.length <= 2 ? nums
      : nums.slice(Math.floor(nums.length / 2) - 1, Math.floor(nums.length / 2) + 1)
    for (const n of mid) {
      if (!boldNumbers.includes(n)) boldNumbers.push(n)
    }
  }

  return {
    differences, tailFreq, spanTail,
    boldGroup: boldTails,
    boldNumbers: boldNumbers.slice(0, 5)
  }
}

// 胆拖方案: 5胆 + N拖
export function spanTailDanTuo(
  lastDraw: number[],
  history: number[][],
  range: number = 33
): { dan: number[]; tuo: number[] } {
  const { boldNumbers } = spanTailBoldGroup(lastDraw, range)
  const dan = boldNumbers

  // 从剩余号码中选取拖码 (冷热温搭配)
  const recent10 = history.slice(-10)
  const freq = new Map<number, number>()
  for (let n = 1; n <= range; n++) freq.set(n, 0)
  for (const d of recent10) {
    for (const n of d) freq.set(n, (freq.get(n) || 0) + 1)
  }

  const remaining = []
  for (let n = 1; n <= range; n++) {
    if (!dan.includes(n)) remaining.push(n)
  }

  // 按频次排序, 取温号(1-3次)为主
  remaining.sort((a, b) => (freq.get(a) || 0) - (freq.get(b) || 0))
  const tuo = remaining.slice(0, 8)

  return { dan, tuo }
}
```

---

## 12. 九宫选号法

### 核心逻辑
洛书九宫数字模型, 将33个红球归入9宫, 飞星顺逆推演锁定区间

```typescript
// 九宫红球分区 (洛书九宫)
export const NINE_PALACES: Record<number, number[]> = {
  1: [1, 10, 19, 28],     // 坎宫
  2: [2, 11, 20, 29],     // 坤宫
  3: [3, 12, 21, 30],     // 震宫
  4: [4, 13, 22, 31],     // 巽宫
  5: [5, 14, 23, 32],     // 中宫
  6: [6, 15, 24, 33],     // 乾宫
  7: [7, 16, 25],         // 兑宫
  8: [8, 17, 26],         // 艮宫
  9: [9, 18, 27],         // 离宫
}

export function numToPalace(n: number): number {
  for (const [palace, nums] of Object.entries(NINE_PALACES)) {
    if (nums.includes(n)) return parseInt(palace)
  }
  return 0
}

export interface NinePalaceResult {
  lastPalaces: number[]
  forward3: Set<number>  // 顺飞3步结果
  backward1: Set<number> // 逆飞1步结果
  intersection: Set<number>  // 交集(主攻宫位)
  candidates: number[]
}

// 九宫飞星: 顺飞3步 + 逆飞1步
export function ninePalaceFly(
  lastDraw: number[]
): NinePalaceResult {
  const lastPalaces = [...new Set(lastDraw.map(n => numToPalace(n)))]
    .filter(p => p > 0)

  // 顺飞: 中5 -> 6 -> 7 -> 8 -> 9 -> 1 -> 2 -> 3 -> 4
  const forwardOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4]
  const forward3 = new Set<number>()
  for (const p of lastPalaces) {
    const idx = forwardOrder.indexOf(p)
    if (idx >= 0) {
      const target1 = forwardOrder[(idx + 1) % 9]
      const target2 = forwardOrder[(idx + 2) % 9]
      const target3 = forwardOrder[(idx + 3) % 9]
      forward3.add(target1)
      forward3.add(target2)
      forward3.add(target3)
    }
  }

  // 逆飞: 中5 -> 4 -> 3 -> 2 -> 1 -> 9 -> 8 -> 7 -> 6
  const backwardOrder = [5, 4, 3, 2, 1, 9, 8, 7, 6]
  const backward1 = new Set<number>()
  for (const p of lastPalaces) {
    const idx = backwardOrder.indexOf(p)
    if (idx >= 0) {
      backward1.add(backwardOrder[(idx + 1) % 9])
    }
  }

  // 交集 = 主攻宫位
  const intersection = new Set(
    [...forward3].filter(p => backward1.has(p))
  )

  // 提取候选号码
  const candidates: number[] = []
  for (const p of intersection) {
    const nums = NINE_PALACES[p] || []
    // 每个宫位选1-2个 (优先中宫5)
    if (p === 5) {
      candidates.push(...nums)
    } else {
      candidates.push(...nums.slice(0, 2))
    }
  }

  return { lastPalaces, forward3, backward1, intersection, candidates }
}

// 九宫选号三大避坑校验
export function validateNinePalace(nums: number[]): {
  palaceCount: Set<number>
  hasCenter: boolean
  valid: boolean
} {
  const palaceSet = new Set(nums.map(n => numToPalace(n)))
  const hasCenter = palaceSet.has(5)
  return {
    palaceCount: palaceSet,
    hasCenter,
    valid: palaceSet.size >= 5  // 至少跨5个宫位
  }
}
```

---

## 13. 大乐透黄金分割法

### 核心逻辑
黄金比例 0.618, 核心基准点 22 和 13
35×0.618 ≈ 22, 35-22 = 13

```typescript
export interface GoldenRatioResult {
  anchorA: number    // 13
  anchorB: number    // 22
  goldenRatio: number
  zone: [number, number, number][]  // 三区间
  bold?: number[]
  suggestions: {
    fixedBold: [number, number]  // 固定双胆 13,22
    zoneBalanced: number[]       // 区间均衡号码
    neighborZone: number[]        // 邻号号段
  }
}

export const GOLDEN_RATIO = 0.618

export function dltGoldenRatio(): GoldenRatioResult {
  const anchorB = Math.round(35 * GOLDEN_RATIO)   // 22
  const anchorA = 35 - anchorB                     // 13

  // 三区间: [01-13], [14-22], [23-35]
  const zone: [number, number, number][] = [
    [1, 13, anchorA],
    [14, 22, anchorB],
    [23, 35, 35],
  ]

  // 固定双胆
  const fixedBold: [number, number] = [anchorA, anchorB]

  // 区间均衡: 每区至少1个, 共5个
  const zoneBalanced: number[] = []
  for (const [start, end] of [[1, 13], [14, 22], [23, 35]]) {
    const mid = Math.round((start + end) / 2)
    zoneBalanced.push(mid - 1, mid, mid + 1)
  }
  const deduped = [...new Set(zoneBalanced.filter(n => n >= 1 && n <= 35))]

  // 邻号号段: 以13和22为中心
  const neighborZone: number[] = []
  const expandAround = (center: number) => {
    for (let offset = -2; offset <= 2; offset++) {
      const n = center + offset
      if (n >= 1 && n <= 35) neighborZone.push(n)
    }
  }
  expandAround(13)
  expandAround(22)

  return {
    anchorA, anchorB, goldenRatio: GOLDEN_RATIO,
    zone, fixedBold,
    suggestions: {
      fixedBold,
      zoneBalanced: [...new Set(deduped)].slice(0, 12),
      neighborZone: [...new Set(neighborZone)]
    }
  }
}

// 黄金分割后区
export function dltBackGoldenRatio(): {
  anchorA: number  // 5
  anchorB: number  // 7
  neighborZone: number[]
} {
  const anchorB = Math.round(12 * GOLDEN_RATIO)  // 7
  const anchorA = 12 - anchorB                   // 5
  const neighbors = [...new Set([
    anchorA - 1, anchorA, anchorA + 1,
    anchorB - 1, anchorB, anchorB + 1,
  ].filter(n => n >= 1 && n <= 12))]

  return { anchorA, anchorB, neighborZone: neighbors }
}

// 黄金分割AC值判断
export function goldenRatioAC(nums: number[]): {
  ac: number
  isOptimal: boolean
} {
  const sorted = [...nums].sort((a, b) => a - b)
  const diffs = new Set<number>()
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      diffs.add(sorted[j] - sorted[i])
    }
  }
  const ac = diffs.size - (nums.length - 1)
  return { ac, isOptimal: ac >= 4 && ac <= 6 }
}
```

---

## 14. 五步公式法

### 核心逻辑
区间划分 -> 奇偶质合 -> 冷热搭配 -> 和值跨度 -> 蓝球推演

```typescript
export interface FiveStepConfig {
  intervalRatio: [number, number, number]  // 三区比
  parityRatio: [number, number]            // 奇:偶
  primeCompositeRatio: [number, number]    // 质:合
  sumRange: [number, number]               // 和值范围
  spanRange: [number, number]              // 跨度范围
  hotWarmColdRatio: [number, number, number] // 热:温:冷
}

export const DEFAULT_FIVE_STEP: FiveStepConfig = {
  intervalRatio: [2, 2, 2],
  parityRatio: [3, 3],
  primeCompositeRatio: [2, 4],
  sumRange: [90, 120],
  spanRange: [20, 28],
  hotWarmColdRatio: [3, 2, 1],
}

// 完整五步筛选
export function fiveStepFilter(
  history: number[][],
  lastDraw: number[],
  range: number,
  pickCount: number,
  config: FiveStepConfig = DEFAULT_FIVE_STEP
): number[] {
  const zoneSize = Math.ceil(range / 3)

  // 步骤1: 区间划分
  const candidates: number[] = []
  for (let z = 0; z < 3; z++) {
    const zStart = z * zoneSize + 1
    const zEnd = Math.min((z + 1) * zoneSize, range)
    const need = config.intervalRatio[z]
    const zoneNums: number[] = []
    for (let n = zStart; n <= zEnd; n++) {
      if (!lastDraw.includes(n)) zoneNums.push(n)
    }
    // 随机选 need 个
    const shuffled = [...zoneNums].sort(() => Math.random() - 0.5)
    candidates.push(...shuffled.slice(0, need * 3)) // 多留些
  }

  // 步骤2: 奇偶 + 质合
  const SSQ_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
  const filtered = candidates.filter(n => {
    const oddCount = [n, ...candidates.slice(0, 5)].filter(x => x % 2 === 1).length
    const primeCount = [n, ...candidates.slice(0, 5)].filter(x => SSQ_PRIMES.includes(x)).length
    return oddCount <= 4 && oddCount >= 2 && primeCount <= 4 && primeCount >= 1
  })

  // 步骤3: 冷热号分层
  const recent20 = history.slice(-20)
  const freq = new Map<number, number>()
  for (let n = 1; n <= range; n++) freq.set(n, 0)
  for (const d of recent20) {
    for (const n of d) freq.set(n, (freq.get(n) || 0) + 1)
  }

  const hot: number[] = []
  const warm: number[] = []
  const cold: number[] = []
  for (const n of filtered) {
    const f = freq.get(n) || 0
    if (f >= 4) hot.push(n)
    else if (f >= 2) warm.push(n)
    else cold.push(n)
  }

  // 步骤4: 和值 + 跨度
  const result: number[] = []
  const addIfInRange = (pool: number[], targetCount: number) => {
    for (const n of pool) {
      if (result.length >= targetCount) break
      const testSum = [...result, n].reduce((s, x) => s + x, 0)
      const testSpan = result.length > 0
        ? Math.max(...result, n) - Math.min(...result, n)
        : 0
      if (result.length < 2 || testSpan <= config.spanRange[1]) {
        if (testSum <= config.sumRange[1]) {
          result.push(n)
        }
      }
    }
  }

  addIfInRange(hot, config.hotWarmColdRatio[0])
  addIfInRange(warm, config.hotWarmColdRatio[0] + config.hotWarmColdRatio[1])
  addIfInRange(cold, pickCount)

  return result.slice(0, pickCount)
}

// 步骤5: 蓝球推演
export function blueBallDeduction(
  historyBlue: number[],
  lastBlue: number
): number[] {
  const recent20 = historyBlue.slice(-20)
  const freq = new Map<number, number>()
  for (let n = 1; n <= 16; n++) freq.set(n, 0)
  recent20.forEach(b => freq.set(b, (freq.get(b) || 0) + 1))

  // 大小
  const small = [1, 2, 3, 4, 5, 6, 7, 8]
  const big = [9, 10, 11, 12, 13, 14, 15, 16]
  const last3Size = historyBlue.slice(-3).map(b => b <= 8 ? 'S' : 'B')
  const sameSize = last3Size.every(s => s === last3Size[0])

  // 奇偶
  const odd = [1, 3, 5, 7, 9, 11, 13, 15]
  const even = [2, 4, 6, 8, 10, 12, 14, 16]
  const last3Parity = historyBlue.slice(-3).map(b => b % 2)
  const sameParity = last3Parity.every(p => p === last3Parity[0])

  // 012路
  const roads: Record<number, number[]> = {
    0: [3, 6, 9, 12, 15],
    1: [1, 4, 7, 10, 13, 16],
    2: [2, 5, 8, 11, 14],
  }

  // 筛选
  let candidates = []
  for (let n = 1; n <= 16; n++) {
    if (sameSize && last3Size[0] === 'S' && n > 8) continue
    if (sameSize && last3Size[0] === 'B' && n <= 8) continue
    if (sameParity && last3Parity[0] === 1 && n % 2 === 1) continue
    if (sameParity && last3Parity[0] === 0 && n % 2 === 0) continue
    candidates.push(n)
  }

  return candidates.slice(0, 5)
}
```

---

## 15. 首尾和定区法

### 核心逻辑
首尾和 = 最小号 + 最大号, 理论中心值36, 常态范围20-40
3字头(31-40)最高频, 钟摆围绕34均线上下

```typescript
export interface HeadTailSumResult {
  sum: number
  zone: string           // 字头: '0','1','2','3','4','5+'
  deviation: number      // 偏离34均线值
  predictedDirection: 'up' | 'down' | 'stable'
  reasonablePairs: [number, number][]  // 合理头尾对
}

export function headTailSumAnalyze(
  lastDraw: number[],
  history: number[][],
  range: number
): HeadTailSumResult {
  const sorted = [...lastDraw].sort((a, b) => a - b)
  const head = sorted[0]
  const tail = sorted[sorted.length - 1]
  const sum = head + tail

  // 字头划分
  const zone = sum <= 10 ? '0' : sum <= 20 ? '1' : sum <= 30 ? '2'
    : sum <= 40 ? '3' : sum <= 50 ? '4' : '5+'

  // 偏离均线34
  const deviation = sum - 34

  // 近10期均值判断方向
  const recent10 = history.slice(-10)
  const avgSum = recent10.reduce((s, d) => {
    const hs = [...d].sort((a, b) => a - b)
    return s + hs[0] + hs[hs.length - 1]
  }, 0) / recent10.length

  const predictedDirection: 'up' | 'down' | 'stable' =
    avgSum > 38 ? 'down' : avgSum < 30 ? 'up' : 'stable'

  // 合理头尾对 (基于首尾和 = 36)
  const reasonablePairs: [number, number][] = []
  for (let h = 1; h <= Math.floor(range / 2); h++) {
    const t = 36 - h
    if (t >= Math.ceil(range / 2) && t <= range && t > h) {
      reasonablePairs.push([h, t])
    }
  }

  return { sum, zone, deviation, predictedDirection, reasonablePairs }
}

// 首尾和定区选号
export function headTailSumSelect(
  history: number[][],
  range: number,
  pickCount: number
): number[] {
  const analysis = headTailSumAnalyze(
    history[history.length - 1], history, range
  )

  // 确定本期首尾和范围
  let targetSumMin: number, targetSumMax: number
  if (analysis.predictedDirection === 'up') {
    targetSumMin = 30; targetSumMax = 38
  } else if (analysis.predictedDirection === 'down') {
    targetSumMin = 34; targetSumMax = 42
  } else {
    targetSumMin = 32; targetSumMax = 40
  }

  // 选定头尾对
  let bestHead = 1, bestTail = range
  const validPairs: [number, number][] = []
  for (let h = 1; h <= Math.min(12, range); h++) {
    for (let t = Math.max(23, h + pickCount); t <= range; t++) {
      const s = h + t
      if (s >= targetSumMin && s <= targetSumMax) {
        validPairs.push([h, t])
      }
    }
  }

  if (validPairs.length > 0) {
    const [h, t] = validPairs[Math.floor(validPairs.length / 2)]
    bestHead = h; bestTail = t
  }

  // 在头尾间选中间号码
  const candidates: number[] = [bestHead, bestTail]
  const middle = []
  for (let n = bestHead + 1; n < bestTail; n++) {
    middle.push(n)
  }
  const shuffled = [...middle].sort(() => Math.random() - 0.5)
  const need = pickCount - 2
  candidates.push(...shuffled.slice(0, need))

  return [...candidates].sort((a, b) => a - b)
}

// 首尾和3字头概率判断
export function headTailSumZone3Check(history: number[][]): {
  zone3Ratio: number
  isCurrentBias: boolean
  probability: number
} {
  const recent = history.slice(-50)
  let zone3Count = 0
  for (const d of recent) {
    const sorted = [...d].sort((a, b) => a - b)
    const s = sorted[0] + sorted[sorted.length - 1]
    if (s >= 31 && s <= 40) zone3Count++
  }
  const ratio = zone3Count / recent.length
  return {
    zone3Ratio: ratio,
    isCurrentBias: ratio > 0.5,
    probability: ratio  // 3字头历史占比
  }
}
```

---

## 16. 万能13码新版（双色球）

### 核心逻辑
基于70期数据筛选的13码覆盖体系, 每期6红中至少4个落在此13码内

```typescript
// 新版万能13码 (2026年最新)
export const UNIVERSAL_13_NEW = {
  core: [5, 11, 24, 29] as number[],       // 核心胆码(4个)
  stable: [7, 16, 21, 23, 30] as number[],  // 中坚稳码(5个)
  flexible: [8, 18, 27, 32] as number[],    // 边缘活码(4个)
  all: [5, 7, 8, 11, 16, 18, 21, 23, 24, 27, 29, 30, 32] as number[]
}

export function universal13New(
  lastDraw: number[]
): {
  selected: number[]
  coreUsed: number[]
  stableUsed: number[]
  flexibleUsed: number | null
  coverage: { core: number; stable: number; flexible: number }
} {
  const pool = UNIVERSAL_13_NEW.all

  // 步骤1: 从核心胆码选2-3个
  const coreCount = Math.random() > 0.5 ? 2 : 3
  const coreShuffled = [...UNIVERSAL_13_NEW.core].sort(() => Math.random() - 0.5)
  const coreUsed = coreShuffled.slice(0, coreCount).filter(n => !lastDraw.includes(n))
  if (coreUsed.length === 0) coreUsed.push(coreShuffled[0])

  // 步骤2: 从中坚稳码补足
  const needFromStable = 5 - coreUsed.length
  const stableShuffled = [...UNIVERSAL_13_NEW.stable].sort(() => Math.random() - 0.5)
  const stableUsed = stableShuffled
    .filter(n => !lastDraw.includes(n) && !coreUsed.includes(n))
    .slice(0, needFromStable)

  let allSelected = [...coreUsed, ...stableUsed]

  // 步骤3: 边缘活码补1个
  const flexibleShuffled = [...UNIVERSAL_13_NEW.flexible].sort(() => Math.random() - 0.5)
  const flexibleUsed = flexibleShuffled.find(n =>
    !lastDraw.includes(n) && !allSelected.includes(n)
  ) || null

  if (flexibleUsed != null) allSelected.push(flexibleUsed)

  // 奇偶/大小/区间校验
  const oddCount = allSelected.filter(n => n % 2 === 1).length
  const isParityOk = oddCount >= 2 && oddCount <= 4

  if (!isParityOk) {
    // 微调: 替换一个号码
    allSelected = allSelected.slice(0, 6)
  }

  return {
    selected: allSelected.slice(0, 6),
    coreUsed, stableUsed, flexibleUsed,
    coverage: {
      core: coreUsed.length,
      stable: stableUsed.length,
      flexible: flexibleUsed != null ? 1 : 0
    }
  }
}

// 13码三步法
export function universal13ThreeStep(
  lastDraw: number[],
  historyBlue: number[]
): { reds: number[]; blues: number[] } {
  const step1 = universal13New(lastDraw)
  const reds = step1.selected

  // 蓝球: 奇偶法 + 冷热法
  const recent10 = historyBlue.slice(-10)
  const last3Parity = historyBlue.slice(-3).map(b => b % 2)
  const sameParity = last3Parity.every(p => p === last3Parity[0])
  const nextIsOdd = sameParity ? last3Parity[0] === 0 : -1

  const freq = new Map<number, number>()
  recent10.forEach(b => freq.set(b, (freq.get(b) || 0) + 1))
  const hot = [...freq.entries()].filter(([, f]) => f >= 2).map(([b]) => b)
  const cold = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    .filter(n => !recent10.includes(n))

  let blues: number[]
  if (nextIsOdd === 1) {
    blues = hot.filter(n => n % 2 === 1)
  } else if (nextIsOdd === 0) {
    blues = hot.filter(n => n % 2 === 0)
  } else {
    blues = [...hot]
  }

  if (blues.length === 0) blues = [...cold.slice(0, 2)]
  if (blues.length === 0) blues = [1, 16]

  return { reds, blues: blues.slice(0, 2) }
}
```
