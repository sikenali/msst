<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RiCloseLine } from '@remixicon/vue'
import NoteCounter from '@/components/NoteCounter.vue'
import ModeSelector from '@/components/ModeSelector.vue'
import BirthdayPicker from '@/components/BirthdayPicker.vue'
import ConstellationPicker from '@/components/ConstellationPicker.vue'
import LuckyNumberPicker from '@/components/LuckyNumberPicker.vue'
import ShengchenPicker from '@/components/ShengchenPicker.vue'
import { useUserSelections, setCurrentType } from '@/composables/useUserSelections'

interface Props {
  visible: boolean
  title?: string
  type: string
  lotteryType?: 'ssq' | 'dlt'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const typeLabels: Record<string, string> = {
  yunshu: '运数',
  yunshi: '运式',
  shengri: '生日',
  xingzuo: '星座',
  shengchen: '生辰',
  xingyunshu: '幸运数',
}

const currentTitle = computed(() => props.title || typeLabels[props.type] || '')

// 运数状态
const notesCount = ref(1)

// 运式状态
const yunshiMode = ref<'single' | 'multiple' | 'dantuo'>('single')

// 监听弹窗打开，从全局状态加载数据
watch(() => props.visible, (val) => {
  if (val) {
    // 同步彩种类型
    if (props.lotteryType) {
      setCurrentType(props.lotteryType)
    }
    
    // 重新获取当前彩种的数据
    const { userNotes, userMode } = useUserSelections()
    
    // 运数：恢复上次保存的注数
    if (props.type === 'yunshu') {
      notesCount.value = userNotes.value
    }
    // 运式：恢复上次保存的模式
    if (props.type === 'yunshi') {
      yunshiMode.value = userMode.value
    }
  }
})

function handleClose() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

function handleNotesConfirm() {
  const { setNotes } = useUserSelections()
  setNotes(notesCount.value)
  handleClose()
}

function handleYunshiConfirm() {
  const { setMode } = useUserSelections()
  setMode(yunshiMode.value)
  handleClose()
}

function handleBirthdayConfirm() {
  // 生日已在 BirthdayPicker 内部保存，关闭弹框
  handleClose()
}

function handleConstellationConfirm(constellation: string) {
  const { setConstellation } = useUserSelections()
  setConstellation(constellation)
  handleClose()
}

function handleLuckyNumberConfirm(data: { type: string; numbers: number[] }) {
  const { setLuckyNumbers } = useUserSelections()
  setLuckyNumbers(data.numbers)
  handleClose()
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" :class="{ 'theme-dlt': lotteryType === 'dlt' }" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ currentTitle }}</h3>
          <button class="modal-close" @click="handleClose">
            <RiCloseLine class="close-icon" />
          </button>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-body">
          <!-- 运数：显示计数器 -->
          <template v-if="type === 'yunshu'">
            <div class="yunshu-content">
              <NoteCounter v-model="notesCount" :theme="lotteryType" />
              <div class="yunshu-actions">
                <button class="picker-btn picker-btn--cancel" @click="handleClose">取消</button>
                <button class="picker-btn picker-btn--confirm" @click="handleNotesConfirm">确定</button>
              </div>
            </div>
          </template>

          <!-- 运式：显示模式选择 -->
          <template v-else-if="type === 'yunshi'">
            <div class="yunshi-content">
              <ModeSelector v-model="yunshiMode" :theme="lotteryType" />
              <div class="yunshi-actions">
                <button class="picker-btn picker-btn--cancel" @click="handleClose">取消</button>
                <button class="picker-btn picker-btn--confirm" @click="handleYunshiConfirm">确定</button>
              </div>
            </div>
          </template>

          <!-- 生日：显示年月日选择器 -->
          <template v-else-if="type === 'shengri'">
            <BirthdayPicker :theme="lotteryType" @confirm="handleClose" @cancel="handleClose" />
          </template>

          <!-- 星座：显示12星座选择器 -->
          <template v-else-if="type === 'xingzuo'">
            <ConstellationPicker :theme="lotteryType" @confirm="handleConstellationConfirm" @cancel="handleClose" />
          </template>

          <!-- 生辰：显示生辰信息选择器 -->
          <template v-else-if="type === 'shengchen'">
            <ShengchenPicker :theme="lotteryType" @confirm="handleClose" @cancel="handleClose" />
          </template>

          <!-- 幸运数：显示幸运数选择器 -->
          <template v-else-if="type === 'xingyunshu'">
            <LuckyNumberPicker :theme="lotteryType" @confirm="handleLuckyNumberConfirm" @cancel="handleClose" />
          </template>

          <!-- 占位内容，后续替换为实际表单 -->
          <div v-else class="placeholder-content">
            <p class="placeholder-text">🔮 功能开发中...</p>
            <p class="placeholder-desc">此模块将在后续版本中接入后端逻辑</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Modal 动画 - 优雅淡入缩放 */
.modal-enter-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-enter-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active .modal-content {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), 
              opacity 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: scale(0.88) translateY(30px);
  opacity: 0;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.modal-enter-to .modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-leave-to .modal-content {
  transform: scale(0.92) translateY(15px);
  opacity: 0;
}

/* 遮罩层 */
.modal-overlay {
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
.modal-content {
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
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0 16px;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.modal-close {
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

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  width: 18px;
  height: 18px;
  color: #92400E;
}

.modal-divider {
  margin: 10px 16px 0 16px;
  height: 1px;
  background: rgba(253, 230, 138, 0.6);
}

/* 内容区 */
.modal-body {
  padding: 12px 16px 16px 16px;
  min-height: 200px;
}

/* 运数内容 */
.yunshu-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.yunshu-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

/* 运式内容 */
.yunshi-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.yunshi-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
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

/* 大乐透蓝色主题 */
.modal-content.theme-dlt {
  --confirm-gradient: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  --confirm-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  --confirm-hover-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

/* 占位内容 */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  text-align: center;
}

.placeholder-text {
  font-size: 20px;
  font-weight: 600;
  color: #92400E;
  margin: 0 0 8px 0;
  font-family: 'SourceHanSans-SemiBold';
}

.placeholder-desc {
  font-size: 14px;
  color: #B45309;
  margin: 0;
  font-family: 'SourceHanSans-Regular';
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .modal-overlay {
    padding: 24px;
    align-items: center; /* 居中显示 */
  }

  .modal-content {
    width: 90vw;
    max-width: 400px;
    height: auto; /* 高度自适应 */
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-title {
    font-size: 16px;
  }
}
</style>
