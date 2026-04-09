import { ref } from 'vue'

export interface BirthdayInfo {
  year: number
  month: number
  day: number
}

// 全局响应式存储 - 用户的"法号"与"道号"数据
// 页面切换或刷新前临时保存，不跨会话
export const userBlueNumbers = ref<number[]>([])
export const userRedNumbers = ref<number[]>([])
export const userNotes = ref<number>(1)
export const userMode = ref<'single' | 'multiple' | 'dantuo'>('single')
export const userBirthday = ref<BirthdayInfo | null>(null)
export const userConstellation = ref<string>('')
export const userLuckyNumbers = ref<number[]>([])

export function useUserSelections() {
  function setBlueNumbers(numbers: number[]) {
    userBlueNumbers.value = [...numbers]
  }

  function setRedNumbers(numbers: number[]) {
    userRedNumbers.value = [...numbers]
  }

  function setNotes(notes: number) {
    userNotes.value = notes
  }

  function setMode(mode: 'single' | 'multiple' | 'dantuo') {
    userMode.value = mode
  }

  function setBirthday(info: BirthdayInfo) {
    userBirthday.value = { ...info }
  }

  function setConstellation(name: string) {
    userConstellation.value = name
  }

  function setLuckyNumbers(numbers: number[]) {
    userLuckyNumbers.value = [...numbers]
  }

  function clearAll() {
    userBlueNumbers.value = []
    userRedNumbers.value = []
    userNotes.value = 1
    userMode.value = 'single'
    userBirthday.value = null
    userConstellation.value = ''
    userLuckyNumbers.value = []
  }

  return {
    userBlueNumbers,
    userRedNumbers,
    userNotes,
    userMode,
    userBirthday,
    userConstellation,
    userLuckyNumbers,
    setBlueNumbers,
    setRedNumbers,
    setNotes,
    setMode,
    setBirthday,
    setConstellation,
    setLuckyNumbers,
    clearAll,
  }
}
