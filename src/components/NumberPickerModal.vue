<script setup lang="ts">
import { ref, computed } from 'vue'
import { RiCloseLine } from '@remixicon/vue'

interface Props {
  visible: boolean
  title: string
  type: 'blue' | 'red'
  lotteryType: 'ssq' | 'dlt'
  selectedNumbers: number[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  confirm: [numbers: number[]]
}>()

// 号码范围
const numberRange = computed(() => {
  if (props.type === 'blue') {
    return props.lotteryType === 'ssq' ? 16 : 12
  }
  return props.lotteryType === 'ssq' ? 33 : 35
})

const numbers = computed(() => Array.from({ length: numberRange.value }, (_, i) => i + 1))

const selected = ref<number[]>([...props.selectedNumbers])

function toggleNumber(num: number) {
  const idx = selected.value.indexOf(num)
  if (idx > -1) {
    selected.value.splice(idx, 1)
  } else {
    selected.value.push(num)
    selected.value.sort((a, b) => a - b)
  }
}

function isSelected(num: number) {
  return selected.value.includes(num)
}

function handleConfirm() {
  emit('confirm', [...selected.value])
  emit('close')
}

function handleClose() {
  selected.value = [...props.selectedNumbers]
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

// 球的颜色
const ballClass = computed(() => props.type === 'blue' ? 'ball--blue' : 'ball--red')
const ballStyleTag = computed(() => props.type === 'blue' ? 'blue-ball' : 'red-ball')
</script>

<template>
  <Transition name="picker-modal">
    <div v-if="visible" class="picker-modal-overlay" @click="handleOverlayClick">
      <div class="picker-modal-content" @click.stop>
        <div class="picker-header">
          <h3 class="picker-title">{{ title }}</h3>
          <button class="picker-close" @click="handleClose">
            <RiCloseLine class="close-icon" />
          </button>
        </div>
        <div class="picker-divider"></div>
        <div class="picker-body">
          <!-- 提示文字 -->
          <p class="picker-hint">
            请选择任意号码
            <span class="picker-hint-selected">（已选 {{ selected.length }} 个）</span>
          </p>

          <!-- 号码网格 -->
          <div class="number-grid" :class="{ 'number-grid--compact': numberRange > 30 }">
            <button
              v-for="num in numbers"
              :key="num"
              class="number-ball"
              :class="[ballClass, { 'ball--selected': isSelected(num) }]"
              @click="toggleNumber(num)"
            >
              {{ String(num).padStart(2, '0') }}
            </button>
          </div>

          <!-- 操作按钮 -->
          <div class="picker-actions">
            <button class="picker-btn picker-btn--cancel" @click="handleClose">取消</button>
            <button
              class="picker-btn picker-btn--confirm"
              :class="ballClass"
              :disabled="selected.length === 0"
              @click="handleConfirm"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 动画 - 优雅淡入缩放 */
.picker-modal-enter-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.picker-modal-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.picker-modal-enter-active .picker-modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.picker-modal-leave-active .picker-modal-content {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), 
              opacity 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.picker-modal-enter-from,
.picker-modal-leave-to {
  opacity: 0;
}

.picker-modal-enter-from .picker-modal-content {
  transform: scale(0.88) translateY(30px);
  opacity: 0;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.picker-modal-enter-to .picker-modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.picker-modal-leave-to .picker-modal-content {
  transform: scale(0.92) translateY(15px);
  opacity: 0;
}

/* 遮罩层 */
.picker-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 24px;
}

/* 弹窗内容 - 液态玻璃风格 */
.picker-modal-content {
  width: 500px;
  height: 400px;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.06),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.6);
}

/* 头部 */
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0 16px;
}

.picker-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.picker-close {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  background: transparent;
  transition: background 0.2s;
}

.picker-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  width: 18px;
  height: 18px;
  color: #92400E;
}

.picker-divider {
  margin: 10px 16px 0 16px;
  height: 1px;
  background: rgba(253, 230, 138, 0.6);
}

/* 内容区 */
.picker-body {
  padding: 12px 16px 16px 16px;
}

.picker-hint {
  font-size: 13px;
  color: #92400E;
  text-align: center;
  margin: 0 0 10px 0;
  font-family: 'SourceHanSans-Regular';
}

.picker-hint .blue-ball {
  color: #2563EB;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
}

.picker-hint .red-ball {
  color: #DC2626;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
}

.picker-hint-selected {
  color: #B45309;
  font-size: 13px;
}

/* 号码网格 */
.number-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

/* 号码超过30个时使用紧凑布局 */
.number-grid--compact {
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
}

.number-ball {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'SourceHanSans-SemiBold';
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-grid--compact .number-ball {
  font-size: 11px;
  border-width: 1px;
}

.number-ball:active {
  transform: scale(0.92);
}

/* 红球 */
.number-ball.ball--red.ball--selected {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  border-color: #DC2626;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* 蓝球 */
.number-ball.ball--blue.ball--selected {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-color: #2563EB;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* 操作按钮 */
.picker-actions {
  display: flex;
  gap: 10px;
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
  color: #FFFFFF;
}

.picker-btn--confirm.ball--red {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

.picker-btn--confirm.ball--blue {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.picker-btn--confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .picker-modal-overlay {
    padding: 24px;
    align-items: center; /* 居中显示 */
  }

  .picker-modal-content {
    width: 90vw;
    max-width: 400px;
    height: auto; /* 高度自适应 */
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
  }

  .picker-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .number-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .number-grid--compact {
    grid-template-columns: repeat(8, 1fr);
    gap: 3px;
  }

  .number-ball {
    font-size: 11px;
  }

  .number-grid--compact .number-ball {
    font-size: 10px;
  }
}
</style>
