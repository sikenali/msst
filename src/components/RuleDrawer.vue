<script setup lang="ts">
import { computed } from 'vue'
import { RiCloseLine } from '@remixicon/vue'

interface Props {
  visible: boolean
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: ''
})

defineEmits<{ (e: 'close'): void }>()

const ariaLabel = computed(() => `规则设置 - ${props.title}`)
</script>

<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="visible" class="rule-drawer-overlay" @click="$emit('close')">
        <Transition name="drawer-slide">
          <div v-if="visible" class="rule-drawer-panel" @click.stop>
            <div class="drawer-header">
              <span class="drawer-title">{{ title }}</span>
              <button class="drawer-close-btn" @click="$emit('close')" :aria-label="ariaLabel">
                <RiCloseLine />
              </button>
            </div>
            <div class="drawer-body">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层：毛玻璃 */
.rule-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 面板：白色半透明圆角卡片 */
.rule-drawer-panel {
  width: min(60vw, 400px);
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.drawer-title {
  font-size: 16px;
  font-weight: 700;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
}

.drawer-close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #92400E;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.drawer-close-btn:hover {
  opacity: 1;
}

.drawer-body {
  padding: 16px 20px 20px;
}

/* 遮罩淡入淡出 */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

/* 抽屉从右侧滑入（覆盖中栏区域） */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease-out;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(40px);
}
</style>
