<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RiSubtractLine, RiAddLine } from '@remixicon/vue'
import { useUserSelections } from '@/composables/useUserSelections'

interface Props {
  theme?: 'ssq' | 'dlt'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq'
})

const emit = defineEmits<{
  cancel: []
}>()

const { userBirthday, setBirthday } = useUserSelections()

const now = new Date()
const year = ref(userBirthday.value?.year || now.getFullYear() - 20)
const month = ref(userBirthday.value?.month || 1)
const day = ref(userBirthday.value?.day || 1)

const border = computed(() => props.theme === 'ssq' ? '#D97706' : '#3B82F6')
const bg = computed(() => props.theme === 'ssq' ? 'rgba(254,243,199,1)' : 'rgba(219,234,254,1)')
const btnHover = computed(() => props.theme === 'ssq' ? 'rgba(217,119,6,0.1)' : 'rgba(59,130,246,0.1)')

// 生辰计算逻辑
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const WU_XING = { 木: [3, 8], 火: [2, 7], 土: [5, 0], 金: [4, 9], 水: [1, 6] }

function getGanZhi(y: number, m: number, d: number) {
  const yearIdx = (y - 4) % 60
  const g = yearIdx % 10
  const z = yearIdx % 12
  const yearGZ = `${TIAN_GAN[g]}${DI_ZHI[z]}`

  const monthZhiIdx = ((m + 1) % 12) || 12
  const dayIdx = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) % 60
  const dayG = (d + 4) % 10
  const dayZ = (d + 4) % 12
  const monthGZ = `${TIAN_GAN[(g + 1) % 10]}${DI_ZHI[monthZhiIdx]}`
  const dayGZ = `${TIAN_GAN[dayG]}${DI_ZHI[dayZ]}`

  const wuxingIdx = (yearIdx + dayIdx) % 5
  const wuxingNames = Object.keys(WU_XING)
  const wx = WU_XING[wuxingNames[wuxingIdx] as keyof typeof WU_XING]
  const luckyNums = [...wx, (wx[0] + wx[1]) % 10].filter((v, i, a) => a.indexOf(v) === i).sort((a,b) => a-b)

  return { yearGZ, monthGZ, dayGZ, luckyNums }
}

const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate())

// 生辰信息展示
const birthInfo = computed(() => {
  if (userBirthday.value) {
    return getGanZhi(userBirthday.value.year, userBirthday.value.month, userBirthday.value.day)
  }
  return null
})

watch(month, () => {
  if (day.value > daysInMonth.value) {
    day.value = daysInMonth.value
  }
})

function clampYear(val: number) { return Math.max(1900, Math.min(now.getFullYear(), val)) }
function clampMonth(val: number) { return Math.max(1, Math.min(12, val)) }
function clampDay(val: number) { return Math.max(1, Math.min(daysInMonth.value, val)) }

function adjustYear(delta: number) { year.value = clampYear(year.value + delta) }
function adjustMonth(delta: number) { month.value = clampMonth(month.value + delta) }
function adjustDay(delta: number) { day.value = clampDay(day.value + delta) }

function onYearInput(e: Event) { const v = parseInt((e.target as HTMLInputElement).value, 10); if (!isNaN(v)) year.value = clampYear(v) }
function onMonthInput(e: Event) { const v = parseInt((e.target as HTMLInputElement).value, 10); if (!isNaN(v)) month.value = clampMonth(v) }
function onDayInput(e: Event) { const v = parseInt((e.target as HTMLInputElement).value, 10); if (!isNaN(v)) day.value = clampDay(v) }

function handleConfirm() {
  setBirthday({ year: year.value, month: month.value, day: day.value })
}

function handleCancel() {
  year.value = userBirthday.value?.year || now.getFullYear() - 20
  month.value = userBirthday.value?.month || 1
  day.value = userBirthday.value?.day || 1
  emit('cancel')
}
</script>

<template>
  <div class="birthday-picker" :style="{ '--bp-border': border, '--bp-bg': bg, '--bp-hover': btnHover }">
    <!-- 日期选择区 -->
    <div class="bp-fields">
      <div class="bp-field">
        <span class="bp-label">年</span>
        <div class="bp-control">
          <button class="bp-btn" @click="adjustYear(1)"><RiAddLine class="bp-icon" /></button>
          <input type="text" inputmode="numeric" class="bp-input" :value="year" @input="onYearInput" />
          <button class="bp-btn" @click="adjustYear(-1)"><RiSubtractLine class="bp-icon" /></button>
        </div>
      </div>
      <div class="bp-field">
        <span class="bp-label">月</span>
        <div class="bp-control">
          <button class="bp-btn" @click="adjustMonth(1)"><RiAddLine class="bp-icon" /></button>
          <input type="text" inputmode="numeric" class="bp-input" :value="month" @input="onMonthInput" />
          <button class="bp-btn" @click="adjustMonth(-1)"><RiSubtractLine class="bp-icon" /></button>
        </div>
      </div>
      <div class="bp-field">
        <span class="bp-label">日</span>
        <div class="bp-control">
          <button class="bp-btn" @click="adjustDay(1)"><RiAddLine class="bp-icon" /></button>
          <input type="text" inputmode="numeric" class="bp-input" :value="day" @input="onDayInput" />
          <button class="bp-btn" @click="adjustDay(-1)"><RiSubtractLine class="bp-icon" /></button>
        </div>
      </div>
    </div>

    <!-- 生辰信息展示区 -->
    <div v-if="birthInfo" class="birth-info">
      <div class="bio-row">
        <span class="bio-label">年柱</span>
        <span class="bio-value">{{ birthInfo.yearGZ }}</span>
      </div>
      <div class="bio-row">
        <span class="bio-label">月柱</span>
        <span class="bio-value">{{ birthInfo.monthGZ }}</span>
      </div>
      <div class="bio-row">
        <span class="bio-label">日柱</span>
        <span class="bio-value">{{ birthInfo.dayGZ }}</span>
      </div>
      <div class="bio-lucky">
        幸运数字: {{ birthInfo.luckyNums.join('  ') }}
      </div>
    </div>
    <div v-else class="birth-info-empty">
      选择生日后显示生辰信息
    </div>

    <!-- 操作按钮 -->
    <div class="bp-actions">
      <button class="picker-btn picker-btn--cancel" @click="handleCancel">取消</button>
      <button class="picker-btn picker-btn--confirm" @click="handleConfirm">确定</button>
    </div>
  </div>
</template>

<style scoped>
.birthday-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bp-fields {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: center;
}

.bp-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.bp-label {
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
}

.bp-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
  border: 2px solid var(--bp-border);
  border-radius: 10px;
  background: var(--bp-bg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.bp-btn {
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.bp-btn:active { background: var(--bp-hover); }

.bp-icon { width: 14px; height: 14px; color: var(--bp-border); }

.bp-input {
  width: 100%;
  height: 36px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
  background: transparent;
  border: none;
  outline: none;
  border-top: 1px solid rgba(0,0,0,0.06);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

/* 生辰信息展示 */
.birth-info {
  background: var(--bp-bg);
  border: 1.5px solid var(--bp-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.bio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.bio-label {
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  min-width: 36px;
  font-family: 'SourceHanSans-SemiBold';
}

.bio-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--bp-border);
  font-family: 'SourceHanSans-Bold';
}

.bio-lucky {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #B45309;
  text-align: center;
  font-family: 'SourceHanSans-Medium';
}

.birth-info-empty {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: #9CA3AF;
  font-family: 'SourceHanSans-Regular';
}

.bp-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.picker-btn {
  flex: 1;
  height: 38px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'SourceHanSans-SemiBold';
}

.picker-btn:active { transform: scale(0.96); }

.picker-btn--cancel { background: #F3F4F6; color: #6B7280; }
.picker-btn--cancel:hover { background: #E5E7EB; }

.picker-btn--confirm {
  background: var(--confirm-gradient, linear-gradient(135deg, #F59E0B 0%, #D97706 100%));
  color: #FFFFFF;
  box-shadow: var(--confirm-shadow, 0 4px 12px rgba(217, 119, 6, 0.25));
}

.picker-btn--confirm:hover { box-shadow: var(--confirm-hover-shadow, 0 6px 16px rgba(217, 119, 6, 0.35)); }
</style>
