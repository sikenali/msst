<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RiMoneyCnyCircleFill, RiSparkling2Fill, RiScissors2Line, RiNumbersLine, RiCandleLine, RiDropLine, RiGridLine } from '@remixicon/vue'
import { useUserSelections, setCurrentType } from '@/composables/useUserSelections'
import { setCurrentLotteryType } from '@/composables/useLottery'
import Toast from '@/components/Toast.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import PageHeader from '@/components/PageHeader.vue'
import BaguaDiagram from '@/components/BaguaDiagram.vue'
import NoteCounter from '@/components/NoteCounter.vue'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'
import WuxingNumberGrid from '@/components/WuxingNumberGrid.vue'
import BackZoneGrid from '@/components/BackZoneGrid.vue'
import RuleDrawer from '@/components/RuleDrawer.vue'
import KillRulesModal from '@/components/KillRulesModal.vue'
import SelectModal from '@/components/SelectModal.vue'
import BoldModal from '@/components/BoldModal.vue'
import FilterModal from '@/components/FilterModal.vue'
import MatrixModal from '@/components/MatrixModal.vue'
import WuxingQilieModal from '@/components/WuxingQilieModal.vue'

const router = useRouter()
const route = useRoute()

const rulesIcons = [
  { type: 'shahao', label: '杀号', icon: RiScissors2Line, color: '#EF4444' },
  { type: 'xuanhao', label: '选号', icon: RiNumbersLine, color: '#F59E0B' },
  { type: 'dingdan', label: '定胆', icon: RiCandleLine, color: '#8B5CF6' },
  { type: 'guolv', label: '过滤', icon: RiDropLine, color: '#3B82F6' },
  { type: 'juzhen', label: '矩阵', icon: RiGridLine, color: '#8B5CF6' },
]

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
const redCount = ref(6)
const blueCount = ref(1)
const multiplierCount = ref(1)
watch(lotteryType, (type) => {
  if (type === 'ssq') {
    redCount.value = 6
    blueCount.value = 1
  } else {
    redCount.value = 5
    blueCount.value = 2
  }
}, { immediate: true })

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

// 侧滑抽屉状态
const showRuleDrawer = ref(false)
const activeRuleType = ref('')

const ruleTitles: Record<string, string> = {
  shahao: '杀号',
  xuanhao: '选号',
  dingdan: '定胆',
  guolv: '过滤',
  juzhen: '矩阵',
}

function handleDrawerClose() {
  showRuleDrawer.value = false
  activeRuleType.value = ''
}

function handleOpenModal(type: string) {
  const titles: Record<string, string> = {
    shahao: '杀号', xuanhao: '选号', dingdan: '定胆',
    guolv: '过滤', juzhen: '矩阵'
  }
  activeRuleType.value = type
  showRuleDrawer.value = true
}

function handleHistory() {
  showKillRulesModal.value = true
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
    // 使用路由参数中的注数和模式，或默认值
    const notesCount = Number(route.query.notes) || multiplierCount.value
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
  const finalNotes = Math.max(1, multiplierCount.value)
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
      @logo-click="reload"
      @history="handleHistory"
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
          <p class="tip-copyright">©2099  彩友所有  主任的机(sui)制(ji)不如机智的我</p>
          <div class="tip-text-wrapper">
            <p class="tip-message">其实你有1000万存款，只不过你忘记了取款密码，每输入一次需要2元，一旦正确，钱就是你的，不着急，不放弃，心若在，梦就在。</p>

            <!-- 九字真言 -->
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

    <!-- 主内容区：三栏布局（40% / 35% / 25%） -->
    <main class="home-main">
      <div class="main-inner" :class="'theme-' + lotteryType">
        <!-- 左栏 40%：选号 + 参数 -->
        <div class="layout-col layout-col--left">
          <!-- 红佛女 -->
          <div class="inline-section">
            <div class="inline-section__title" style="color:#EF4444">红佛女</div>
            <WuxingNumberGrid
              v-model="userRedNumbers"
              :lottery-type="lotteryType"
              :total-numbers="lotteryType === 'ssq' ? 33 : 35"
              :max-count="lotteryType === 'ssq' ? 6 : 5"
              @select="setRedNumbers"
            />
          </div>
          <!-- 蓝若寺 -->
          <div class="inline-section">
            <div class="inline-section__title" style="color:#3B82F6">蓝若寺</div>
            <BackZoneGrid
              v-model="userBlueNumbers"
              :lottery-type="lotteryType"
              :total-numbers="lotteryType === 'ssq' ? 16 : 12"
              :max-count="lotteryType === 'ssq' ? 1 : 2"
              @select="setBlueNumbers"
            />
          </div>
          <!-- 运数 -->
          <div class="inline-section">
            <div class="inline-section__title">运数</div>
            <div class="counter-row">
              <div class="counter-item">
                <span class="counter-item__title" style="color:#EF4444">红佛女</span>
                <NoteCounter v-model="redCount" :theme="lotteryType" compact />
              </div>
              <div class="counter-item">
                <span class="counter-item__title" style="color:#3B82F6">蓝若寺</span>
                <NoteCounter v-model="blueCount" :theme="lotteryType" compact />
              </div>
              <div class="counter-item">
                <span class="counter-item__title">注数</span>
                <NoteCounter v-model="multiplierCount" :theme="lotteryType" compact />
              </div>
            </div>
          </div>
          <!-- 运式 -->
          <div class="inline-section">
            <div class="inline-section__title">运式</div>
            <div class="mode-row">
              <div class="mode-item">
                <span class="mode-item__label">单式</span>
                <button class="mode-selector-btn theme-btn" :class="{ active: mode === 'single' }" @click="mode = 'single'">
                  <span class="die die--1">⚀</span>
                </button>
              </div>
              <div class="mode-item">
                <span class="mode-item__label">复式</span>
                <button class="mode-selector-btn theme-btn" :class="{ active: mode === 'multiple' }" @click="mode = 'multiple'">
                  <span class="die die--2">⚁</span>
                </button>
              </div>
              <div class="mode-item">
                <span class="mode-item__label">胆拖</span>
                <button class="mode-selector-btn theme-btn" :class="{ active: mode === 'dantuo' }" @click="mode = 'dantuo'">
                  <span class="die die--3">⚂</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 中栏 35%：八卦图卡片 -->
        <div class="layout-col layout-col--center">
          <div class="bagua-card-wrapper">
            <BaguaDiagram :theme="lotteryType" :spinning="isSpinning" :notes="notes" />
            <div class="generate-btn-wrapper">
              <button 
                class="generate-btn theme-btn" 
                :style="{ background: buttonGradient }" 
                @click="handleGenerate"
                :aria-label="lotteryType === 'ssq' ? '生成双色球号码' : '生成大乐透号码'"
              >
                <RiMoneyCnyCircleFill v-if="lotteryType === 'ssq'" class="generate-icon" />
                <CopperCoinIcon v-else class="generate-icon" />
                <div class="generate-spacer"></div>
                <span class="generate-text">{{ buttonText }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 右栏 25%：规则入口 -->
        <div class="layout-col layout-col--right">
          <div class="rule-entry-section">
            <div class="inline-section__title">运势</div>
            <div class="rule-icon-row">
              <button v-for="r in rulesIcons" :key="r.type" class="rule-icon" @click="handleOpenModal(r.type)">
                <span class="rule-icon-emoji" :style="{ color: r.color }">
                  <component :is="r.icon" class="rule-icon-svg" />
                </span>
                <span class="rule-icon-label">{{ r.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 侧滑抽屉面板 -->
    <RuleDrawer :visible="showRuleDrawer" :title="ruleTitles[activeRuleType] || '规则设置'" @close="handleDrawerClose">
      <KillRulesModal
        v-if="showRuleDrawer && activeRuleType === 'shahao'"
        :visible="true"
        :lottery-type="lotteryType"
        @close="handleDrawerClose"
        @apply="handleDrawerClose"
      />
      <SelectModal
        v-else-if="showRuleDrawer && activeRuleType === 'xuanhao'"
        :visible="true"
        :lottery-type="lotteryType"
        @close="handleDrawerClose"
        @apply="handleDrawerClose"
      />
      <BoldModal
        v-else-if="showRuleDrawer && activeRuleType === 'dingdan'"
        :visible="true"
        :lottery-type="lotteryType"
        @close="handleDrawerClose"
        @apply="handleDrawerClose"
      />
      <FilterModal
        v-else-if="showRuleDrawer && activeRuleType === 'guolv'"
        :visible="true"
        :lottery-type="lotteryType"
        @close="handleDrawerClose"
        @apply="handleDrawerClose"
      />
      <MatrixModal
        v-else-if="showRuleDrawer && activeRuleType === 'juzhen'"
        :visible="true"
        :lottery-type="lotteryType"
        @close="handleDrawerClose"
        @apply="handleDrawerClose"
      />
    </RuleDrawer>

    <!-- 间距 -->
    <div class="bottom-spacer"></div>

    <!-- 底部版权 -->
    <footer class="home-footer">
      <div class="footer-inner">
        <p class="footer-text">
          <span class="footer-left">© 2026 妙手神透</span>
          <span class="footer-center">Powered by LightOS</span>
          <span class="footer-right">主任的机制不如机智的我</span>
        </p>
      </div>
    </footer>

    <!-- Toast 提示组件 -->
    <Toast />
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

/* 九字真言 */
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
  color: #D97706;
  opacity: 0.7;
}

.mantra-char {
  font-size: 20px;
  font-weight: 900;
  color: #92400E;
  font-family: 'SourceHanSans-Black';
  line-height: 1;
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
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  max-width: 960px;
  margin: 0 auto;
  gap: 0;
  position: relative;
}

.layout-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
.layout-col--left {
  flex: 0.4;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.layout-col--center {
  flex: 0.35;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.layout-col--right {
  flex: 0.25;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
}
.inline-section {
  width: 100%;
}
.inline-section__title {
  font-size: 13px;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  margin-bottom: 6px;
  text-align: center;
}
.counter-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
}
.counter-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.counter-item__title {
  font-size: 11px;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  white-space: nowrap;
  text-align: center;
  width: 100%;
}
.note-counter.compact .counter-input {
  height: 30px;
  border-radius: 6px;
}
.note-counter.compact .counter-btn {
  flex: 0 0 28px;
  min-width: 28px;
  width: 28px;
}
.note-counter.compact .counter-icon {
  width: 12px;
  height: 12px;
}
.note-counter.compact .counter-value-input {
  font-size: 12px;
}
.note-counter {
  flex: 1;
  min-width: 0;
}
.note-counter :deep(.counter-input) {
  border: none !important;
  background: transparent !important;
}
.note-counter :deep(.counter-btn) {
  flex: 0 0 28px !important;
  min-width: 28px !important;
  width: 28px !important;
}
.note-counter :deep(.counter-icon) {
  width: 12px !important;
  height: 12px !important;
}
.note-counter :deep(.counter-value-input) {
  font-size: 12px !important;
}
.mode-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.mode-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.mode-item__label {
  font-size: 11px;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  white-space: nowrap;
  text-align: center;
}
.mode-selector-btn {
  width: 100%;
  padding: 8px 4px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  transition: all 0.2s ease;
}
.mode-selector-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.04);
}
.mode-selector-btn.active {
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.mode-icon-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.die {
  font-size: 24px;
  line-height: 1;
  color: #DC2626;
}
.die--1 { color: #EF4444; }
.die--2 { color: #F59E0B; }
.die--3 { color: #8B5CF6; }
.rule-icon-row {
  display: flex;
  gap: 6px;
  width: 100%;
}
.rule-icon {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  transition: all 0.2s ease;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
}
.rule-icon:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.04);
}
.rule-icon-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.rule-icon-svg {
  width: 18px;
  height: 18px;
}
.rule-icon-label {
  font-size: 11px;
  white-space: nowrap;
  line-height: 1;
}
.rule-entry-section {
  width: 100%;
}
.bagua-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 生财按钮 */
.generate-btn-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 8px;
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

/* 底部间距 */
.bottom-spacer {
  height: 16px;
}

.home-footer {
  width: 100%;
  background: transparent;
  padding: 16px 24px;
  position: relative;
  z-index: 10;
}

.footer-inner {
  padding: 0;
  max-width: none;
  margin: 0;
  width: 100%;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  box-sizing: border-box;
}

.footer-text {
  width: 100%;
  font-size: 12px;
  line-height: 1.4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(146, 64, 14, 0.5);
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

.footer-left,
.footer-right {
  white-space: nowrap;
  opacity: 0.75;
}

.footer-center {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

/* 平板适配：调整三栏比例 */
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .layout-col--left { flex: 0.35; }
  .layout-col--center { flex: 0.35; }
  .layout-col--right { flex: 0.3; }
}

/* 桌面端适配 */
@media screen and (min-width: 1024px) {
  .main-inner {
    padding: 12px 144px;
    max-width: 672px;
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

  .home-footer {
    padding: 20px 48px;
  }

  .footer-inner {
    padding: 0;
    max-width: none;
    margin: 0;
  }

  .footer-text {
    font-size: 12px;
  }

  .bottom-spacer {
    height: 12px;
  }
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .main-inner {
    flex-direction: column;
    gap: 16px;
  }

  .layout-col--left,
  .layout-col--center,
  .layout-col--right {
    flex: none;
    width: 100%;
  }

  /* 八卦图在移动端置顶 */
  .layout-col--center {
    order: -1;
  }

  .layout-col--left {
    order: 0;
  }

  .layout-col--right {
    order: 1;
  }

  .home-footer {
    padding: 12px 16px;
  }

  .footer-inner {
    padding: 0;
    max-width: none;
    margin: 0;
  }

  /* 主内容区内边距调整 */
  .main-inner {
    padding: 16px 12px;
  }

  /* 规则弹窗移动端适配 */
  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    width: 500px;
    height: 400px;
  }
}
</style>