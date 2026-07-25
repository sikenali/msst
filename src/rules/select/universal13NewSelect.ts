import type { SelectRule } from '../types'
import { UNIVERSAL_13_NEW } from '../base'

export const universal13NewSelect: SelectRule = {
  name: '万能13码新版',
  description: '70期数据筛选13码覆盖，核心胆码+中坚稳码+边缘活码',
  bagua: 'dui',
  apply(history, range, type) {
    if (type !== 'ssq') {
      return { name: '万能13码新版', description: '仅适用于双色球', output: [] }
    }
    const coreCount = Math.random() > 0.5 ? 2 : 3
    const coreShuffled = [...UNIVERSAL_13_NEW.core].sort(() => Math.random() - 0.5)
    const coreUsed = coreShuffled.slice(0, coreCount)
    const stableShuffled = [...UNIVERSAL_13_NEW.stable].sort(() => Math.random() - 0.5)
    const needFromStable = 5 - coreUsed.length
    const stableUsed = stableShuffled.slice(0, needFromStable)
    const allSelected = [...coreUsed, ...stableUsed]
    const flexibleShuffled = [...UNIVERSAL_13_NEW.flexible].sort(() => Math.random() - 0.5)
    const flexibleUsed = flexibleShuffled[0]
    if (flexibleUsed) allSelected.push(flexibleUsed)
    return {
      name: '万能13码新版',
      description: `核心${coreUsed.length}稳${stableUsed.length}活${flexibleUsed ? 1 : 0}`,
      output: allSelected.slice(0, 6).sort((a, b) => a - b),
    }
  },
}
