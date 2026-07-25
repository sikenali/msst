<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RiSparkling2Fill, RiMoneyCnyCircleFill } from '@remixicon/vue'
import { useUserSelections, setCurrentType } from '@/composables/useUserSelections'
import { setCurrentLotteryType } from '@/composables/useLottery'
import Toast, { showToast } from '@/components/Toast.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import PageHeader from '@/components/PageHeader.vue'
import BaguaDiagram from '@/components/BaguaDiagram.vue'
import NoteCounter from '@/components/NoteCounter.vue'
import ModeSelector from '@/components/ModeSelector.vue'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'
import IconModal from '@/components/IconModal.vue'
import NumberPickerModal from '@/components/NumberPickerModal.vue'
import KillRulesModal from '@/components/KillRulesModal.vue'
import WuxingQilieModal from '@/components/WuxingQilieModal.vue'
import NumberBallGrid from '@/components/NumberBallGrid.vue'

const router = useRouter()
const route = useRoute()

// 九字真言字符
const mantraChars = ['临', '兵', '斗', '者', '皆', '列', '阵', '前', '行']

const lotteryType = ref<'ssq' | 'dlt'>((route.query.type as 'ssq' | 'dlt') || 'ssq')

// 在顶层解构一次 composable，避免重复调用
const { userNotes, setNotes, userRedNumbers, userBlueNumbers, setMode, userMode, setBlueNumbers, setRedNumbers, clearRedBlueNumbers } = useUserSelections()

// 同步当前彩种类型到全局状态
watch(lotteryType, (newType) => {
  setCurrentType(newType)
  setCurrentLotteryType(newType)
  // 切换彩种时清除旧的号码，避免使用另一个彩种的号码
  clearRedBlueNumbers()
}, { immediate: true })

// 使用 computed 动态获取当前彩种的注数
const notes = computed({
  get: () => userNotes.value,
  set: (val: number) => {
    userNotes.value = val
  }
})

// 模式：使用全局状态的 userMode，确保运式选择器的修改能生效
const mode = computed({
  get: () => userMode.value,
  set: (val: 'single' | 'multiple' | 'dantuo') => {
    userMode.value = val
  }
})
const showRulesModal = ref(false)
const isSpinning = ref(false)
const counterAutofocus = ref(false)

// 浮动面板弹框
const showIconModal = ref(false)
const currentModalType = ref('')

const showKillRulesModal = ref(false)
const showWuxingQilieModal = ref(false)

// 号码选择弹框
const showPickerModal = ref(false)
const pickerType = ref<'blue' | 'red'>('blue')
const pickerTitle = ref('')

// 蓝若寺和红佛女各自独立存储选中的号码
const pickerSelectedBlue = ref<number[]>([])
const pickerSelectedRed = ref<number[]>([])

// 当前弹框使用的选中号码（computed 动态绑定）
const pickerSelectedNumbers = computed(() =>
  pickerType.value === 'blue' ? pickerSelectedBlue.value : pickerSelectedRed.value
)

function handleOpenModal(type: string) {
  // 蓝若寺和红佛女打开号码选择器
  if (type === 'lanruo') {
    pickerType.value = 'blue'
    pickerTitle.value = '蓝若寺'
    // 从全局状态初始化选中号码，确保弹框显示与全局状态同步
    pickerSelectedBlue.value = [...userBlueNumbers.value]
    showPickerModal.value = true
    return
  }

  if (type === 'hongfolv') {
    pickerType.value = 'red'
    pickerTitle.value = '红佛女'
    // 从全局状态初始化选中号码，确保弹框显示与全局状态同步
    pickerSelectedRed.value = [...userRedNumbers.value]
    showPickerModal.value = true
    return
  }

  // 杀号规则
  if (type === 'shahao') {
    showKillRulesModal.value = true
    return
  }

  // 五行七列
  if (type === 'wuxingqilie') {
    showWuxingQilieModal.value = true
    return
  }

  // 其他类型打开普通弹框
  currentModalType.value = type
  showIconModal.value = true
}

function handleCloseModal() {
  showIconModal.value = false
}

function handleKillRulesClose() {
  showKillRulesModal.value = false
}

function handleWuxingQilieClose() {
  showWuxingQilieModal.value = false
}

function handlePickerConfirm(numbers: number[]) {
  console.log('选中的号码:', numbers)

  // 将选中的号码分别存储到独立状态
  if (pickerType.value === 'blue') {
    pickerSelectedBlue.value = [...numbers]
  } else if (pickerType.value === 'red') {
    pickerSelectedRed.value = [...numbers]
  }

  // 使用顶层已解构的函数保存到全局状态（用于号码生成）
  if (pickerType.value === 'blue') {
    setBlueNumbers(numbers)
  } else if (pickerType.value === 'red') {
    setRedNumbers(numbers)
  }

  // 关闭弹框
  showPickerModal.value = false

  showToast(`已选择 ${numbers.length} 个号码`, 'success')
}

function handlePickerClose() {
  showPickerModal.value = false
}

// 监听类型切换，触发输入框聚焦
watch(lotteryType, () => {
  // 仅在移动端（屏幕宽度小于 768px）自动聚焦
  if (window.innerWidth < 768) {
    counterAutofocus.value = false
    // 等待 Tab 切换动画和组件渲染完成后聚焦
    setTimeout(() => {
      counterAutofocus.value = true
      // 直接通过 DOM 聚焦，确保焦点正确
      setTimeout(() => {
        const input = document.querySelector('.counter-value-input') as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }
      }, 150)
    }, 300)
  } else {
    // PC 端不自动聚焦
    counterAutofocus.value = false
  }
})
const ssqNums = computed(() => Array.from({length: 33}, (_, i) => i + 1))
const dltFrontNums = computed(() => Array.from({length: 35}, (_, i) => i + 1))
const dltBackNums = computed(() => Array.from({length: 12}, (_, i) => i + 1))
const currentMaxFront = computed(() => lotteryType.value === 'ssq' ? 6 : (userMode.value === 'multiple' ? Math.max(7, userRedNumbers.value.length || 5) : 6))
const currentMaxBack = computed(() => lotteryType.value === 'ssq' ? 1 : (userMode.value === 'multiple' ? Math.max(2, userBlueNumbers.value.length || 1) : 2))

const frontSelected = computed({ get: () => userRedNumbers.value, set: (v) => setRedNumbers(v) })
const backSelected = computed({ get: () => userBlueNumbers.value, set: (v) => setBlueNumbers(v) })

const frontTotal = computed(() => lotteryType.value === 'ssq' ? 33 : 35)
const backTotal = computed(() => lotteryType.value === 'ssq' ? 16 : 12)

const currentLotteryName = computed(() => lotteryType.value === 'ssq' ? '双色球' : '大乐透')

const redBallLabel = computed(() => lotteryType.value === 'ssq' ? '红球' : '前区')
const blueBallLabel = computed(() => lotteryType.value === 'ssq' ? '蓝球' : '后区')

// 选中的红/前球个数限制
const maxFrontCount = computed(() => {
  if (lotteryType.value === 'ssq') return 6
  // DLT 根据模式动态
  if (userMode.value === 'dantuo') {
    // 胆拖模式下最多5个
    const bankered = frontSelected.value.filter(n => false).length
    return 5 - bankered
  }
  if (userMode.value === 'multiple') return Math.max(6, frontSelected.value.length)
  return 5
})

const maxBackCount = computed(() => {
  if (lotteryType.value === 'ssq') return 1
  if (userMode.value === 'multiple') return Math.max(2, backSelected.value.length)
  return 2
})

// 规则标签
const selectRules = [
  { name: '奇偶均衡', icon: 'scale', color: '#C43D3D' },
  { name: '大小分布', icon: 'bar', color: '#C8A45C' },
  { name: '质合比例', icon: 'number', color: '#5B8C5A' },
  { name: '和值区间', icon: 'plus', color: '#7B9EB3' },
  { name: '连号模式', icon: 'link', color: '#C43D3D' },
  { name: '跨度控制', icon: 'expand', color: '#C8A45C' },
]

const killRules = [
  { name: '冷号排除', icon: 'snow', color: '#7B9EB3' },
  { name: '重号过滤', icon: 'cycle', color: '#C43D3D' },
  { name: '邻号规避', icon: 'arrows', color: '#5B8C5A' },
]

// === Background rain (kept from original) ===
const generateRain = (count: number, type: 'ssq' | 'dlt') => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 8,
    opacity: 0.1 + Math.random() * 0.25,
    scale: 0.6 + Math.random() * 0.6,
    type: type
  }))
}

const ssqRain = generateRain(20, 'ssq')
const dltRain = generateRain(20, 'dlt')
const currentRain = computed(() => lotteryType.value === 'ssq' ? ssqRain : dltRain)

// 组件销毁时清理（虽然背景雨是静态数据，但保持良好习惯）
onBeforeUnmount(() => {
  // 清理工作（当前无需特殊清理，因为雨滴数据是静态的）
})

watch(() => route.query.type, (newType) => {
  if (newType === 'ssq' || newType === 'dlt') {
    lotteryType.value = newType
  }
})

// Auto generate
const autoGenerate = computed(() => route.query.autoGenerate === '1')

// 监听 autoGenerate，触发八卦图旋转后跳转
watch(autoGenerate, async (shouldAutoGenerate) => {
  if (shouldAutoGenerate) {
    // 使用路由参数中的注数和模式
    const notesCount = Number(route.query.notes) || 5
    const currentMode = (route.query.mode as string) || 'single'

    console.log('🔄 重新生成 - 注数:', notesCount, '模式:', currentMode)
    isSpinning.value = true

    let baseDuration = 0
    let extraPerNote = 0
    const maxDuration = 25000

    if (notesCount <= 5) {
      baseDuration = 1500
      extraPerNote = 200
    } else if (notesCount <= 10) {
      baseDuration = 6000
      extraPerNote = 800
    } else {
      baseDuration = 8000
      extraPerNote = 1000
    }

    let waitTime = baseDuration + (notesCount - 1) * extraPerNote

    // 5或10的倍数时增加额外仪式感时间
    if (notesCount > 0 && notesCount % 5 === 0) {
      waitTime += 1000
    }

    waitTime = Math.min(waitTime, maxDuration)
    await new Promise(resolve => setTimeout(resolve, waitTime))
    isSpinning.value = false

    router.push({
      path: '/result',
      query: {
        type: lotteryType.value,
        notes: notesCount,
        mode: currentMode,
        share: '1',
      },
    })
  }
}, { immediate: true })

// 同步路由参数到本地状态
watch(() => route.query.notes, (val) => {
  const notesNum = Number(val) || 5
  setNotes(notesNum)
}, { immediate: true })

watch(() => route.query.mode, (val) => {
  if (val === 'single' || val === 'multiple' || val === 'dantuo') {
    setMode(val)
  }
}, { immediate: true })

async function handleGenerate() {
  // 直接传递用户选择的模式和注数，让 useLottery.ts 负责具体判断
  const finalNotes = notes.value
  const finalMode = mode.value

  console.log('🎲 生成参数:', {
    彩种: lotteryType.value,
    模式: finalMode,
    注数: finalNotes,
    红球: userRedNumbers.value,
    蓝球: userBlueNumbers.value
  })

  isSpinning.value = true
  // 根据注数动态计算等待时间（与BaguaDiagram旋转时间一致）
  const notesCount = finalNotes
  let baseDuration = 0
  let extraPerNote = 0
  const maxDuration = 25000

  if (notesCount <= 5) {
    baseDuration = 1500
    extraPerNote = 200
  } else if (notesCount <= 10) {
    baseDuration = 6000
    extraPerNote = 800
  } else {
    baseDuration = 8000
    extraPerNote = 1000
  }

  let waitTime = baseDuration + (notesCount - 1) * extraPerNote

  // 5或10的倍数时增加额外仪式感时间
  if (notesCount > 0 && notesCount % 5 === 0) {
    waitTime += 1000
  }

  waitTime = Math.min(waitTime, maxDuration)
  await new Promise(resolve => setTimeout(resolve, waitTime))
  isSpinning.value = false

  router.push({
    path: '/result',
    query: {
      type: lotteryType.value,
      notes: finalNotes,
      mode: finalMode,
    },
  })
}

const buttonText = computed(() => lotteryType.value === 'ssq' ? '生财' : '有道')
const buttonGradient = computed(() => lotteryType.value === 'ssq'
  ? 'linear-gradient(180deg, rgba(220,38,38,1) 0%, rgba(245,158,11,1) 100%)'
  : 'linear-gradient(180deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%)'
)

function openRules() {
  showRulesModal.value = true
}

function closeRules() {
  showRulesModal.value = false
}

function reload() {
  // 使用 router.replace 重置查询参数，避免硬刷新丢失 SPA 状态
  router.replace({ query: {} })
}
</script>

<template>
  <div class="home-page">
    <div class="rain-bg">
      <div v-for="drop in currentRain" :key="drop.id" class="rain-drop"
        :style="{ left: `${drop.left}%`, animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s`, opacity: drop.opacity, '--rain-scale': drop.scale }">
        <RiMoneyCnyCircleFill v-if="drop.type === 'ssq'" class="rain-icon" />
        <CopperCoinIcon v-else class="rain-icon dlt-rain" />
      </div>
    </div>

    <PageHeader v-model="lotteryType" @info="openRules" @logo-click="reload" />

    <div class="modal-overlay" v-if="showRulesModal" @click="closeRules">
      <div class="modal-content" @click.stop>
        <div class="modal-tip-content">
          <div class="tip-icon-wrapper">
            <svg class="tip-icon-svg" viewBox="0 0 24 24" fill="none"><path d="M12 2C10 4 8 6 8 9C8 12 10 14 12 16C14 14 16 12 16 9C16 6 14 4 12 2Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/><path d="M7 10C5 11 3 14 4 17C5 20 8 21 10 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M17 10C19 11 21 14 20 17C19 20 16 21 14 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M10 18L12 22L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          </div>
          <p class="tip-copyright">&copy;2099 彩友所有 主任的机(sui)制(ji)不如机智的我</p>
          <div class="tip-text-wrapper">
            <p class="tip-message">其实你有1000万存款，只不过你忘记了取款密码，每输入一次需要2元，一旦正确，钱就是你的，不着急，不放弃，心若在，梦就在。</p>
            <div class="nine-syllable-mantra">
              <div class="mantra-item" v-for="(char, index) in mantraChars" :key="index">
                <RiSparkling2Fill class="mantra-icon" />
                <span class="mantra-char">{{ char }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="home-main">
      <div class="main-grid">
        <div class="col-left">
          <div class="card selection-card">
            <div class="card-header">
              <div class="card-header-left">
                <span class="zone-dot zone-dot--red"></span>
                <span class="zone-title">{{ redBallLabel }}</span>
                <span class="zone-subtitle">选{{ maxFrontCount }}个</span>
              </div>
              <div class="card-header-right">
                <span class="count-display">已选: {{ frontSelected.length }}</span>
                <button class="adj-btn adj-btn--minus" @click="frontSelected.length > 0 && setRedNumbers(frontSelected.slice(0, -1))">
                  <svg width="12" height="2" viewBox="0 0 12 2"><rect width="12" height="2" fill="#5D4E37"/></svg>
                </button>
                <span class="count-num">{{ frontSelected.length }}</span>
                <button class="adj-btn adj-btn--plus" @click="frontSelected.length < maxFrontCount && setRedNumbers([...frontSelected, frontSelected.length + 1])">
                  <svg width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="1" x2="6" y2="11" stroke="#5D4E37" stroke-width="2"/><line x1="1" y1="6" x2="11" y2="6" stroke="#5D4E37" stroke-width="2"/></svg>
                </button>
              </div>
            </div>
            <NumberBallGrid
              v-model="frontSelected"
              :total-numbers="frontTotal"
              :max-count="maxFrontCount"
              :zone="'front'"
              @select="(nums) => setRedNumbers(nums)"
            />
          </div>

          <div class="card selection-card">
            <div class="card-header">
              <div class="card-header-left">
                <span class="zone-dot zone-dot--green"></span>
                <span class="zone-title">{{ blueBallLabel }}</span>
                <span class="zone-subtitle">选{{ maxBackCount }}个</span>
              </div>
              <div class="card-header-right">
                <span class="count-display">已选: {{ backSelected.length }}</span>
                <button class="adj-btn adj-btn--minus" @click="backSelected.length > 0 && setBlueNumbers(backSelected.slice(0, -1))">
                  <svg width="12" height="2" viewBox="0 0 12 2"><rect width="12" height="2" fill="#5D4E37"/></svg>
                </button>
                <span class="count-num">{{ backSelected.length }}</span>
                <button class="adj-btn adj-btn--plus" @click="backSelected.length < maxBackCount && setBlueNumbers([...backSelected, backSelected.length + 1])">
                  <svg width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="1" x2="6" y2="11" stroke="#5D4E37" stroke-width="2"/><line x1="1" y1="6" x2="11" y2="6" stroke="#5D4E37" stroke-width="2"/></svg>
                </button>
              </div>
            </div>
            <NumberBallGrid
              v-model="backSelected"
              :total-numbers="backTotal"
              :max-count="maxBackCount"
              :zone="'back'"
              @select="(nums) => setBlueNumbers(nums)"
            />
          </div>

          <div class="card config-card">
            <span class="config-label">投注模式</span>
            <div class="config-control">
              <ModeSelector v-model="mode" :theme="lotteryType" />
            </div>
          </div>

          <div class="card config-card">
            <span class="config-label">投注倍数</span>
            <div class="multiplier-controls">
              <button class="adj-btn adj-btn--multiplier" @click="notes = Math.max(1, notes - 1)">
                <svg width="12" height="2" viewBox="0 0 12 2"><rect width="12" height="2" fill="#5D4E37"/></svg>
              </button>
              <input class="counter-value-input" type="text" :value="notes" @blur="notes = Math.max(1, Math.min(99, parseInt(($event.target as HTMLInputElement).value)||1))" />
              <button class="adj-btn adj-btn--multiplier" @click="notes = Math.min(99, notes + 1)">
                <svg width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="1" x2="6" y2="11" stroke="#5D4E37" stroke-width="2"/><line x1="1" y1="6" x2="11" y2="6" stroke="#5D4E37" stroke-width="2"/></svg>
              </button>
              <span class="multiplier-suffix">倍</span>
            </div>
          </div>
        </div>

        <div class="col-center">
          <div class="center-content">
            <div class="bagua-wrap">
              <BaguaDiagram :theme="lotteryType" :spinning="isSpinning" :notes="notes" />
            </div>
            <p class="bagua-subtitle">太极生两仪 · 阴阳化万数</p>
            <button class="generate-btn" @click="handleGenerate">
              <svg width="13" height="20" viewBox="0 0 13 20" fill="none"><path d="M7.5 1L1 12H6L5.5 19L12 8H7L7.5 1Z" fill="currentColor"/></svg>
              <span>生成选号</span>
            </button>
          </div>
        </div>

        <div class="col-right">
          <div class="card rules-card">
            <div class="section-header">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="1" y="1" width="6" height="10" rx="1" stroke="#C8A45C" stroke-width="1.5"/><rect x="11" y="1" width="6" height="5" rx="1" stroke="#C8A45C" stroke-width="1.5"/><rect x="11" y="6" width="6" height="2" rx="1" stroke="#C8A45C" stroke-width="1.5"/></svg>
              <span class="section-title">选号规则</span>
            </div>
            <div class="rule-grid rule-grid--two">
              <div v-for="rule in selectRules" :key="rule.name" class="rule-item">
                <div class="rule-icon-box" :class="'rule-icon-box--' + rule.name" :style="{ background: rule.color === '#C43D3D' ? '#FDF2F2' : rule.color === '#C8A45C' ? '#FDF6EE' : rule.color === '#5B8C5A' ? '#F0F7F0' : '#F0F4F8' }">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" :stroke="rule.color" stroke-width="1.5">
                    <template v-if="rule.icon === 'scale'">
                      <path d="M4 12L12 4M4 4L12 12" stroke-linecap="round"/>
                    </template>
                    <template v-else-if="rule.icon === 'bar'">
                      <rect x="3" y="8" width="3" height="5" rx="0.5"/><rect x="7" y="5" width="3" height="8" rx="0.5"/><rect x="11" y="2" width="3" height="11" rx="0.5"/>
                    </template>
                    <template v-else-if="rule.icon === 'number'">
                      <circle cx="8" cy="8" r="5"/><text x="8" y="11" text-anchor="middle" font-size="8" fill="currentColor">N</text>
                    </template>
                    <template v-else-if="rule.icon === 'plus'">
                      <circle cx="6" cy="6" r="0.5" fill="currentColor"/><circle cx="10" cy="3" r="0.5" fill="currentColor"/><circle cx="3" cy="11" r="0.5" fill="currentColor"/><circle cx="12" cy="11" r="0.5" fill="currentColor"/><circle cx="8" cy="8" r="3" fill="none"/>
                    </template>
                    <template v-else-if="rule.icon === 'link'">
                      <path d="M5 8C5 6 6 5 8 5C10 5 11 6 11 8C11 10 10 11 8 11"/><path d="M11 8C11 10 10 11 8 11C6 11 5 10 5 8"/>
                    </template>
                    <template v-else-if="rule.icon === 'expand'">
                      <path d="M2 2L6 6M2 2V5M2 2H5"/><path d="M14 14L10 10M14 14V11M14 14H11"/><path d="M2 14L6 10M2 14V11M2 14H5"/><path d="M14 2L10 6M14 2V5M14 2H11"/>
                    </template>
                    <template v-else>
                      <circle cx="8" cy="8" r="6"/>
                    </template>
                  </svg>
                </div>
                <span class="rule-name">{{ rule.name }}</span>
              </div>
            </div>
          </div>

          <div class="card rules-card">
            <div class="section-header">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M5 15L15 5" stroke="#C43D3D" stroke-width="2" stroke-linecap="round"/></svg>
              <span class="section-title">杀号规则</span>
            </div>
            <div class="rule-grid rule-grid--three">
              <div v-for="rule in killRules" :key="rule.name" class="rule-item">
                <div class="rule-icon-box" :style="{ background: rule.color === '#C43D3D' ? '#FDF2F2' : rule.color === '#5B8C5A' ? '#F0F7F0' : '#F0F4F8' }">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" :stroke="rule.color" stroke-width="1.5">
                    <template v-if="rule.icon === 'snow'">
                      <path d="M8 2V14M2 8H14M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke-linecap="round"/>
                    </template>
                    <template v-else-if="rule.icon === 'cycle'">
                      <path d="M12 4C12 2 10 1 8 1C5 1 3 2.5 3 5"/><path d="M4 12C4 14 6 15 8 15C11 15 13 13.5 13 11"/><path d="M3 5L5 5M3 5L3 3"/><path d="M13 11L11 11M13 11L13 13"/>
                    </template>
                    <template v-else-if="rule.icon === 'arrows'">
                      <path d="M8 2L5 5H7V11H5L8 14L11 11H9V5H11L8 2Z"/>
                    </template>
                    <template v-else>
                      <circle cx="8" cy="8" r="6"/>
                    </template>
                  </svg>
                </div>
                <span class="rule-name">{{ rule.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="home-footer">
      <div class="footer-inner">
        <span class="footer-text">&copy; 2026 妙手神投</span>
        <span class="footer-dot"></span>
        <span class="footer-text">Powered by LightOS</span>
      </div>
    </footer>

    <IconModal :visible="showIconModal" :type="currentModalType" :lottery-type="lotteryType" @close="handleCloseModal" />
    <KillRulesModal :visible="showKillRulesModal" :lottery-type="lotteryType" @close="handleKillRulesClose" @apply="handleKillRulesClose" />
    <WuxingQilieModal :visible="showWuxingQilieModal" :lottery-type="lotteryType" @close="handleWuxingQilieClose" @apply="handleWuxingQilieClose" />
    <NumberPickerModal :visible="showPickerModal" :title="pickerTitle" :type="pickerType" :lottery-type="lotteryType" :selected-numbers="pickerSelectedNumbers" @confirm="handlePickerConfirm" @close="handlePickerClose" />
    <Toast />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FBF7F0;
  position: relative;
}

.rain-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.rain-drop {
  position: absolute;
  top: -10%;
  animation: rain-fall linear infinite, spin linear infinite;
}

.rain-icon {
  width: 24px;
  height: 24px;
  color: #B45309;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.rain-icon.dlt-rain {
  color: #1D4ED8;
}

@keyframes rain-fall {
  0% { top: -10%; }
  100% { top: 110%; }
}

@keyframes spin {
  0% { transform: rotate(0deg) scale(var(--rain-scale, 1)); }
  50% { transform: rotate(180deg) scale(var(--rain-scale, 1)); }
  100% { transform: rotate(360deg) scale(var(--rain-scale, 1)); }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 24px;
}

.modal-content {
  width: 500px;
  height: 320px;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.modal-tip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tip-icon-wrapper {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5F0EB 0%, #EDE6DC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #D4C5B0;
  box-shadow: 0 4px 12px rgba(180, 150, 120, 0.2);
}

.tip-icon-svg {
  width: 32px;
  height: 32px;
  color: #8B7355;
}

.tip-message {
  font-size: 15px;
  line-height: 1.8;
  color: #5D4E37;
  font-family: 'SourceHanSans-Medium';
  margin: 0;
  text-align: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F5F0EB 0%, #EDE6DC 100%);
  border-radius: 12px;
  border: 1px solid #D4C5B0;
  box-shadow: inset 0 1px 3px rgba(93, 78, 55, 0.08);
  letter-spacing: 0.3px;
}

.tip-text-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.tip-copyright {
  font-size: 13px;
  color: #8B7355;
  font-family: 'SourceHanSans-Medium';
  text-align: center;
  margin: 0;
  opacity: 0.85;
  letter-spacing: 0.5px;
}

.nine-syllable-mantra {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding: 12px 0 4px 0;
}

.mantra-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mantra-icon {
  width: 16px;
  height: 16px;
  color: #8B7355;
  opacity: 0.7;
}

.mantra-char {
  font-size: 20px;
  font-weight: 900;
  color: #5D4E37;
  font-family: 'SourceHanSans-Black';
  line-height: 1;
}

.home-main {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 16px 24px;
  padding-top: 0;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  max-width: 1158px;
  margin: 0 auto;
  align-items: start;
}

.col-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E8DCC8;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.06);
  padding: 24px;
}

.selection-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.zone-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.zone-dot--red {
  background: #C43D3D;
}

.zone-dot--green {
  background: #5B8C5A;
}

.zone-title {
  font-family: 'SourceHanSans-Bold';
  font-size: 16px;
  color: #3D2B1F;
}

.zone-subtitle {
  font-family: 'SourceHanSans-Regular';
  font-size: 13px;
  color: #A09080;
}

.count-display {
  font-family: 'SourceHanSans-Regular';
  font-size: 13px;
  color: #A09080;
  margin-right: 2px;
}

.count-num {
  font-family: 'SourceHanSans-SemiBold';
  font-size: 14px;
  color: #5D4E37;
  width: 20px;
  text-align: center;
}

.adj-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid #D4C8B0;
  background: #F5EFE3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  color: #5D4E37;
  padding: 0;
  flex-shrink: 0;
}

.adj-btn:hover {
  background: #EDE6DC;
  border-color: #C4B49C;
}

.adj-btn:active {
  transform: scale(0.92);
}

.config-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.config-label {
  font-family: 'SourceHanSans-SemiBold';
  font-size: 15px;
  color: #3D2B1F;
  white-space: nowrap;
}

.config-control {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.multiplier-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.adj-btn--multiplier {
  width: 32px;
  height: 32px;
}

.counter-value-input {
  width: 56px;
  height: 32px;
  text-align: center;
  font-size: 16px;
  font-family: 'SourceHanSans-SemiBold';
  color: #3D2B1F;
  border: 1px solid #D4C8B0;
  border-radius: 8px;
  background: #FFFFFF;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.counter-value-input:focus {
  border-color: #C8A45C;
}

.multiplier-suffix {
  font-family: 'SourceHanSans-Regular';
  font-size: 14px;
  color: #A09080;
}

.col-center {
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 16px;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.bagua-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bagua-wrap > :deep(.bagua-diagram) {
  width: 242px;
  height: 242px;
}

.bagua-subtitle {
  font-family: 'SourceHanSans-Regular';
  font-size: 14px;
  color: #A09080;
  margin: 0;
  text-align: center;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 48px;
  border: none;
  border-radius: 16px;
  background: #C43D3D;
  color: #FFFFFF;
  font-family: 'SourceHanSans-Bold';
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 20px rgba(196, 61, 61, 0.3);
}

.generate-btn:active {
  transform: scale(0.95);
}

.generate-btn svg {
  width: 13px;
  height: 20px;
  flex-shrink: 0;
}

.col-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.rules-card {
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title {
  font-family: 'SourceHanSans-Bold';
  font-size: 16px;
  color: #3D2B1F;
}

.rule-grid {
  display: grid;
  gap: 12px;
}

.rule-grid--two {
  grid-template-columns: 1fr 1fr;
}

.rule-grid--three {
  grid-template-columns: 1fr 1fr 1fr;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #E8DCC8;
  background: #FFFFFF;
  box-shadow: 0 1px 4px rgba(139, 115, 85, 0.04);
}

.rule-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rule-name {
  font-family: 'SourceHanSans-Medium';
  font-size: 13px;
  color: #3D2B1F;
  white-space: nowrap;
}

.home-footer {
  position: relative;
  z-index: 10;
  background: #F5EFE3;
  border-top: 1px solid #E8DCC8;
  padding: 24px 0;
}

.footer-inner {
  max-width: 1158px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 24px;
}

.footer-text {
  font-family: 'SourceHanSans-Regular';
  font-size: 13px;
  color: #A09080;
}

.footer-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #C8A45C;
  flex-shrink: 0;
}

@media screen and (min-width: 1024px) {
  .home-main {
    padding: 16px 48px;
    padding-top: 0;
  }

  .main-grid {
    gap: 24px;
  }

  .generate-btn {
    padding: 18px 52px;
    font-size: 20px;
  }
}

@media screen and (max-width: 1023px) {
  .main-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .col-center {
    order: -1;
    position: static;
  }

  .bagua-wrap > :deep(.bagua-diagram) {
    width: 200px;
    height: 200px;
  }

  .col-left {
    gap: 14px;
  }

  .col-right {
    gap: 14px;
  }

  .rule-grid--two {
    grid-template-columns: 1fr 1fr;
  }

  .rule-grid--three {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media screen and (max-width: 767px) {
  .home-main {
    padding: 12px;
    padding-top: 0;
  }

  .card {
    padding: 16px;
  }

  .zone-title {
    font-size: 15px;
  }

  .zone-subtitle {
    font-size: 12px;
  }

  .count-display {
    font-size: 12px;
  }

  .adj-btn {
    width: 26px;
    height: 26px;
  }

  .config-label {
    font-size: 14px;
  }

  .counter-value-input {
    width: 48px;
    height: 30px;
    font-size: 15px;
  }

  .bagua-wrap > :deep(.bagua-diagram) {
    width: 180px;
    height: 180px;
  }

  .bagua-subtitle {
    font-size: 13px;
  }

  .generate-btn {
    padding: 14px 36px;
    font-size: 16px;
    border-radius: 14px;
  }

  .generate-btn svg {
    width: 11px;
    height: 17px;
  }

  .rules-card {
    padding: 16px;
  }

  .section-title {
    font-size: 15px;
  }

  .rule-grid--two {
    grid-template-columns: 1fr 1fr;
  }

  .rule-grid--three {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .rule-item {
    padding: 10px 12px;
  }

  .rule-icon-box {
    width: 28px;
    height: 28px;
  }

  .rule-name {
    font-size: 12px;
  }

  .home-footer {
    padding: 20px 0;
  }

  .footer-inner {
    padding: 0 16px;
  }

  .footer-text {
    font-size: 12px;
  }

  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    height: 400px;
  }
}
</style>