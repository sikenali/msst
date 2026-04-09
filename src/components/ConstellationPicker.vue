<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  theme?: 'ssq' | 'dlt'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq'
})

const emit = defineEmits<{
  confirm: [constellation: string]
  cancel: []
}>()

const selected = ref('')

const border = computed(() => props.theme === 'ssq' ? '#D97706' : '#3B82F6')
const bg = computed(() => props.theme === 'ssq' ? 'rgba(254,243,199,1)' : 'rgba(219,234,254,1)')
const hoverBg = computed(() => props.theme === 'ssq' ? 'rgba(217,119,6,0.08)' : 'rgba(59,130,246,0.08)')
const textColor = computed(() => props.theme === 'ssq' ? '#D97706' : '#2563EB')

const constellations = [
  { name: '白羊座', symbol: '♈', lucky: [9, 6, 2, 1] },
  { name: '金牛座', symbol: '♉', lucky: [4, 12, 8, 24] },
  { name: '双子座', symbol: '♊', lucky: [7, 5, 13, 3] },
  { name: '巨蟹座', symbol: '♋', lucky: [8, 2, 11, 20] },
  { name: '狮子座', symbol: '♌', lucky: [6, 3, 15, 1] },
  { name: '处女座', symbol: '♍', lucky: [5, 4, 16, 25] },
  { name: '天秤座', symbol: '♎', lucky: [7, 3, 19, 2] },
  { name: '天蝎座', symbol: '♏', lucky: [8, 9, 27, 12] },
  { name: '射手座', symbol: '♐', lucky: [1, 9, 17, 4] },
  { name: '摩羯座', symbol: '♑', lucky: [8, 5, 18, 14] },
  { name: '水瓶座', symbol: '♒', lucky: [1, 7, 13, 21] },
  { name: '双鱼座', symbol: '♓', lucky: [9, 3, 14, 22] },
]

function selectConstellation(name: string) {
  selected.value = name
}

function handleConfirm() {
  if (selected.value) {
    emit('confirm', selected.value)
  }
}
</script>

<template>
  <div class="constellation-picker" :style="{ '--cp-border': border, '--cp-bg': bg, '--cp-hover': hoverBg, '--cp-text': textColor }">
    <div class="cp-grid">
      <div
        v-for="c in constellations"
        :key="c.name"
        class="cp-item"
        :class="{ selected: selected === c.name }"
        @click="selectConstellation(c.name)"
      >
        <span class="cp-symbol">{{ c.symbol }}</span>
        <span class="cp-name">{{ c.name }}</span>
        <span class="cp-lucky">幸运数: {{ c.lucky[0] }} {{ c.lucky[1] }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="cp-actions">
      <button class="picker-btn picker-btn--cancel" @click="emit('cancel')">取消</button>
      <button class="picker-btn picker-btn--confirm" :disabled="!selected" @click="handleConfirm">确定</button>
    </div>
  </div>
</template>

<style scoped>
.constellation-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.cp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.cp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
  padding: 4px 2px;
  border: 2px solid var(--cp-border);
  border-radius: 10px;
  background: var(--cp-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cp-item:hover {
  background: var(--cp-hover);
}

.cp-item.selected {
  border-color: var(--cp-text);
  background: var(--cp-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cp-symbol {
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0.2) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(255, 255, 255, 0.9),
    inset 0 -1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));
}

.cp-item:hover .cp-symbol {
  transform: scale(1.08);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 1);
}

.cp-item.selected .cp-symbol {
  border-color: var(--cp-text);
  border-width: 2px;
  transform: scale(1.05);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 0 0 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(255, 255, 255, 1);
}

.cp-name {
  font-size: 10px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
  white-space: nowrap;
  margin-top: 1px;
}

.cp-lucky {
  font-size: 8px;
  color: #B45309;
  font-family: 'SourceHanSans-Regular';
  white-space: nowrap;
}

.cp-actions {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: auto;
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

.picker-btn:active {
  transform: scale(0.96);
}

.picker-btn--cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.picker-btn--cancel:hover {
  background: #E5E7EB;
}

.picker-btn--confirm {
  background: var(--confirm-gradient, linear-gradient(135deg, #F59E0B 0%, #D97706 100%));
  color: #FFFFFF;
  box-shadow: var(--confirm-shadow, 0 4px 12px rgba(217, 119, 6, 0.25));
}

.picker-btn--confirm:hover {
  box-shadow: var(--confirm-hover-shadow, 0 6px 16px rgba(217, 119, 6, 0.35));
}

.picker-btn--confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
