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
      <div class="header-content" :class="'theme-' + modelValue">
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
    </header>
    <!-- 开奖历史弹窗 -->
    <DrawHistoryPanel :visible="showTrend" @close="showTrend = false" />
</template>

<style scoped>
/* 顶部导航栏 - 悬浮透明背景 */
.home-header {
  width: 100%;
  padding: 0;
  margin: 0;
  background: transparent;
  box-shadow: none;
  position: relative;
  z-index: 10;
}

.header-inner {
  padding: 0;
  max-width: none;
  margin: 0;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 10px 0;
}

/* 极浅分隔线 */
.header-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
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
  font-size: 16px;
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

/* TabSwitcher 胶囊高亮样式 */
.tab-wrapper :deep(.tab-container .tab-item.active) {
  border-radius: 9999px;
  padding: 6px 20px;
  font-weight: 700;
  transition: all 0.3s ease;
  transform: scale(1.05);
}

/* 双色球主题 Tab */
.theme-ssq .tab-wrapper :deep(.tab-item.active) {
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  color: white;
}

/* 大乐透主题 Tab */
.theme-dlt .tab-wrapper :deep(.tab-item.active) {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.history-btn,
.trend-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.2s ease;
}

.history-btn:hover,
.trend-btn:hover {
  transform: scale(1.1);
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .home-header {
    padding: 12px 0;
  }

  .header-inner {
    padding: 0;
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
    font-size: 18px;
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
