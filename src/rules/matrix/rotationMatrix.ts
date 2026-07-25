import type { MatrixRule } from '../types'

function combine(cnt: number, pick: number): number[][] {
  const result: number[][] = []
  function dfs(start: number, path: number[]) {
    if (path.length === pick) {
      result.push([...path])
      return
    }
    for (let i = start; i <= cnt; i++) {
      path.push(i)
      dfs(i + 1, path)
      path.pop()
    }
  }
  dfs(1, [])
  return result
}

function mapToNumbers(indices: number[][], pool: number[]): number[][] {
  return indices.map(idxSet => idxSet.map(i => pool[i - 1]).sort((a, b) => a - b))
}

export const rotationMatrix: MatrixRule = {
  name: '旋转矩阵（通用）',
  description: 'M选N全组合',
  apply(pool: number[], pickCount: number, guarantee: string = ''): number[][] {
    const combos = combine(pool.length, pickCount)
    return mapToNumbers(combos, pool)
  },
}

export const matrix8c4g3: MatrixRule = {
  name: '8码中4保3矩阵',
  description: '8个备选号用12注保证至少中3红',
  apply(pool: number[], pickCount: number, guarantee: string = ''): number[][] {
    if (pool.length !== 8) return rotationMatrix.apply(pool, pickCount, guarantee)
    const template = [
      [1,2,3,4,5,6], [1,2,3,4,7,8],
      [1,2,5,6,7,8], [3,4,5,6,7,8],
      [1,2,3,5,7,8], [1,2,4,6,7,8],
      [1,3,4,5,6,8], [2,3,4,5,6,7],
      [1,2,3,6,7,8], [1,4,5,6,7,8],
      [2,3,4,5,7,8], [1,3,4,5,6,7],
    ]
    return mapToNumbers(template, pool)
  },
}

export const matrix7c4g3: MatrixRule = {
  name: '7码中4保3矩阵',
  description: '7个备选号用7注保证至少中3红',
  apply(pool: number[], pickCount: number, guarantee: string = ''): number[][] {
    if (pool.length !== 7) return rotationMatrix.apply(pool, pickCount, guarantee)
    const template = [
      [1,2,3,4,5,6], [1,2,3,4,7,8],
      [1,2,5,6,7,8], [3,4,5,6,7,8],
      [1,2,3,5,7,8], [1,2,4,6,7,8],
      [1,3,4,5,6,8],
    ]
    const valid = template.map(t => t.filter(i => i <= 7))
    return mapToNumbers(valid, pool)
  },
}

export const matrix9c5g4: MatrixRule = {
  name: '9码中5保4矩阵',
  description: '9个备选号用22注保证至少中4红',
  apply(pool: number[], pickCount: number, guarantee: string = ''): number[][] {
    if (pool.length !== 9) return rotationMatrix.apply(pool, pickCount, guarantee)
    const template = [
      [1,2,3,4,5,6], [1,2,3,4,7,8],
      [1,2,5,6,7,9], [3,4,5,6,8,9],
      [1,2,4,6,8,9], [1,3,5,7,8,9],
      [2,3,4,5,7,9], [1,2,3,6,7,8],
      [1,4,5,6,7,9], [2,3,4,7,8,9],
      [1,3,4,6,7,9], [2,5,6,7,8,9],
      [1,2,4,5,8,9], [3,4,5,6,7,8],
      [1,2,3,5,6,9], [1,3,4,5,6,8],
      [2,3,4,5,6,9], [1,2,5,7,8,9],
      [1,3,4,6,8,9], [2,4,6,7,8,9],
      [1,2,3,7,8,9], [1,4,5,6,7,8],
    ]
    return mapToNumbers(template, pool)
  },
}

export function rotationMatrixForDLT(
  frontPool: number[],
  backPool: number[]
): { front: number[]; back: number[] }[] {
  const frontCombos = matrix8c4g3.apply(frontPool, 5, '')
  const results: { front: number[]; back: number[] }[] = []
  for (const fc of frontCombos) {
    for (const bc of backPool) {
      const remaining = backPool.filter(b => b !== bc)
      if (remaining.length >= 1) {
        results.push({ front: fc, back: [bc, remaining[0]] })
      }
    }
  }
  return results
}
