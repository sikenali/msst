import { rotationMatrix, matrix8c4g3, matrix7c4g3, matrix9c5g4 } from './rotationMatrix'
import { ulamSpiral } from './ulamSpiral'
import type { MatrixRule } from '../types'

export const allMatrixRules: MatrixRule[] = [
  rotationMatrix,
  matrix8c4g3,
  matrix7c4g3,
  matrix9c5g4,
  ulamSpiral,
]
