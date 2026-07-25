<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  zone?: 'front' | 'back'
  totalNumbers?: number
  selectedNumbers?: number[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  zone: 'front',
  totalNumbers: 35,
  selectedNumbers: () => [],
  maxCount: 5
})

const emit = defineEmits<{
  (e: 'select', numbers: number[]): void
}>()

const modelValue = defineModel<number[]>({ default: () => [] })

const isExceeded = computed(() => modelValue.value.length >= props.maxCount)

function handleToggle(num: number) {
  const idx = modelValue.value.indexOf(num)
  let newSelection: number[]
  if (idx > -1) {
    newSelection = modelValue.value.filter(n => n !== num)
  } else {
    if (modelValue.value.length >= props.maxCount) return
    newSelection = [...modelValue.value, num].sort((a, b) => a - b)
  }
  modelValue.value = newSelection
  emit('select', newSelection)
}

const isNumberSelected = (num: number): boolean => {
  return modelValue.value.includes(num)
}

const rows = computed(() => {
  const cols = 7
  const result: number[][] = []
  for (let i = 0; i < props.totalNumbers; i += cols) {
    result.push(Array.from({ length: Math.min(cols, props.totalNumbers - i) }, (_, j) => i + j + 1))
  }
  return result
})

const themeColors = computed(() => {
  if (props.zone === 'front') {
    return {
      selected: { bg: 'rgb(196, 61, 61)', text: '#FFFFFF' },
      inactive: { bg: '#FFFFFF', border: 'rgb(232, 220, 200)', text: 'rgb(61, 43, 31)' }
    }
  } else {
    return {
      selected: { bg: 'rgb(91, 140, 90)', text: '#FFFFFF' },
      inactive: { bg: '#FFFFFF', border: 'rgb(232, 220, 200)', text: 'rgb(61, 43, 31)' }
    }
  }
})
</script>

<template>
  <div class="number-ball-grid">
    <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="grid-row">
      <button
        v-for="num in row"
        :key="num"
        class="grid-ball"
        :class="{ 'grid-ball--selected': isNumberSelected(num) }"
        :style="isNumberSelected(num)
          ? { background: themeColors.selected.bg, color: themeColors.selected.text }
          : { color: themeColors.inactive.text, borderColor: themeColors.inactive.border }"
        @click="handleToggle(num)"
        :disabled="(!isNumberSelected(num) && isExceeded)"
      >
        <span class="ball-text">{{ String(num).padStart(2, '0') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.number-ball-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.grid-ball {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
  outline: none;
  font-family: 'SourceHanSans-Bold';
  user-select: none;
  -webkit-user-select: none;
}

.grid-ball:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.grid-ball:active:not(:disabled) {
  transform: scale(0.95);
}

.grid-ball:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.grid-ball--selected {
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.ball-text {
  font-size: 16px;
  line-height: 1;
}

/* Back zone numbers are smaller */
.grid-ball[data-zone="back"] {
  width: 38px;
  height: 44px;
}

.grid-ball[data-zone="back"] .ball-text {
  font-size: 14px;
}

@media screen and (max-width: 767px) {
  .grid-ball {
    width: 40px;
    height: 40px;
  }

  .ball-text {
    font-size: 14px;
  }

  .grid-row {
    gap: 6px;
  }
}
</style>
