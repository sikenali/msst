<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { RiSubtractLine, RiAddLine } from '@remixicon/vue'

interface Props {
  theme?: 'ssq' | 'dlt'
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'ssq',
  autofocus: false
})

const modelValue = defineModel<number>({ default: 1 })
const count = ref(Math.max(1, modelValue.value))
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => modelValue.value, (v) => {
  count.value = Math.max(1, v || 1)
})

watch(() => props.autofocus, async (val) => {
  if (val) {
    // 等待 DOM 更新
    await nextTick()
    // 使用双重 requestAnimationFrame 确保渲染完成
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (inputRef.value) {
          // 先 blur 当前焦点元素
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur()
          }
          // 强制聚焦并选中文字
          inputRef.value.focus()
          inputRef.value.select()
        }
      })
    })
  }
})

function update(val: number) {
  if (val < 1) val = 1
  if (val > 99) val = 99
  count.value = val
  modelValue.value = val
}

function decrement() {
  if (count.value > 1) update(count.value - 1)
}

function increment() {
  if (count.value < 99) update(count.value + 1)
}

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  const rawVal = target.value.replace(/[^\d]/g, '')
  const val = parseInt(rawVal || '1', 10)
  if (!isNaN(val) && val > 0) {
    count.value = Math.min(val, 99)
  } else {
    count.value = 1
  }
  modelValue.value = count.value
}

function validate() {
  const val = parseInt(String(count.value), 10)
  if (isNaN(val) || val < 1) {
    count.value = 1
  } else {
    count.value = Math.min(val, 99)
  }
  modelValue.value = count.value
}

function preventInvalid(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(e.key)) return
  if ((e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x') && (e.ctrlKey || e.metaKey)) return
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

const counterLabel = computed(() => props.theme === 'ssq' ? '财数' : '道数')
</script>

<template>
  <div class="note-counter">
    <label class="counter-label">{{ counterLabel }}</label>
    <div class="counter-input">
      <button class="counter-btn" @click="decrement" :disabled="count <= 1">
        <RiSubtractLine class="counter-icon" />
      </button>

      <input
        ref="inputRef"
        type="text"
        inputmode="numeric"
        class="counter-value-input"
        :value="count"
        @input="onInput"
        @blur="validate"
        @keydown="preventInvalid"
        tabindex="0"
        autocomplete="off"
        spellcheck="false"
      />

      <button class="counter-btn" @click="increment" :disabled="count >= 99">
        <RiAddLine class="counter-icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.note-counter {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.counter-label {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #78350F;
  font-family: 'SourceHanSans-SemiBold';
}

.counter-input {
  margin-top: 12px;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  border: 2px solid #FDE68A;
  background: #FFFBEB;
  box-sizing: border-box;
  overflow: hidden;
}

.counter-btn {
  flex: 0 0 56px;
  min-width: 56px;
  width: 56px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;
}

.counter-btn:active:not(:disabled) {
  background: rgba(217, 119, 6, 0.1);
}

.counter-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.counter-icon {
  width: 24px;
  height: 24px;
  color: #B45309;
  flex-shrink: 0;
}

.counter-value-input {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  width: 0; /* Force flex to calculate width */
  min-width: 0;
  z-index: 1;
}

/* Mobile Responsive */
@media screen and (max-width: 480px) {
  .counter-input {
    height: 48px !important;
  }

  .counter-btn {
    flex: 0 0 48px !important;
    min-width: 48px !important;
    width: 48px !important;
  }

  .counter-icon {
    width: 20px !important;
    height: 20px !important;
  }

  .counter-value-input {
    font-size: 18px;
  }

  .counter-label {
    font-size: 16px;
  }
}
</style>
