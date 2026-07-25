import type { LotteryType, FilterRule, KillRule, SelectRule, BoldRule, MatrixRule } from './types'
import { allKillRules, applyAllKillRules, applySelectedKillRules } from './kill/index'
import { allSelectRules } from './select/index'
import { allBoldRules, runAllBoldRules, crossValidateBold } from './bold/index'
import { allFilters, validateCombination, filterCombinations } from './filters/index'
import { allMatrixRules } from './matrix/index'
import { getMainNums, getBackNums } from './base'

export interface EngineConfig {
  type: LotteryType
  enabledKillRuleNames?: string[]
  enabledSelectRuleNames?: string[]
  enabledBoldRuleNames?: string[]
  enabledFilterNames?: string[]
  enabledMatrixRuleNames?: string[]
  blueKillRuleNames?: string[]      // 蓝球/后区杀号
  blueSelectRuleNames?: string[]    // 蓝球/后区选号
}

export interface EngineResult {
  killed: Set<number>
  candidates: number[]
  boldNumbers: Map<string, number[]>
  boldCross: number[]
  filtered: number[][]
  matrices: Map<string, number[][]>
  validation: { valid: boolean; failedRules: string[] }
  backKilled: Set<number>          // 后区/蓝球杀号结果
  backCandidates: number[]         // 后区/蓝球候选
  finalBack: number[][]            // 最终后区/蓝球组合
}

export class RuleEngine {
  private config: EngineConfig

  constructor(config: EngineConfig) {
    this.config = config
  }

  getKillRules(): KillRule[] {
    if (!this.config.enabledKillRuleNames) return allKillRules
    return allKillRules.filter(r => this.config.enabledKillRuleNames!.includes(r.name))
  }

  getSelectRules(): SelectRule[] {
    if (!this.config.enabledSelectRuleNames) return allSelectRules
    return allSelectRules.filter(r => this.config.enabledSelectRuleNames!.includes(r.name))
  }

  getBoldRules(): BoldRule[] {
    if (!this.config.enabledBoldRuleNames) return allBoldRules
    return allBoldRules.filter(r => this.config.enabledBoldRuleNames!.includes(r.name))
  }

  getFilters(): FilterRule[] {
    if (!this.config.enabledFilterNames) return allFilters
    return allFilters.filter(r => this.config.enabledFilterNames!.includes(r.name))
  }

  getMatrixRules(): MatrixRule[] {
    if (!this.config.enabledMatrixRuleNames) return allMatrixRules
    return allMatrixRules.filter(r => this.config.enabledMatrixRuleNames!.includes(r.name))
  }

  execute(history: number[][], notes: number = 5): EngineResult {
    const range = this.config.type === 'ssq' ? 33 : 35
    const pickCount = this.config.type === 'ssq' ? 6 : 5
    const backRange = this.config.type === 'ssq' ? 16 : 12
    const backPick = this.config.type === 'ssq' ? 1 : 2

    // ===== 前区/红球处理 =====
    const killRules = this.getKillRules()
    const killed = killRules.length > 0
      ? applyAllKillRules(killRules, history, range, this.config.type)
      : new Set<number>()

    let candidates: number[] = []
    const selectRules = this.getSelectRules()
    if (selectRules.length > 0) {
      const result = selectRules[0].apply(history, range, this.config.type)
      candidates = result.output.filter((n: number) => !killed.has(n))
    } else {
      candidates = Array.from({ length: range }, (_, i) => i + 1)
        .filter(n => !killed.has(n))
    }

    if (candidates.length < pickCount) {
      const allNums = Array.from({ length: range }, (_, i) => i + 1)
      const extra = allNums.filter(n => !candidates.includes(n)).sort(() => Math.random() - 0.5)
      candidates.push(...extra.slice(0, pickCount - candidates.length))
    }

    const boldNumbers = runAllBoldRules(history)
    const boldCross = crossValidateBold(history)

    const filters = this.getFilters()
    const allCombos = this.generateCombinations(candidates.slice(0, Math.min(12, candidates.length)), pickCount)
    const filtered = filters.length > 0
      ? filterCombinations(allCombos, this.config.type, filters.map(f => f.name))
      : allCombos

    const finalCombos = filtered.length > 0 ? filtered : allCombos

    const matrices = new Map<string, number[][]>()
    for (const matrix of this.getMatrixRules()) {
      matrices.set(matrix.name, matrix.apply(candidates.slice(0, Math.min(9, candidates.length)), pickCount, ''))
    }

    const validation = filtered.length > 0
      ? validateCombination(filtered[0], this.config.type, this.config.enabledFilterNames)
      : { valid: true, failedRules: [] }

    // ===== 后区/蓝球处理 =====
    const backKilled = new Set<number>()
    if (this.config.blueKillRuleNames) {
      const blueKillers = allKillRules.filter(r => this.config.blueKillRuleNames!.includes(r.name))
      const bk = applyAllKillRules(blueKillers, history, backRange, this.config.type)
      for (const n of bk) backKilled.add(n)
    }

    let backCandidates: number[] = []
    if (this.config.blueSelectRuleNames) {
      const blueSelectors = allSelectRules.filter(r => this.config.blueSelectRuleNames!.includes(r.name))
      if (blueSelectors.length > 0) {
        const br = blueSelectors[0].apply(history, backRange, this.config.type)
        backCandidates = br.output.filter((n: number) => !backKilled.has(n))
      }
    }
    if (backCandidates.length < backPick) {
      for (let n = 1; n <= backRange; n++) {
        if (!backKilled.has(n) && !backCandidates.includes(n)) {
          backCandidates.push(n)
        }
        if (backCandidates.length >= backPick + 2) break
      }
    }

    // 生成后区组合
    const finalBack: number[][] = []
    if (backPick === 1) {
      for (const n of backCandidates.slice(0, 3)) finalBack.push([n])
    } else {
      for (let i = 0; i < backCandidates.length && finalBack.length < 6; i++) {
        for (let j = i + 1; j < backCandidates.length && finalBack.length < 6; j++) {
          finalBack.push([backCandidates[i], backCandidates[j]])
        }
      }
    }

    return {
      killed, candidates, boldNumbers, boldCross,
      filtered: finalCombos, matrices, validation,
      backKilled, backCandidates, finalBack,
    }
  }

  private generateCombinations(pool: number[], pick: number): number[][] {
    const result: number[][] = []
    function dfs(start: number, path: number[]) {
      if (path.length === pick) {
        result.push([...path])
        return
      }
      for (let i = start; i < pool.length; i++) {
        path.push(pool[i])
        dfs(i + 1, path)
        path.pop()
      }
    }
    dfs(0, [])
    return result
  }
}

export function createDefaultEngine(type: LotteryType): RuleEngine {
  return new RuleEngine({
    type,
    enabledKillRuleNames: [
      '减法/差值杀号',
      '红一红二减法杀号',
      '龙头杀号',
      '凤尾杀号',
      '龙头+蓝球杀号',
      '龙头与蓝球差值杀号',
      '和值尾数杀号',
      '过热尾数杀号',
      '断区杀号',
      '红蓝联动绝对值杀号',
    ],
    enabledFilterNames: [
      '奇偶过滤',
      '大小过滤',
      '区间过滤',
      '连号过滤',
      '尾数过滤',
      '和值范围过滤',
      '质合比过滤',
    ],
  })
}

export {
  allKillRules,
  applyAllKillRules,
  applySelectedKillRules,
  allSelectRules,
  allBoldRules,
  runAllBoldRules,
  crossValidateBold,
  allFilters,
  validateCombination,
  filterCombinations,
  allMatrixRules,
}
