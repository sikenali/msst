<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RiMoneyCnyCircleFill } from '@remixicon/vue'
import { useUserSelections, setCurrentType } from '@/composables/useUserSelections'
import { setCurrentLotteryType } from '@/composables/useLottery'
import TabSwitcher from '@/components/TabSwitcher.vue'
import PageHeader from '@/components/PageHeader.vue'
import BaguaDiagram from '@/components/BaguaDiagram.vue'
import NoteCounter from '@/components/NoteCounter.vue'
import ModeSelector from '@/components/ModeSelector.vue'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'
import TurtleIcon from '@/components/TurtleIcon.vue'
import FloatingLeftPanel from '@/components/FloatingLeftPanel.vue'
import FloatingRightPanel from '@/components/FloatingRightPanel.vue'
import IconModal from '@/components/IconModal.vue'
import NumberPickerModal from '@/components/NumberPickerModal.vue'

const router = useRouter()
const route = useRoute()

const lotteryType = ref<'ssq' | 'dlt'>((route.query.type as 'ssq' | 'dlt') || 'ssq')

// 同步当前彩种类型到全局状态
watch(lotteryType, (newType) => {
  setCurrentType(newType)
  setCurrentLotteryType(newType)
}, { immediate: true })

// 使用 computed 动态获取当前彩种的注数
const notes = computed({
  get: () => {
    const { userNotes } = useUserSelections()
    return userNotes.value
  },
  set: (val: number) => {
    const { setNotes } = useUserSelections()
    setNotes(val)
  }
})
const mode = ref<'single' | 'multiple' | 'dantuo'>('single')
const showRulesModal = ref(false)
const isSpinning = ref(false)
const counterAutofocus = ref(false)

// 浮动面板弹框
const showIconModal = ref(false)
const currentModalType = ref('')

// 号码选择弹框
const showPickerModal = ref(false)
const pickerType = ref<'blue' | 'red'>('blue')
const pickerTitle = ref('')
const pickerSelectedNumbers = ref<number[]>([])

function handleOpenModal(type: string) {
  // 蓝若寺和红佛女打开号码选择器
  if (type === 'lanruo') {
    pickerType.value = 'blue'
    pickerTitle.value = '蓝若寺'
    pickerSelectedNumbers.value = []
    showPickerModal.value = true
    return
  }

  if (type === 'hongfolv') {
    pickerType.value = 'red'
    pickerTitle.value = '红佛女'
    pickerSelectedNumbers.value = []
    showPickerModal.value = true
    return
  }

  // 其他类型打开普通弹框
  currentModalType.value = type
  showIconModal.value = true
}

function handleCloseModal() {
  showIconModal.value = false
}

function handlePickerConfirm(numbers: number[]) {
  console.log('选中的号码:', numbers)
  // TODO: 将选中的号码存储起来，用于后续号码生成
  pickerSelectedNumbers.value = numbers
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
const generateRain = (count: number, type: 'ssq' | 'dlt') => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 8, // Slower: 8s to 16s
    opacity: 0.1 + Math.random() * 0.25,
    scale: 0.6 + Math.random() * 0.6,
    type: type
  }))
}

const ssqRain = generateRain(20, 'ssq')
const dltRain = generateRain(20, 'dlt')
const currentRain = computed(() => lotteryType.value === 'ssq' ? ssqRain : dltRain)

watch(() => route.query.type, (newType) => {
  if (newType === 'ssq' || newType === 'dlt') {
    lotteryType.value = newType
  }
})

// Auto generate
const autoGenerate = computed(() => route.query.autoGenerate === '1')

// 分享模式下直接跳转到结果页，跳过首页动画
if (autoGenerate.value) {
  const shareType = (route.query.type as 'ssq' | 'dlt') || 'ssq'
  const shareNotes = Number(route.query.notes) || 5
  const shareMode = (route.query.mode as 'single' | 'multiple' | 'dantuo') || 'single'
  const shareNumbers = route.query.numbers as string | undefined

  // 同步数据到全局状态
  const { setNotes, setMode } = useUserSelections()
  setNotes(shareNotes)
  setMode(shareMode)

  // 直接跳转到结果页，传递所有参数
  const resultQuery: Record<string, string> = {
    type: shareType,
    notes: String(shareNotes),
    mode: shareMode,
    share: '1',
  }
  
  if (shareNumbers) {
    resultQuery.numbers = shareNumbers
  }

  router.replace({
    path: '/result',
    query: resultQuery,
  })
}

// 同步路由参数到本地状态
watch(() => route.query.notes, (val) => {
  const notesNum = Number(val) || 5
  const { setNotes } = useUserSelections()
  setNotes(notesNum)
}, { immediate: true })

watch(() => route.query.mode, (val) => {
  if (val === 'single' || val === 'multiple' || val === 'dantuo') {
    const { setMode } = useUserSelections()
    setMode(val)
  }
}, { immediate: true })

watch(autoGenerate, async (shouldAutoGenerate) => {
  if (shouldAutoGenerate) {
    // 使用路由参数中的注数和模式
    const notesCount = Number(route.query.notes) || 5
    const currentMode = (route.query.mode as string) || 'single'
    
    console.log('生成注数:', notesCount, '模式:', currentMode)
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
        share: '1', // 添加分享标识，结果页识别后进入分享模式
      },
    })
  }
}, { immediate: true })

async function handleGenerate() {
  const { userRedNumbers, userBlueNumbers } = useUserSelections()
  
  // 获取用户固定号码
  const redCount = userRedNumbers.value.length
  const blueCount = userBlueNumbers.value.length
  
  // 智能判断模式和注数
  let finalMode: 'single' | 'multiple' | 'dantuo' = mode.value
  let finalNotes = notes.value

  if (lotteryType.value === 'ssq') {
    // 双色球逻辑
    if (redCount === 6 && blueCount === 1) {
      // 刚好6+1，单式1注
      finalMode = 'single'
      finalNotes = 1
    } else if (redCount > 6 || blueCount > 1) {
      // 红球>6个 或 蓝球>1个，复式
      finalMode = 'multiple'
      finalNotes = 1
    } else if (redCount > 0 || blueCount > 0) {
      // 有固定号码但不足标准数量，保持用户选择的模式
      finalMode = mode.value
      finalNotes = notes.value
    }
  } else {
    // 大乐透逻辑
    if (redCount === 5 && blueCount === 2) {
      // 刚好5+2，单式1注
      finalMode = 'single'
      finalNotes = 1
    } else if (redCount > 5 || blueCount > 2) {
      // 前区>5个 或 后区>2个，复式
      finalMode = 'multiple'
      finalNotes = 1
    } else if (redCount > 0 || blueCount > 0) {
      // 有固定号码但不足标准数量，保持用户选择的模式
      finalMode = mode.value
      finalNotes = notes.value
    }
  }

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
  window.location.reload()
}
</script>

<template>
  <div class="home-page">
    <!-- 背景动画层 -->
    <div class="rain-bg">
      <div
        v-for="drop in currentRain"
        :key="drop.id"
        class="rain-drop"
        :style="{
          left: `${drop.left}%`,
          animationDelay: `${drop.delay}s`,
          animationDuration: `${drop.duration}s`,
          opacity: drop.opacity,
          '--rain-scale': drop.scale
        }"
      >
        <RiMoneyCnyCircleFill v-if="drop.type === 'ssq'" class="rain-icon" />
        <CopperCoinIcon v-else class="rain-icon dlt-rain" />
      </div>
    </div>

    <!-- 顶部导航栏 -->
    <PageHeader
      v-model="lotteryType"
      @info="openRules"
      @logo-click="reload"
    />

    <!-- 规则弹窗 -->
    <div class="modal-overlay" v-if="showRulesModal" @click="closeRules">
      <div class="modal-content" @click.stop>
        <div class="modal-tip-content">
          <div class="tip-icon-wrapper">
            <svg class="tip-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 双手作揖 -->
              <path d="M12 2C10 4 8 6 8 9C8 12 10 14 12 16C14 14 16 12 16 9C16 6 14 4 12 2Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
              <path d="M7 10C5 11 3 14 4 17C5 20 8 21 10 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
              <path d="M17 10C19 11 21 14 20 17C19 20 16 21 14 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
              <path d="M10 18L12 22L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <div class="tip-text-wrapper">
            <p class="tip-message">其实你有1000万存款，只不过你忘记了取款密码，每输入一次需要2元，一旦正确，钱就是你的，不着急，不放弃，心若在，梦就在。</p>
            <p class="tip-copyright">@2026 sikenali  Vibe Coding</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="home-main">
      <div class="main-inner">
        <!-- 左侧浮动面板（乌龟） -->
        <FloatingLeftPanel @open-modal="handleOpenModal" />

        <!-- 右侧浮动面板（木鱼） -->
        <FloatingRightPanel @open-modal="handleOpenModal" />

        <!-- 八卦图 -->
        <BaguaDiagram :theme="lotteryType" :spinning="isSpinning" :notes="notes" />

        <!-- 生财/有道按钮 -->
        <div class="generate-btn-wrapper">
          <button class="generate-btn" :style="{ background: buttonGradient }" @click="handleGenerate">
            <RiMoneyCnyCircleFill v-if="lotteryType === 'ssq'" class="generate-icon" />
            <CopperCoinIcon v-else class="generate-icon" />
            <div class="generate-spacer"></div>
            <span class="generate-text">{{ buttonText }}</span>
          </button>
        </div>
      </div>
    </main>

    <!-- 间距 -->
    <div class="bottom-spacer"></div>

    <!-- 底部版权 -->
    <footer class="home-footer">
      <div class="footer-inner">
        <p class="footer-text">
          <span v-if="lotteryType === 'ssq'">一花一世界 · 一叶一菩提</span>
          <span v-else>道生一 一生二 · 二生三 三生万物</span>
        </p>
      </div>
    </footer>

    <!-- 图标弹框 -->
    <IconModal
      :visible="showIconModal"
      :type="currentModalType"
      :lottery-type="lotteryType"
      @close="handleCloseModal"
    />

    <!-- 号码选择弹框 -->
    <NumberPickerModal
      :visible="showPickerModal"
      :title="pickerTitle"
      :type="pickerType"
      :lottery-type="lotteryType"
      :selected-numbers="pickerSelectedNumbers"
      @confirm="handlePickerConfirm"
      @close="handlePickerClose"
    />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(254,243,199,1) 0%, rgba(255,251,235,1) 50%, rgba(254,243,199,1) 100%);
  position: relative;
}

/* 背景雨动画 */
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
  color: #B45309; /* 双色球金色 */
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.rain-icon.dlt-rain {
  color: #1D4ED8; /* 大乐透蓝色 */
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

/* 规则弹窗 */
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
  background: linear-gradient(135deg, rgba(254,243,199,1) 0%, rgba(255,251,235,1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FCD34D;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.tip-icon-svg {
  width: 32px;
  height: 32px;
  color: #D97706;
}

.tip-message {
  font-size: 15px;
  line-height: 1.8;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
  margin: 0;
  text-align: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(254,243,199,0.5) 0%, rgba(255,251,235,0.8) 50%, rgba(254,243,199,0.5) 100%);
  border-radius: 12px;
  border: 1px solid rgba(253, 230, 138, 0.6);
  box-shadow: inset 0 1px 3px rgba(180, 83, 9, 0.08);
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
  color: #B45309;
  font-family: 'SourceHanSans-Medium';
  text-align: center;
  margin: 0;
  opacity: 0.85;
  letter-spacing: 0.5px;
}

/* 主内容区 */
.home-main {
  flex: 1;
  position: relative;
  z-index: 1;
}

.main-inner {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 672px;
  margin: 0 auto;
  gap: 10px;
  position: relative;
}

/* 配置标题 */
.config-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 12px 0;
}

.config-tag {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: var(--config-tag-text, #DC2626);
  background: var(--config-tag-bg, #FEE2E2);
  font-family: 'SourceHanSans-Medium';
  white-space: nowrap;
  transition: all 0.15s;
}

.config-tag--active-ssq {
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  color: #FFFFFF;
  font-family: 'SourceHanSans-SemiBold';
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
}

.config-tag--active-dlt {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  color: #FFFFFF;
  font-family: 'SourceHanSans-SemiBold';
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
}

.config-spacer {
  height: 16px;
}

/* 生财按钮 */
.generate-btn-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.generate-btn {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  border: 3px solid #FFFFFF;
  box-shadow: 0 12px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
  cursor: pointer;
}

.generate-btn:active {
  transform: scale(0.95);
}

.generate-icon {
  width: 30px;
  height: 26px;
  color: #FFFFFF;
}

.generate-spacer {
  height: 2px;
}

.generate-text {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #FFFFFF;
  font-family: 'SourceHanSans-ExtraBold';
}

/* 配置标题（按钮下方，间距加大） */
.config-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
}

.config-tag {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  color: #FFFFFF;
  font-family: 'SourceHanSans-SemiBold';
  white-space: nowrap;
  transition: all 0.15s;
}

.config-tag--active-ssq {
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
}

.config-tag--active-dlt {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
}

/* 底部间距 */
.bottom-spacer {
  height: 16px;
}

/* 底部版权 - 悬浮透明背景 */
.home-footer {
  background: transparent;
  padding: 12px 0;
  position: relative;
  z-index: 10;
}

.footer-inner {
  padding: 0 24px;
  max-width: 1158px;
  margin: 0 auto;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  box-sizing: border-box;
  padding-top: 10px;
  padding-bottom: 10px;
}

.footer-text {
  width: 100%;
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  color: #92400E;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

/* 平板适配 */
@media screen and (min-width: 768px) {
  .header-inner {
    padding: 0 32px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .header-content {
    padding: 12px 0;
    border-radius: 20px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
  }

  .logo-svg {
    width: 15px;
    height: 20px;
    font-size: 13px;
  }

  .logo-text {
    font-size: 20px;
  }

  .info-btn {
    width: 34px;
    height: 34px;
  }

  .main-inner {
    padding: 24px 32px;
  }

  .config-card {
    padding: 20px;
  }

  .config-title {
    font-size: 20px;
  }

  .generate-btn {
    width: 96px;
    height: 96px;
  }

  .generate-icon {
    width: 30px;
    height: 26px;
  }

  .generate-text {
    font-size: 18px;
  }
}

/* 桌面端适配 */
@media screen and (min-width: 1024px) {
  .home-header {
    padding: 10px 0;
  }

  .header-inner {
    padding: 0 48px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .header-content {
    padding: 12px 0;
    border-radius: 24px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
  }

  .logo-svg {
    width: 15px;
    height: 19px;
    font-size: 13px;
  }

  .logo-spacer {
    width: 8px;
  }

  .logo-text {
    font-size: 20px;
  }

  .info-btn {
    width: 42px;
    height: 42px;
  }

  .info-icon-svg {
    width: 24px;
    height: 24px;
  }

  .main-inner {
    padding: 12px 144px;
    max-width: 672px;
    gap: 6px;
  }

  .config-card {
    padding: 12px;
  }

  .config-title {
    font-size: 20px;
    margin-bottom: 4px !important;
  }

  .config-tag {
    padding: 3px 8px;
    font-size: 14px;
  }

  .config-spacer {
    height: 8px;
  }

  .generate-btn-wrapper {
    margin-top: 8px;
  }

  .generate-btn {
    width: 100px;
    height: 100px;
  }

  .generate-icon {
    width: 32px;
    height: 28px;
  }

  .generate-spacer {
    height: 2px;
  }

  .generate-text {
    font-size: 18px;
  }

  .tip-title {
    font-size: 14px;
  }

  .tip-text {
    font-size: 12px;
  }

  .home-footer {
    padding: 10px 0;
  }

  .footer-inner {
    padding: 0 32px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    border-radius: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .footer-text {
    font-size: 12px;
  }

  .bottom-spacer {
    height: 12px;
  }
}

/* 移动端适配修正：解决 Logo 遮挡导航标签问题 */
@media screen and (max-width: 767px) {
  /* Header 容器垂直内边距，水平由 header-inner 控制以对齐 main-inner */
  .home-header {
    padding: 12px 0;
  }

  .header-inner {
    padding: 0 16px;
    max-width: 1158px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .header-content {
    width: 100%;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
    box-sizing: border-box;
  }

  .tab-wrapper {
    flex: 1 1 auto;
    min-width: 0;
    overflow: visible;
    margin: 0 4px;
  }

  .tab-wrapper > :deep(.tab-container) {
    transform: scale(0.8);
    transform-origin: center center;
  }

  .home-footer {
    padding: 12px 0;
  }

  .footer-inner {
    padding: 0 16px;
    max-width: 1158px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    border-radius: 12px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  /* config-card 移动端字号和间距缩小 */
  .config-card {
    padding: 16px;
  }

  .config-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .config-spacer {
    height: 16px;
  }

  /* config-card 内部的 NoteCounter 字号调整 */
  .config-card :deep(.counter-label) {
    font-size: 15px !important;
  }

  .config-card :deep(.counter-value-input) {
    font-size: 17px !important;
  }

  .config-card :deep(.counter-icon) {
    width: 20px !important;
    height: 20px !important;
  }

  .config-card :deep(.counter-input) {
    height: 48px !important;
  }

  .config-card :deep(.counter-btn) {
    flex: 0 0 48px !important;
    min-width: 48px !important;
    width: 48px !important;
  }

  /* Header 内边距调整 */
  .header-inner {
    padding: 0;
  }

  /* 主内容区内边距调整，与 header 对齐 */
  .main-inner {
    padding: 16px 12px;
  }

  .header-content {
    width: 100%;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
  }

  .logo-area {
    flex-shrink: 0;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-svg {
    width: 16px;
    height: 22px;
    font-size: 14px;
  }

  .logo-spacer {
    width: 4px;
  }

  .logo-text {
    font-size: 15px;
    max-width: 80px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .tab-wrapper {
    position: relative;
    left: auto;
    right: auto;
    transform: none;
    margin: 0 4px;
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: visible;
    pointer-events: auto;
  }

  .tab-wrapper > :deep(.tab-container) {
    transform: scale(0.8);
    transform-origin: center center;
  }

  .info-btn {
    width: 32px;
    height: 32px;
    margin-left: 0;
    margin-right: 0;
    flex-shrink: 0;
  }

  /* 防止选项卡在窄屏下挤压按钮 */
  .tab-wrapper {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    margin: 0 4px;
  }

  .tab-wrapper > :deep(.tab-container) {
    transform: scale(0.8);
    transform-origin: center center;
  }

  .info-icon {
    width: 24px;
    height: 24px;
    font-size: 24px;
  }

  /* 规则弹窗移动端适配 */
  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    width: 500px;
    height: 400px;
  }

  .modal-header {
    padding: 12px 12px 0 12px;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .modal-title {
    font-size: 15px;
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .modal-tip {
    padding: 2px 6px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .modal-tip-text {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .modal-close {
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    margin-left: auto;
  }

  .close-icon {
    width: 16px;
    height: 16px;
  }

  .modal-divider {
    margin: 12px 16px 0 16px;
  }

  .modal-body {
    padding: 16px 16px 20px 16px;
  }

  .rule-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .rule-title::first-letter {
    font-size: 16px;
  }

  .rule-list {
    padding: 0 0 0 8px;
  }

  .rule-item {
    margin-bottom: 8px;
  }

  .rule-num {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }

  .rule-spacer {
    width: 6px;
  }

  .rule-text {
    font-size: 13px;
  }
}
</style>