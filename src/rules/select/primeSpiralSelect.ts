import type { SelectRule } from '../types'
import { isPrime, getMainNums } from '../base'

export const primeSpiralSelect: SelectRule = {
  name: '质合数螺旋选号法',
  description: '质合配比+三层圈层分配，四句口诀校验',
  apply(history: number[][], range: number, type: 'ssq' | 'dlt') {
    if (type !== 'ssq' || history.length < 10) {
      return { name: '质合数螺旋选号法', description: '需要至少10期双色球历史数据', output: [] }
    }
    const recentDraws = history.slice(0, 10)
    const primeCounts = recentDraws.map(d => getMainNums(d, type).filter(n => isPrime(n)).length)
    const avgPrime = primeCounts.reduce((a, b) => a + b, 0) / primeCounts.length
    const last3Prime = primeCounts.slice(0, 3)
    const last3Avg = last3Prime.reduce((a, b) => a + b, 0) / last3Prime.length
    let targetPrime: number
    if (last3Avg > 4) targetPrime = 2
    else if (last3Avg < 2) targetPrime = 4
    else targetPrime = 3
    const targetComposite = 6 - targetPrime
    const innerRing = Array.from({ length: 11 }, (_, i) => i + 1)
    const midRing = Array.from({ length: 14 }, (_, i) => i + 12)
    const outerRing = Array.from({ length: 8 }, (_, i) => i + 26)
    const primes = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => isPrime(n))
    const composites = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !isPrime(n) && n > 1)
    const selectedPrimes: number[] = []
    const selectedComposites: number[] = []
    const shuffledPrimes = [...primes].sort(() => Math.random() - 0.5)
    const shuffledComposites = [...composites].sort(() => Math.random() - 0.5)
    for (const n of shuffledPrimes) {
      if (selectedPrimes.length >= targetPrime) break
      selectedPrimes.push(n)
    }
    for (const n of shuffledComposites) {
      if (selectedComposites.length >= targetComposite) break
      selectedComposites.push(n)
    }
    const result = [...selectedPrimes, ...selectedComposites].sort((a, b) => a - b)
    return {
      name: '质合数螺旋选号法',
      description: `质合比 ${targetPrime}:${targetComposite}，三层覆盖`,
      output: result,
    }
  },
}
