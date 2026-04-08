<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RiMoneyCnyCircleFill, RiCloseLine } from '@remixicon/vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import BaguaDiagram from '@/components/BaguaDiagram.vue'
import NoteCounter from '@/components/NoteCounter.vue'
import ModeSelector from '@/components/ModeSelector.vue'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'
import TurtleIcon from '@/components/TurtleIcon.vue'

const router = useRouter()
const route = useRoute()

const lotteryType = ref<'ssq' | 'dlt'>((route.query.type as 'ssq' | 'dlt') || 'ssq')
const notes = ref(1)
const mode = ref<'single' | 'multiple' | 'dantuo'>('single')
const showRulesModal = ref(false)
const isSpinning = ref(false)
const counterAutofocus = ref(false)

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

watch(autoGenerate, async (shouldAutoGenerate) => {
  if (shouldAutoGenerate) {
    isSpinning.value = true
    // 根据注数动态计算等待时间（与BaguaDiagram旋转时间一致）
    const notesCount = notes.value
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
        notes: notes.value,
        mode: mode.value,
      },
    })
  }
})

async function handleGenerate() {
  isSpinning.value = true
  // 根据注数动态计算等待时间（与BaguaDiagram旋转时间一致）
  const notesCount = notes.value
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
      notes: notes.value,
      mode: mode.value,
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
    <header class="home-header">
      <div class="header-inner">
        <div class="header-content">
          <!-- Logo区域 -->
          <div class="logo-area" style="cursor: pointer;" @click="reload">
            <div class="logo-icon">
              <RiMoneyCnyCircleFill class="logo-svg" />
            </div>
            <div class="logo-spacer"></div>
            <h1 class="logo-text">妙手神透</h1>
          </div>

          <!-- 选项卡容器: 水平居中 -->
          <div class="tab-wrapper">
            <TabSwitcher v-model="lotteryType" />
          </div>

          <!-- 说明按钮 -->
          <button class="info-btn" @click="openRules">
            <TurtleIcon class="info-icon" />
          </button>
        </div>
      </div>
    </header>

    <!-- 规则弹窗 -->
    <div class="modal-overlay" v-if="showRulesModal" @click="closeRules">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">玩法规则说明</h3>
          <div class="modal-tip">
            <TurtleIcon class="modal-tip-icon" />
            <span class="modal-tip-text">温馨提示：理性购彩，量力而行，本工具仅供娱乐使用</span>
          </div>
          <button class="modal-close" @click="closeRules">
            <RiCloseLine class="close-icon" />
          </button>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-body">
          <h4 class="rule-title rule-title--red">🔴 双色球玩法规则</h4>
          <div class="rule-list">
            <div class="rule-item">
              <div class="rule-num rule-num--red">1</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">红球：从1-33中随机选择6个不重复号码，按升序排列</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--blue">2</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">蓝球：从1-16中随机选择1个号码</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--gold">3</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">支持单式、自定义注数、复式多种投注模式</p>
            </div>
          </div>
          <div class="modal-divider"></div>
          <h4 class="rule-title rule-title--blue">🔵 大乐透玩法规则</h4>
          <div class="rule-list">
            <div class="rule-item">
              <div class="rule-num rule-num--red">1</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">前区：从1-35中随机选择5个不重复号码，按升序排列</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--blue">2</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">后区：从1-12中随机选择2个不重复号码</p>
            </div>
            <div class="rule-item">
              <div class="rule-num rule-num--gold">3</div>
              <div class="rule-spacer"></div>
              <p class="rule-text">支持单式、自定义注数、复式多种投注模式</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="home-main">
      <div class="main-inner">
        <!-- 八卦图 -->
        <BaguaDiagram :theme="lotteryType" :spinning="isSpinning" :notes="notes" />

        <!-- 选号配置区 -->
        <div class="config-card">
          <div class="config-title">
            <template v-if="lotteryType === 'ssq'">
              <span class="config-tag config-tag--active-ssq">一花一世界</span>
              <span class="config-tag config-tag--active-ssq">一叶一菩提</span>
            </template>
            <template v-else>
              <span class="config-tag config-tag--active-dlt">道生一 一生二</span>
              <span class="config-tag config-tag--active-dlt">二生三 三生万物</span>
            </template>
          </div>
          <NoteCounter v-model="notes" :theme="lotteryType" :autofocus="counterAutofocus" />
          <div class="config-spacer"></div>
          <ModeSelector v-model="mode" :theme="lotteryType" />
        </div>

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
        <p class="footer-text">@2026 sikenali  Vibe Coding</p>
      </div>
    </footer>
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

/* 顶部导航栏 - 悬浮透明背景 */
.home-header {
  width: 100%;
  max-width: 1158px;
  margin: 0 auto;
  background: transparent;
  box-shadow: none;
  padding: 12px 0;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.header-inner {
  padding: 0 24px;
  max-width: 1158px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 8px 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  box-sizing: border-box;
}

.logo-area {
  display: flex;
  align-items: center;
  z-index: 1;
  margin-left: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-svg {
  width: 16px;
  height: 20px;
  font-size: 14px;
  color: #FFFFFF;
}

.logo-spacer {
  width: 6px;
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-ExtraBold';
  margin: 0;
}

.tab-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
}

.tab-wrapper > * {
  pointer-events: auto;
}

.info-btn {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: #FEF3C7;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1;
  margin-right: 12px;
}

.info-icon {
  width: 22px;
  height: 22px;
  font-size: 22px;
  color: #B45309;
}

/* 规则弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  padding: 48px 24px 24px 24px;
  overflow-y: auto;
}

.modal-content {
  width: 100%;
  max-width: 672px;
  max-height: 80vh;
  margin: 0 auto;
  overflow-y: auto;
  border-radius: 12px;
  background: rgba(255,255,255,1);
  border: 0.7px solid #FDE68A;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.modal-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #FEF3C7;
  border-radius: 12px;
}

.modal-tip-icon {
  width: 20px;
  height: 20px;
  color: #D97706;
}

.modal-tip-text {
  font-size: 13px;
  font-weight: 500;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
  white-space: nowrap;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #92400E;
}

.modal-divider {
  margin: 16px 24px 0 24px;
  height: 1px;
  background: #FDE68A;
}

.modal-body {
  padding: 24px 24px 24px 24px;
}

.rule-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.rule-title::first-letter {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.rule-title--red {
  color: #DC2626;
  font-family: 'SourceHanSans-Bold';
}

.rule-title--blue {
  color: #3B82F6;
  font-family: 'SourceHanSans-Bold';
  margin-top: 16px;
}

.rule-list {
  padding: 0 0 0 12px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rule-num {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  font-family: 'SourceHanSans-SemiBold';
}

.rule-num--red {
  background: #FEE2E2;
  color: #DC2626;
}

.rule-num--blue {
  background: #DBEAFE;
  color: #2563EB;
}

.rule-num--gold {
  background: #FEF3C7;
  color: #D97706;
}

.rule-spacer {
  width: 8px;
}

.rule-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.2;
  color: #78350F;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
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
}

/* 选号配置区 */
.config-card {
  width: 100%;
  border-radius: 12px;
  background: rgba(255,255,255,1);
  border: 0.7px solid #FDE68A;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);
  padding: 16px;
  box-sizing: border-box;
  margin-top: -10px;
}

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
    padding: 10px 0;
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
    padding: 8px 0;
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
    width: 34px;
    height: 34px;
  }

  .info-icon {
    width: 22px;
    height: 22px;
    font-size: 22px;
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

  /* config-card 整体缩放 */
  .config-card {
    transform: scale(0.8);
    transform-origin: center center;
  }

  /* NoteCounter 组件等比缩放 */
  .note-counter {
    transform: scale(0.9);
    transform-origin: center center;
  }

  /* ModeSelector 组件等比缩放 */
  .mode-selector {
    transform: scale(0.9);
    transform-origin: center center;
  }

  .config-spacer {
    height: 0px !important;
  }

  .config-title {
    margin-bottom: 4px !important;
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
    padding: 10px 0;
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
    max-height: 85vh;
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