<script setup lang="ts">
import RedCandleIcon from '@/components/RedCandleIcon.vue'

interface Props {
  theme?: 'ssq' | 'dlt'
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq',
  compact: false
})

const modelValue = defineModel<'single' | 'multiple' | 'dantuo'>({ default: 'single' })

const activeGradient = props.theme === 'ssq'
  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'

function handleClick(value: 'single' | 'multiple' | 'dantuo') {
  modelValue.value = value
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

const modes = [
  { value: 'single' as const, label: '单式', count: 1 as const },
  { value: 'multiple' as const, label: '复式', count: 2 as const },
  { value: 'dantuo' as const, label: '胆拖', count: 3 as const },
]
</script>

<template>
  <div class="mode-selector">
    <div class="mode-buttons">
      <button
        v-for="m in modes"
        :key="m.value"
        class="icon-item"
        :class="{ active: modelValue === m.value }"
        :style="modelValue === m.value ? { background: activeGradient, borderColor: 'transparent', color: '#fff' } : {}"
        @click="handleClick(m.value)"
      >
        <span class="icon-emoji">
          <RedCandleIcon class="mode-icon" :count="m.count" />
        </span>
        <span v-if="!compact" class="icon-label">{{ m.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  width: 100%;
}

.mode-buttons {
  display: flex;
  gap: 8px;
}

.icon-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  color: #92400E;
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  font-family: 'SourceHanSans-Medium';
  font-size: 14px;
  transition: all 0.2s ease;
}

.icon-item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.04);
}

.icon-item.active {
  font-family: 'SourceHanSans-SemiBold';
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.icon-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.mode-icon {
  width: 18px;
  height: 18px;
}

.icon-label {
  white-space: nowrap;
}

@media screen and (max-width: 480px) {
  .icon-item {
    padding: 6px 8px;
    font-size: 12px;
    gap: 4px;
  }
  .icon-emoji {
    width: 18px;
    height: 18px;
  }
  .mode-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
