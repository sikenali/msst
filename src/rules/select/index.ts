import { crossMarkSelect } from './crossMarkSelect'
import { primeSpiralSelect } from './primeSpiralSelect'
import { threePointSelect } from './threePointSelect'
import { clockSelect } from './clockSelect'
import { universal13Select } from './universal13Select'
import { twinStarSelect } from './twinStarSelect'
import { tripleSumSelect } from './tripleSumSelect'
import { redBlueIntegratedSelect } from './simultaneous'
import { singularBoldSelect } from './singularSelect'
import { ninePalaceSelect } from './ninePalaceSelect'
import { goldenRatioDLTSelect } from './goldenRatioDLTSelect'
import { fiveStepSelect } from './fiveStepSelect'
import { headTailSumZoneSelect } from './headTailSumSelect'
import { universal13NewSelect } from './universal13NewSelect'
import type { SelectRule } from '../types'

export const allSelectRules: SelectRule[] = [
  crossMarkSelect,
  primeSpiralSelect,
  threePointSelect,
  clockSelect,
  universal13Select,
  twinStarSelect,
  tripleSumSelect,
  redBlueIntegratedSelect,
  singularBoldSelect,
  ninePalaceSelect,
  goldenRatioDLTSelect,
  fiveStepSelect,
  headTailSumZoneSelect,
  universal13NewSelect,
]
