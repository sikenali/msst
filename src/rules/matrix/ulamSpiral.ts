import type { MatrixRule } from '../types'
import { isPrime } from '../base'

export const ulamSpiral: MatrixRule = {
  name: '乌拉姆螺旋矩阵',
  description: '质数对角线聚集，合数侧边聚集，优化选号结构',
  apply(pool: number[], pickCount: number, guarantee: string = ''): number[][] {
    const INNER: number[] = [2, 3, 5, 7, 9, 8, 6, 4]
    const MID: number[] = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    const OUTER: number[] = [26, 27, 28, 29, 30, 31, 32, 33]
    const diagonalPrimes = INNER.filter(n => isPrime(n)).concat(
      [11, 13, 17, 19, 23],
      [29, 31]
    )
    const sideComposites = INNER.filter(n => !isPrime(n) && n > 1).concat(
      [10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25],
      [26, 27, 28, 30, 32, 33]
    )
    const primeCount = Math.floor(pickCount * 0.5)
    const compCount = pickCount - primeCount
    const selectedPrimes = [...diagonalPrimes].sort(() => Math.random() - 0.5).slice(0, primeCount)
    const selectedComps = [...sideComposites].sort(() => Math.random() - 0.5).slice(0, compCount)
    const combination = [...selectedPrimes, ...selectedComps]
      .filter(n => n >= 1 && n <= 33)
      .sort((a, b) => a - b)
    return [combination]
  },
}

export function spiralLayer(n: number): 'inner' | 'mid' | 'outer' {
  if (n <= 9) return 'inner'
  if (n <= 25) return 'mid'
  return 'outer'
}

export function generateSpiralCombination(
  innerCount: number = 1,
  midCount: number = 3,
  outerCount: number = 2,
  primeRatio: '3:3' | '2:4' | '4:2' = '3:3'
): number[] {
  const innerNums = Array.from({ length: 9 }, (_, i) => i + 1)
  const midNums = Array.from({ length: 16 }, (_, i) => i + 10)
  const outerNums = Array.from({ length: 8 }, (_, i) => i + 26)
  const allNums = [...innerNums, ...midNums, ...outerNums]
  const primes = allNums.filter(n => isPrime(n))
  const composites = allNums.filter(n => !isPrime(n) && n > 1)
  const [pTarget, cTarget] = primeRatio.split(':').map(Number)
  const fromInner = innerNums.sort(() => Math.random() - 0.5).slice(0, innerCount)
  const fromMid = midNums.sort(() => Math.random() - 0.5).slice(0, midCount)
  const fromOuter = outerNums.sort(() => Math.random() - 0.5).slice(0, outerCount)
  const candidates = [...fromInner, ...fromMid, ...fromOuter]
  const candidatePrimes = candidates.filter(n => isPrime(n))
  const candidateComps = candidates.filter(n => !isPrime(n) && n > 1)
  const result: number[] = []
  const extraPrimes = primes.filter(n => !candidatePrimes.includes(n)).sort(() => Math.random() - 0.5)
  const extraComps = composites.filter(n => !candidateComps.includes(n)).sort(() => Math.random() - 0.5)
  for (const n of candidatePrimes) { if (result.filter(x => isPrime(x)).length < pTarget) result.push(n) }
  for (const n of candidateComps) { if (result.filter(x => !isPrime(x) && x > 1).length < cTarget) result.push(n) }
  while (result.filter(n => isPrime(n)).length < pTarget && extraPrimes.length > 0) {
    result.push(extraPrimes.shift()!)
  }
  while (result.filter(n => !isPrime(n) && n > 1).length < cTarget && extraComps.length > 0) {
    result.push(extraComps.shift()!)
  }
  return result.sort((a, b) => a - b)
}
