<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  lotteryType?: 'ssq' | 'dlt'
  totalNumbers?: number
  selectedNumbers?: number[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  lotteryType: 'ssq',
  totalNumbers: 35,
  selectedNumbers: () => [],
  maxCount: 5
})

const emit = defineEmits<{
  (e: 'select', numbers: number[]): void
}>()

const modelValue = defineModel<number[]>({ default: () => [] })

const ROW_NAMES = ['木', '火', '土', '金', '水']
const ROW_COLORS = ['#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#3B82F6']

const rows = computed(() =>
  ROW_NAMES.map((name, i) => ({
    name,
    color: ROW_COLORS[i],
    slots: Array.from({ length: 7 }, (_, j) => {
      const n = i * 7 + j + 1
      return n <= props.totalNumbers ? n : null
    })
  }))
)

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

const isNumberSelected = (num: number): boolean => modelValue.value.includes(num)
</script>

<template>
  <div class="wuxing-grid">
    <div v-for="row in rows" :key="row.name" class="wuxing-row">
      <div class="wuxing-row-label" :style="{ color: row.color }">{{ row.name }}</div>
      <div class="wuxing-row-numbers">
        <template v-for="(slot, idx) in row.slots" :key="idx">
          <button
            v-if="slot !== null"
            class="wuxing-cell"
            :class="{ 'wuxing-cell--selected': isNumberSelected(slot) }"
            :style="isNumberSelected(slot)
              ? { background: row.color, color: '#FFFFFF', borderColor: row.color }
              : { background: row.color + '18', borderColor: row.color + '40', color: row.color }"
            :disabled="(!isNumberSelected(slot) && isExceeded)"
            @click="handleToggle(slot)"
          >
            {{ String(slot).padStart(2, '0') }}
          </button>
          <span v-else class="wuxing-cell wuxing-cell--empty"
            :style="{ background: row.color + '18', borderColor: row.color + '40', color: row.color }"
          >
            <svg v-if="lotteryType === 'dlt'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="coin-icon">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
              <rect x="8.5" y="8.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5" fill="currentColor"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="coin-icon"><path d="M12.0049 22.0027C6.48204 22.0027 2.00488 17.5256 2.00488 12.0027C2.00488 6.4799 6.48204 2.00275 12.0049 2.00275C17.5277 2.00275 22.0049 6.4799 22.0049 12.0027C22.0049 17.5256 17.5277 22.0027 12.0049 22.0027ZM13.0049 13.0027V12.0027H16.0049V10.0027H13.4191L15.5404 7.88143L14.1262 6.46721L12.0049 8.58853L9.88356 6.46721L8.46935 7.88143L10.5907 10.0027H8.00488V12.0027H11.0049V13.0027H8.00488V15.0027H11.0049V17.0027H13.0049V15.0027H16.0049V13.0027H13.0049Z"></path></svg>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wuxing-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wuxing-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wuxing-row-label {
  width: 16px;
  font-size: 12px;
  font-weight: 800;
  font-family: 'SourceHanSans-Black';
  text-align: center;
  flex-shrink: 0;
}
.wuxing-row-numbers {
  display: flex;
  gap: 6px;
  justify-content: space-between;
  flex: 1;
}
.wuxing-cell {
  width: 34px;
  height: 34px;
  box-sizing: border-box;
  border-radius: 9999px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  border: 1px solid;
  cursor: pointer;
  padding: 0;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  transition: all 0.15s;
  line-height: 1;
}
.wuxing-cell:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.wuxing-cell:active:not(:disabled) {
  transform: scale(0.95);
}
.wuxing-cell:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.wuxing-cell--selected {
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.wuxing-cell--empty {
  cursor: default;
  pointer-events: none;
  opacity: 0.6;
}
.wuxing-cell--empty .coin-icon {
  width: 18px;
  height: 18px;
}

@media screen and (max-width: 767px) {
  .wuxing-cell {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  .wuxing-row-label {
    width: 18px;
    font-size: 12px;
  }
  .wuxing-row {
    gap: 4px;
  }
  .wuxing-row-numbers {
    gap: 2px;
  }
}
</style>
