<script setup lang="ts">
import { ref } from 'vue'
import { RiMoneyCnyCircleFill, RiBarChartLine } from '@remixicon/vue'
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
          <button v-if="showInfoBtn" class="trend-btn" @click="toggleTrend" title="走势图">
            <RiBarChartLine class="trend-icon-svg" />
            <span class="header-tooltip">走势图</span>
          </button>
          <!-- 规则按钮 -->
          <button class="history-btn" @click="handleHistory" title="规则">
            <svg class="history-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor">
              <path d="M12 13.4108L9.44618 15.9646C9.79807 16.5601 10 17.2548 10 17.9966C10 20.2057 8.20914 21.9966 6 21.9966C3.79086 21.9966 2 20.2057 2 17.9966C2 15.7874 3.79086 13.9966 6 13.9966C6.74181 13.9966 7.43645 14.1985 8.03197 14.5504L10.5858 11.9966L4.56497 5.97577C3.78392 5.19472 3.78392 3.92839 4.56497 3.14734L12 10.5824L19.435 3.14734C20.2161 3.92839 20.2161 5.19472 19.435 5.97577L13.4142 11.9966L15.968 14.5504C16.5635 14.1985 17.2582 13.9966 18 13.9966C20.2091 13.9966 22 15.7874 22 17.9966C22 20.2057 20.2091 21.9966 18 21.9966C15.7909 21.9966 14 20.2057 14 17.9966C14 17.2548 14.2019 16.5601 14.5538 15.9646L12 13.4108ZM6 19.9966C7.10457 19.9966 8 19.1012 8 17.9966C8 16.892 7.10457 15.9966 6 15.9966C4.89543 15.9966 4 16.892 4 17.9966C4 19.1012 4.89543 19.9966 6 19.9966ZM18 19.9966C19.1046 19.9966 20 19.1012 20 17.9966C20 16.892 19.1046 15.9966 18 15.9966C16.8954 15.9966 16 16.892 16 17.9966C16 19.1012 16.8954 19.9966 18 19.9966Z"></path>
            </svg>
            <span class="header-tooltip">规则</span>
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
  top: -12px;
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

.trend-icon-svg {
  width: 18px;
  height: 18px;
  color: #EF4444;
}

.history-icon-svg {
  width: 18px;
  height: 18px;
  color: #3B82F6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.history-btn,
.trend-btn {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.2s ease;
}

.header-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  font-family: 'SourceHanSans-Medium';
}

.header-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.75);
}

.history-btn:hover .header-tooltip,
.trend-btn:hover .header-tooltip {
  opacity: 1;
  visibility: visible;
}

.history-btn:hover,
.trend-btn:hover {
  transform: scale(1.15);
  background: linear-gradient(135deg, rgba(254,243,199,0.9) 0%, rgba(255,251,235,0.95) 50%, rgba(254,243,199,0.9) 100%) !important;
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.25), 0 2px 8px rgba(217, 119, 6, 0.15) !important;
  border-color: rgba(253, 230, 138, 0.8) !important;
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .home-header {
    top: -8px;
    padding: 8px 0;
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
    width: 24px;
    height: 24px;
  }

  .logo-svg {
    width: 14px;
    height: 18px;
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
    width: 32px;
    height: 32px;
  }

  .trend-icon-svg {
    width: 18px;
    height: 18px;
  }

  .history-icon-svg {
    width: 18px;
    height: 18px;
  }
}
</style>
