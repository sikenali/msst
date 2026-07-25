import { ref } from 'vue'
import { applySelectedKillRules } from '@/rules/kill/index'
import type { LotteryType } from '@/rules/types'

export const killRuleNames = ref<string[]>([])
export const selectRuleNames = ref<string[]>([])
export const boldRuleNames = ref<string[]>([])
export const filterNames = ref<string[]>([])
export const matrixRuleName = ref<string>('')

export function useRuleEngine() {
  return {
    killRuleNames,
    selectRuleNames,
    boldRuleNames,
    filterNames,
    matrixRuleName,
  }
}

export function setKillRuleNames(names: string[]) {
  killRuleNames.value = names
}

export function setSelectRuleNames(names: string[]) {
  selectRuleNames.value = names
}

export function setBoldRuleNames(names: string[]) {
  boldRuleNames.value = names
}

export function setFilterNames(names: string[]) {
  filterNames.value = names
}

export function setMatrixRuleName(name: string) {
  matrixRuleName.value = name
}

export function computeKilledSet(
  history: number[][],
  range: number,
  type: LotteryType
): Set<number> {
  if (killRuleNames.value.length === 0) return new Set()
  return applySelectedKillRules(killRuleNames.value, history, range, type)
}

export function hasActiveKillRules(): boolean {
  return killRuleNames.value.length > 0
}

export function hasActiveSelectRules(): boolean {
  return selectRuleNames.value.length > 0
}
