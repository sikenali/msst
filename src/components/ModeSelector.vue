<script setup lang="ts">
import { computed } from 'vue'
import IncenseIcon from '@/components/IncenseIcon.vue'

interface Props {
  theme?: 'ssq' | 'dlt'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq'
})

const modelValue = defineModel<'single' | 'multiple' | 'dantuo'>({ default: 'single' })

const activeGradient = computed(() => props.theme === 'ssq'
  ? 'linear-gradient(90deg, rgba(254,242,242,1) 0%, rgba(255,251,235,1) 100%)'
  : 'linear-gradient(90deg, rgba(219,234,254,1) 0%, rgba(238,242,255,1) 100%)'
)
const activeBorder = computed(() => props.theme === 'ssq' ? '#EF4444' : '#3B82F6')
const activeText = computed(() => props.theme === 'ssq' ? '#DC2626' : '#2563EB')
const inactiveBorderColor = '#FDE68A'
const inactiveBgColor = '#FFFBEB'
const inactiveTextColor = '#92400E'

const modeLabel = computed(() => props.theme === 'ssq' ? '拜式' : '拜式')

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
    <label class="mode-label">{{ modeLabel }}</label>
    <!-- 间距 12px -->
    <div class="mode-spacer"></div>
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
          <IncenseIcon class="mode-icon" :count="1" />
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
          <IncenseIcon class="mode-icon" :count="2" />
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
          <IncenseIcon class="mode-icon" :count="3" />
        </span>
        胆拖
      </button>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mode-label {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #78350F;
  font-family: 'SourceHanSans-SemiBold';
}

.mode-spacer {
  height: 12px;
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
  .mode-label {
    font-size: 15px;
  }

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
