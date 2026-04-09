<script setup lang="ts">
import { computed } from 'vue'
import RedCandleIcon from '@/components/RedCandleIcon.vue'

interface Props {
  theme?: 'ssq' | 'dlt'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq'
})

const modelValue = defineModel<'single' | 'multiple' | 'dantuo'>({ default: 'single' })

const activeGradient = computed(() => props.theme === 'ssq'
  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
)
const activeBorder = computed(() => props.theme === 'ssq' ? '#D97706' : '#2563EB')
const activeText = computed(() => '#FFFFFF')
const inactiveBorderColor = computed(() => props.theme === 'ssq' ? '#FDE68A' : '#BFDBFE')
const inactiveBgColor = computed(() => props.theme === 'ssq' ? 'rgba(255,251,235,1)' : 'rgba(238,242,255,1)')
const inactiveTextColor = computed(() => props.theme === 'ssq' ? '#D97706' : '#2563EB')

// 点击后主动 blur，防止按钮保持焦点
function handleClick(value: 'single' | 'multiple' | 'dantuo') {
  modelValue.value = value
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
</script>

<template>
  <div class="mode-selector">
    <!-- 模式选项 -->
    <div class="mode-buttons">
      <!-- 单式 -->
      <button
        class="mode-btn"
        :class="{ active: modelValue === 'single' }"
        :style="modelValue === 'single'
          ? { background: activeGradient, border: `2px solid ${activeBorder}`, color: activeText }
          : { border: `2px solid ${inactiveBorderColor}`, background: inactiveBgColor, color: inactiveTextColor }"
        @click="handleClick('single')"
        tabindex="-1"
      >
        <span class="mode-icon-wrapper">
          <RedCandleIcon class="mode-icon" :count="1" />
        </span>
        单式
      </button>
      <!-- 间距 12px -->
      <div class="mode-gap"></div>
      <!-- 复式 -->
      <button
        class="mode-btn"
        :class="{ active: modelValue === 'multiple' }"
        :style="modelValue === 'multiple'
          ? { background: activeGradient, border: `2px solid ${activeBorder}`, color: activeText }
          : { border: `2px solid ${inactiveBorderColor}`, background: inactiveBgColor, color: inactiveTextColor }"
        @click="handleClick('multiple')"
        tabindex="-1"
      >
        <span class="mode-icon-wrapper">
          <RedCandleIcon class="mode-icon" :count="2" />
        </span>
        复式
      </button>
      <!-- 间距 12px -->
      <div class="mode-gap"></div>
      <!-- 胆拖 -->
      <button
        class="mode-btn"
        :class="{ active: modelValue === 'dantuo' }"
        :style="modelValue === 'dantuo'
          ? { background: activeGradient, border: `2px solid ${activeBorder}`, color: activeText }
          : { border: `2px solid ${inactiveBorderColor}`, background: inactiveBgColor, color: inactiveTextColor }"
        @click="handleClick('dantuo')"
        tabindex="-1"
      >
        <span class="mode-icon-wrapper">
          <RedCandleIcon class="mode-icon" :count="3" />
        </span>
        胆拖
      </button>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  width: 100%;
}

.mode-buttons {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
}

.mode-btn {
  flex: 1;
  height: 56px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  gap: 4px;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}

.mode-btn.active {
  font-family: 'SourceHanSans-SemiBold';
}

.mode-btn:not(.active) {
  font-family: 'SourceHanSans-Medium';
}

.mode-icon {
  width: 18px;
  height: 18px;
}

.mode-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.mode-gap {
  width: 12px;
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .mode-buttons {
    height: 48px;
  }

  .mode-btn {
    height: 48px;
    font-size: 14px;
  }

  .mode-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
