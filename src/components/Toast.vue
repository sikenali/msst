<script lang="ts">
import { ref } from 'vue'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<ToastMessage[]>([])
let nextId = 0

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = nextId++
  toasts.value.push({ id, text, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

export function hideToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
</script>

<script setup lang="ts">
// Toast 组件模板
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          {{ toast.text }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'SourceHanSans-Medium';
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  pointer-events: auto;
  max-width: 90vw;
  text-align: center;
  white-space: nowrap;
}

.toast--success {
  background: rgba(34, 197, 94, 0.9);
  color: #FFFFFF;
}

.toast--error {
  background: rgba(239, 68, 68, 0.9);
  color: #FFFFFF;
}

.toast--info {
  background: rgba(59, 130, 246, 0.9);
  color: #FFFFFF;
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
