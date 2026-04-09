<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  RiCalendarCheckLine,
  RiContactsLine,
  RiHeartPulseLine,
  RiSparkling2Line,
} from '@remixicon/vue'

interface Props {
  theme?: 'ssq' | 'dlt'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq'
})

const emit = defineEmits<{
  confirm: [data: { type: string; numbers: number[] }]
  cancel: []
}>()

const border = computed(() => props.theme === 'ssq' ? '#D97706' : '#3B82F6')
const bg = computed(() => props.theme === 'ssq' ? 'rgba(254,243,199,1)' : 'rgba(219,234,254,1)')
const textColor = computed(() => props.theme === 'ssq' ? '#D97706' : '#2563EB')
const hoverBg = computed(() => props.theme === 'ssq' ? 'rgba(217,119,6,0.08)' : 'rgba(59,130,246,0.08)')

const categories = [
  { key: 'anniversary', label: '纪念日', desc: '结婚/恋爱/入职/生日等', icon: RiCalendarCheckLine },
  { key: 'document', label: '证件号码', desc: '身份证/手机/车牌/门牌/银行卡', icon: RiContactsLine },
  { key: 'body', label: '身体数字', desc: '身高/体重/鞋码/年龄等', icon: RiHeartPulseLine },
  { key: 'lucky', label: '幸运数', desc: '梦到/灵感/长期幸运', icon: RiSparkling2Line },
]

const selectedCategory = ref('lucky')
const numbersInput = ref('')
const numbers = ref<number[]>([])

function selectCategory(key: string) {
  selectedCategory.value = key
}

function onInput() {
  const raw = numbersInput.value.replace(/[^\d]/g, '')
  numbers.value = raw.split('').map(Number).filter(n => n >= 0)
}

function handleConfirm() {
  if (numbers.value.length > 0) {
    emit('confirm', { type: selectedCategory.value, numbers: numbers.value })
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="lucky-picker" :style="{ '--lp-border': border, '--lp-bg': bg, '--lp-hover': hoverBg, '--lp-text': textColor }">
    <!-- 分类选择 -->
    <div class="lp-categories">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="lp-cat"
        :class="{ active: selectedCategory === cat.key }"
        @click="selectCategory(cat.key)"
      >
        <div class="lp-cat-icon">
          <component :is="cat.icon" class="lp-cat-svg" />
        </div>
        <div class="lp-cat-info">
          <div class="lp-cat-label">{{ cat.label }}</div>
          <div class="lp-cat-desc">{{ cat.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 数字输入 -->
    <div class="lp-input-section">
      <label class="lp-input-label">输入幸运数字</label>
      <input
        type="text"
        inputmode="numeric"
        class="lp-input"
        v-model="numbersInput"
        @input="onInput"
        placeholder="直接输入数字即可"
      />
      <div class="lp-preview">
        <span v-for="(n, i) in numbers" :key="i" class="lp-ball" :style="{ background: border, color: '#fff' }">
          {{ n }}
        </span>
        <span v-if="numbers.length === 0" class="lp-preview-empty">输入数字后预览</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="lp-actions">
      <button class="picker-btn picker-btn--cancel" @click="handleCancel">取消</button>
      <button class="picker-btn picker-btn--confirm" :disabled="numbers.length === 0" @click="handleConfirm">确定</button>
    </div>
  </div>
</template>

<style scoped>
.lucky-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.lp-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.lp-cat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 2px solid var(--lp-border);
  border-radius: 10px;
  background: var(--lp-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lp-cat:hover { background: var(--lp-hover); }

.lp-cat.active {
  border-color: var(--lp-text);
  background: var(--lp-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.lp-cat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lp-cat-svg {
  width: 18px;
  height: 18px;
  color: var(--lp-text);
}

.lp-cat-info {
  flex: 1;
  min-width: 0;
}

.lp-cat-label {
  font-size: 13px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
}

.lp-cat-desc {
  font-size: 10px;
  color: #B45309;
  font-family: 'SourceHanSans-Regular';
  margin-top: 2px;
}

.lp-input-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.lp-input-label {
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
}

.lp-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 2px solid var(--lp-border);
  border-radius: 10px;
  background: var(--lp-bg);
  font-size: 16px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.lp-input:focus {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.lp-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 28px;
  align-items: center;
}

.lp-ball {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  font-family: 'SourceHanSans-Bold';
}

.lp-preview-empty {
  font-size: 11px;
  color: #9CA3AF;
  font-family: 'SourceHanSans-Regular';
}

.lp-actions {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}

.picker-btn {
  flex: 1;
  height: 36px;
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
.picker-btn--confirm:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
</style>
