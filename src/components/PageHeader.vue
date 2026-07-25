<script setup lang="ts">
import { ref } from 'vue'
import { RiMoneyCnyCircleFill, RiHistoryLine } from '@remixicon/vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import DrawHistoryPanel from '@/components/DrawHistoryPanel.vue'

interface Props {
  modelValue?: 'ssq' | 'dlt'
  showInfoBtn?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: 'ssq' | 'dlt'): void
  (e: 'logo-click'): void
  (e: 'history'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'ssq',
  showInfoBtn: true
})

const emit = defineEmits<Emits>()

const showTrend = ref(false)

function toggleTrend() {
  showTrend.value = !showTrend.value
}

function handleLogoClick() {
  emit('logo-click')
}

function handleHistory() {
  emit('history')
}

function handleUpdateModelValue(value: unknown) {
  if (value === 'ssq' || value === 'dlt') {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <header class="home-header">
    <div class="header-inner">
      <div class="header-content">
        <!-- Logo区域 -->
        <div class="logo-area" style="cursor: pointer;" @click="handleLogoClick">
          <div class="logo-icon">
            <RiMoneyCnyCircleFill class="logo-svg" />
          </div>
          <div class="logo-spacer"></div>
          <h1 class="logo-text">妙手神透</h1>
        </div>

        <!-- 选项卡容器: 水平居中 -->
        <div class="tab-wrapper">
          <TabSwitcher :model-value="modelValue" @update:model-value="handleUpdateModelValue" />
        </div>

        <!-- 右侧按钮组 -->
        <div class="header-actions">
          <!-- 趋势按钮 -->
          <button v-if="showInfoBtn" class="trend-btn" @click="toggleTrend">
            <svg class="trend-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 20L8.4 11.8L12.4 13.6L17 8L21 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8H21V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <!-- 开奖历史按钮 -->
          <button class="history-btn" @click="handleHistory">
            <RiHistoryLine class="history-icon-svg" />
          </button>
        </div>
      </div>
    </div>
    <!-- 开奖历史弹窗 -->
    <DrawHistoryPanel :visible="showTrend" @close="showTrend = false" />
  </header>
</template>

<style scoped>
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
  padding: 12px 0;
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

.history-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(254,243,199,1) 0%, rgba(255,251,235,1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #FCD34D;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1;
  margin-right: 4px;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

.history-btn:hover {
  background: linear-gradient(135deg, rgba(253,224,71,1) 0%, rgba(252,211,77,1) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
}

.history-btn:active {
  transform: translateY(0);
}

.history-icon-svg {
  width: 20px;
  height: 20px;
  color: #D97706;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.trend-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(254,243,199,1) 0%, rgba(255,251,235,1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #FCD34D;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

.trend-btn:hover {
  background: linear-gradient(135deg, rgba(253,224,71,1) 0%, rgba(252,211,77,1) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
}

.trend-btn:active {
  transform: translateY(0);
}

.trend-icon-svg {
  width: 20px;
  height: 20px;
  color: #D97706;
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
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
    gap: 8px;
    align-items: center;
    justify-content: space-around;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
    box-sizing: border-box;
  }

  .logo-area {
    flex-shrink: 0;
    margin-left: 4px;
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
    max-width: 90px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .tab-wrapper {
    position: relative;
    left: auto;
    right: auto;
    transform: none;
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

  .trend-btn,
  .history-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .trend-icon-svg {
    width: 16px;
    height: 16px;
  }

  .history-icon-svg {
    width: 16px;
    height: 16px;
  }
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
    justify-content: space-between;
  }

  .tab-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
  }

  .tab-wrapper > :deep(*) {
    pointer-events: auto;
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

  .trend-btn,
  .history-btn {
    width: 42px;
    height: 42px;
  }

  .trend-icon-svg {
    width: 22px;
    height: 22px;
  }

  .history-icon-svg {
    width: 20px;
    height: 20px;
  }
}
</style>
