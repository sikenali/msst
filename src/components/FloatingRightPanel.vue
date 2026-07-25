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
        :aria-label="icon.label"
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
  align-items: center;
  gap: 12px;
  top: 50%;
  transform: translateY(-50%);
  right: -50px;
}

.icon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-item {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  color: #92400E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-item:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.08);
}

.icon-item:hover .icon-item-tooltip {
  opacity: 1;
  visibility: visible;
}

.icon-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 1;
}

.icon-svg {
  width: 22px;
  height: 22px;
}

.icon-item-tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 150;
  font-family: 'SourceHanSans-Medium';
}

.icon-item-tooltip::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(0, 0, 0, 0.75);
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
    height: 46px;
  }

  .icon-emoji {
    width: 22px;
    height: 22px;
  }

  .icon-svg {
    width: 20px;
    height: 20px;
  }

  .icon-item-tooltip {
    display: none;
  }
}
</style>
