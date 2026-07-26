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
  totalNumbers: 16,
  selectedNumbers: () => [],
  maxCount: 1
})

const emit = defineEmits<{
  (e: 'select', numbers: number[]): void
}>()

const modelValue = defineModel<number[]>({ default: () => [] })

const COLOR = '#3B82F6'
const SLOTS = 7

const rowConfig = computed(() => {
  if (props.lotteryType === 'dlt') {
    return [
      { name: '大', groupSize: 4 },
      { name: '乐', groupSize: 4 },
      { name: '透', groupSize: 4 },
    ]
  }
  const gs = Math.ceil(props.totalNumbers / 3)
  return [
    { name: '双', groupSize: gs },
    { name: '色', groupSize: gs },
    { name: '球', groupSize: props.totalNumbers - gs * 2 },
  ]
})

const rows = computed(() => {
  let offset = 0
  return rowConfig.value.map(({ name, groupSize }) => {
    const slots: (number | null)[] = []
    for (let j = 0; j < SLOTS; j++) {
      const n = offset + j + 1
      slots.push(j < groupSize && n <= props.totalNumbers ? n : null)
    }
    offset += groupSize
    return { name, slots }
  })
})

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
  <div class="bz-grid">
    <div v-for="row in rows" :key="row.name" class="bz-row">
      <div class="bz-row-label" :style="{ color: COLOR }">{{ row.name }}</div>
      <div class="bz-row-numbers">
        <template v-for="(slot, idx) in row.slots" :key="idx">
          <button
            v-if="slot !== null"
            class="bz-cell"
            :class="{ 'bz-cell--selected': isNumberSelected(slot) }"
            :style="isNumberSelected(slot)
              ? { background: COLOR, color: '#FFFFFF', borderColor: COLOR }
              : { background: COLOR + '18', borderColor: COLOR + '40', color: COLOR }"
            :disabled="(!isNumberSelected(slot) && isExceeded)"
            @click="handleToggle(slot)"
          >
            {{ String(slot).padStart(2, '0') }}
          </button>
          <span v-else class="bz-cell bz-cell--empty"
            :style="{ background: COLOR + '18', borderColor: COLOR + '40', color: COLOR }"
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
.bz-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bz-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bz-row-label {
  width: 16px;
  font-size: 12px;
  font-weight: 800;
  font-family: 'SourceHanSans-Black';
  text-align: center;
  flex-shrink: 0;
}
.bz-row-numbers {
  display: flex;
  gap: 6px;
  justify-content: space-between;
  flex: 1;
}
.bz-cell {
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
.bz-cell:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.bz-cell:active:not(:disabled) {
  transform: scale(0.95);
}
.bz-cell:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.bz-cell--selected {
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.bz-cell--empty {
  cursor: default;
  pointer-events: none;
  opacity: 0.6;
}
.bz-cell--empty .coin-icon {
  width: 18px;
  height: 18px;
}

@media screen and (max-width: 767px) {
  .bz-cell {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  .bz-row-label {
    width: 18px;
    font-size: 12px;
  }
  .bz-row {
    gap: 4px;
  }
  .bz-row-numbers {
    gap: 2px;
  }
}
</style>
