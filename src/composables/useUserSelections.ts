import { ref, computed } from 'vue'

export interface BirthdayInfo {
  year: number
  month: number
  day: number
}

// 全局响应式存储 - 双色球数据
export const ssqBlueNumbers = ref<number[]>([])
export const ssqRedNumbers = ref<number[]>([])
export const ssqNotes = ref<number>(5)
export const ssqMode = ref<'single' | 'multiple' | 'dantuo'>('single')
export const ssqBirthday = ref<BirthdayInfo | null>(null)
export const ssqConstellation = ref<string>('')
export const ssqLuckyNumbers = ref<number[]>([])

// 全局响应式存储 - 大乐透数据
export const dltBlueNumbers = ref<number[]>([])
export const dltRedNumbers = ref<number[]>([])
export const dltNotes = ref<number>(5)
export const dltMode = ref<'single' | 'multiple' | 'dantuo'>('single')
export const dltBirthday = ref<BirthdayInfo | null>(null)
export const dltConstellation = ref<string>('')
export const dltLuckyNumbers = ref<number[]>([])

// 当前激活的引用（根据彩种动态切换）
let currentType: 'ssq' | 'dlt' = 'ssq'

export function setCurrentType(type: 'ssq' | 'dlt') {
  currentType = type
}

function getBlueNumbers() {
  return currentType === 'ssq' ? ssqBlueNumbers : dltBlueNumbers
}

function getRedNumbers() {
  return currentType === 'ssq' ? ssqRedNumbers : dltRedNumbers
}

function getNotes() {
  return currentType === 'ssq' ? ssqNotes : dltNotes
}

function getMode() {
  return currentType === 'ssq' ? ssqMode : dltMode
}

function getBirthday() {
  return currentType === 'ssq' ? ssqBirthday : dltBirthday
}

function getConstellation() {
  return currentType === 'ssq' ? ssqConstellation : dltConstellation
}

function getLuckyNumbers() {
  return currentType === 'ssq' ? ssqLuckyNumbers : dltLuckyNumbers
}

// 获取当前激活的响应式引用
function getCurrentRefs() {
  if (currentType === 'ssq') {
    return {
      blueNumbers: ssqBlueNumbers,
      redNumbers: ssqRedNumbers,
      notes: ssqNotes,
      mode: ssqMode,
      birthday: ssqBirthday,
      constellation: ssqConstellation,
      luckyNumbers: ssqLuckyNumbers,
    }
  }
  return {
    blueNumbers: dltBlueNumbers,
    redNumbers: dltRedNumbers,
    notes: dltNotes,
    mode: dltMode,
    birthday: dltBirthday,
    constellation: dltConstellation,
    luckyNumbers: dltLuckyNumbers,
  }
}

export function useUserSelections() {
  function setBlueNumbers(numbers: number[]) {
    const refs = getCurrentRefs()
    refs.blueNumbers.value = [...numbers]
  }

  function setRedNumbers(numbers: number[]) {
    const refs = getCurrentRefs()
    refs.redNumbers.value = [...numbers]
  }

  function setNotes(notes: number) {
    const refs = getCurrentRefs()
    refs.notes.value = notes
  }

  function setMode(mode: 'single' | 'multiple' | 'dantuo') {
    const refs = getCurrentRefs()
    refs.mode.value = mode
  }

  function setBirthday(info: BirthdayInfo) {
    const refs = getCurrentRefs()
    refs.birthday.value = { ...info }
  }

  function setConstellation(name: string) {
    const refs = getCurrentRefs()
    refs.constellation.value = name
  }

  function setLuckyNumbers(numbers: number[]) {
    const refs = getCurrentRefs()
    refs.luckyNumbers.value = [...numbers]
  }

  function clearAll() {
    // 只清除生日、星座、生辰、幸运数
    ssqBirthday.value = null
    ssqConstellation.value = ''
    ssqLuckyNumbers.value = []

    dltBirthday.value = null
    dltConstellation.value = ''
    dltLuckyNumbers.value = []
  }

  function clearRedBlueNumbers() {
    // 专门清空红球蓝球
    ssqBlueNumbers.value = []
    ssqRedNumbers.value = []
    
    dltBlueNumbers.value = []
    dltRedNumbers.value = []
  }

  function clearAllIncludingRedBlue() {
    // 清除所有数据（包括红球蓝球、注数、模式）
    ssqBlueNumbers.value = []
    ssqRedNumbers.value = []
    ssqNotes.value = 5
    ssqMode.value = 'single'
    ssqBirthday.value = null
    ssqConstellation.value = ''
    ssqLuckyNumbers.value = []

    dltBlueNumbers.value = []
    dltRedNumbers.value = []
    dltNotes.value = 5
    dltMode.value = 'single'
    dltBirthday.value = null
    dltConstellation.value = ''
    dltLuckyNumbers.value = []
  }

  // 使用 computed 动态获取当前彩种的引用，确保切换彩种后自动更新
  const userNotes = computed({
    get: () => getNotes().value,
    set: (val: number) => setNotes(val)
  })

  const userMode = computed({
    get: () => getMode().value,
    set: (val: 'single' | 'multiple' | 'dantuo') => setMode(val)
  })

  const userRedNumbers = computed({
    get: () => getRedNumbers().value,
    set: (val: number[]) => setRedNumbers(val)
  })

  const userBlueNumbers = computed({
    get: () => getBlueNumbers().value,
    set: (val: number[]) => setBlueNumbers(val)
  })

  const userBirthday = computed({
    get: () => getBirthday().value,
    set: (val: BirthdayInfo | null) => { if (val) setBirthday(val) }
  })

  const userConstellation = computed({
    get: () => getConstellation().value,
    set: (val: string) => setConstellation(val)
  })

  const userLuckyNumbers = computed({
    get: () => getLuckyNumbers().value,
    set: (val: number[]) => setLuckyNumbers(val)
  })

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
    clearRedBlueNumbers,
    clearAllIncludingRedBlue,
  }
}
