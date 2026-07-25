<script setup lang="ts">
import {
  RiScissors2Line,
  RiNumbersLine,
  RiCandleLine,
  RiDropLine,
  RiGridLine,
} from '@remixicon/vue'

const emit = defineEmits<{
  openModal: [type: string]
}>()

const icons = [
  { type: 'shahao', label: '杀号', icon: RiScissors2Line, color: '#EF4444' },
  { type: 'xuanhao', label: '选号', icon: RiNumbersLine, color: '#F59E0B' },
  { type: 'dingdan', label: '定胆', icon: RiCandleLine, color: '#8B5CF6' },
  { type: 'guolv', label: '过滤', icon: RiDropLine, color: '#3B82F6' },
  { type: 'juzhen', label: '矩阵', icon: RiGridLine, color: '#8B5CF6' },
]

function handleIconClick(type: string) {
  emit('openModal', type)
}
</script>

<template>
  <div class="float-widget float-right">
    <div class="icon-list">
      <button
        v-for="icon in icons"
        :key="icon.type"
        class="icon-item"
        @click="handleIconClick(icon.type)"
      >
        <span class="icon-emoji" :style="{ color: icon.color }">
          <component :is="icon.icon" class="icon-svg" />
        </span>
        <span class="icon-item-tooltip">{{ icon.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.float-widget {
  position: absolute;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  top: 50%;
  transform: translateY(-50%);
  right: -50px;
  width: 140px;
}

.icon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.icon-item {
  position: relative;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  color: #92400E;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-item:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.04);
}

.icon-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.icon-svg {
  width: 22px;
  height: 22px;
}

.icon-item-tooltip {
  font-size: 14px;
  font-weight: 600;
  font-family: 'SourceHanSans-SemiBold';
  color: inherit;
  white-space: nowrap;
}

@media screen and (max-width: 768px) {
  .float-widget {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    right: 12px;
  }

  .icon-item {
    width: 46px;
    padding: 10px;
    justify-content: center;
  }

  .icon-item-tooltip {
    display: none;
  }

  .icon-emoji {
    width: 22px;
    height: 22px;
  }

  .icon-svg {
    width: 20px;
    height: 20px;
  }
}
</style>
