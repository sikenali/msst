<script setup lang="ts">
import { RiMoneyCnyCircleFill } from '@remixicon/vue'
import TabSwitcher from '@/components/TabSwitcher.vue'

interface Props {
  modelValue?: 'ssq' | 'dlt'
  showInfoBtn?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: 'ssq' | 'dlt'): void
  (e: 'info'): void
  (e: 'logo-click'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'ssq',
  showInfoBtn: true
})

const emit = defineEmits<Emits>()

function handleLogoClick() {
  emit('logo-click')
}

function handleInfo() {
  emit('info')
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

        <!-- 温馨提示按钮 -->
        <button v-if="showInfoBtn" class="info-btn" @click="handleInfo">
          <svg class="info-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C10 4 8 6 8 9C8 12 10 14 12 16C14 14 16 12 16 9C16 6 14 4 12 2Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
            <path d="M7 10C5 11 3 14 4 17C5 20 8 21 10 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M17 10C19 11 21 14 20 17C19 20 16 21 14 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M10 18L12 22L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>
    </div>
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

.info-btn {
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
  margin-right: 12px;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

.info-btn:hover {
  background: linear-gradient(135deg, rgba(253,224,71,1) 0%, rgba(252,211,77,1) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
}

.info-btn:active {
  transform: translateY(0);
}

.info-icon-svg {
  width: 22px;
  height: 22px;
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

  .logo-area {
    flex-shrink: 0;
    margin-left: 0;
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

  .info-btn {
    width: 32px;
    height: 32px;
    margin-left: 0;
    margin-right: 0;
    flex-shrink: 0;
  }

  .info-icon-svg {
    width: 18px;
    height: 18px;
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
}
</style>
