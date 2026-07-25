import type { KillRule } from '../types'
import { getBackNums, BLUE_PRIMES } from '../base'

export const blue12Kill: KillRule = {
  name: '蓝球12杀法',
  description: '12种独立杀蓝方法，四轮逐层筛选',
  apply(history, range, type) {
    const killed = new Set<number>()
    if (history.length < 3) return killed
    const lastBlue = type === 'dlt' ? history[0][6] : history[0][6]
    const recent10 = history.slice(0, 10).flatMap(d => type === 'dlt' ? [d[6]] : [d[6]])
    killed.add(lastBlue)
    const road = lastBlue % 3
    for (let n = 1; n <= 16; n++) { if (n % 3 === road) killed.add(n) }
    const recentSet = new Set(recent10)
    for (let n = 1; n <= 16; n++) { if (!recentSet.has(n)) killed.add(n) }
    const tail7 = Math.abs(15 - lastBlue) % 10
    const tail8 = Math.abs(19 - lastBlue) % 10
    const tail9 = (lastBlue * 2) % 10
    for (let n = 1; n <= 16; n++) {
      if (n % 10 === tail7 || n % 10 === tail8 || n % 10 === tail9) killed.add(n)
    }
    if (lastBlue <= 8) { for (let n = 1; n <= 8; n++) killed.add(n) }
    else { for (let n = 9; n <= 16; n++) killed.add(n) }
    const recent3 = recent10.slice(-3)
    const allOdd = recent3.every(b => b % 2 === 1)
    const allEven = recent3.every(b => b % 2 === 0)
    if (allOdd) { for (let n = 1; n <= 16; n++) { if (n % 2 === 1) killed.add(n) } }
    if (allEven) { for (let n = 1; n <= 16; n++) { if (n % 2 === 0) killed.add(n) } }
    return killed
  },
}
