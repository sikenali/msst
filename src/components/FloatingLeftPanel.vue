<script setup lang="ts">
import { ref } from 'vue'
import {
  RiDropLine,
  RiFireLine,
  RiNumbersLine,
  RiCandleLine,
} from '@remixicon/vue'
import TurtleIcon from '@/components/TurtleIcon.vue'

const emit = defineEmits<{
  openModal: [type: string]
}>()

const isExpanded = ref(false)

const icons = [
  { type: 'hongfolv', label: '红佛女', icon: RiFireLine, color: '#EF4444' },
  { type: 'lanruo', label: '蓝若寺', icon: RiDropLine, color: '#3B82F6' },
  { type: 'yunshu', label: '运数', icon: RiNumbersLine, color: '#F59E0B' },
  { type: 'yunshi', label: '运式', icon: RiCandleLine, color: '#8B5CF6' },
]

function toggle() {
  isExpanded.value = !isExpanded.value
}

function handleIconClick(type: string) {
  emit('openModal', type)
}
</script>

<template>
  <div class="float-widget float-left">
    <button class="main-btn" @click="toggle">
      <TurtleIcon class="btn-icon" />
      <span class="main-btn-tooltip">法号</span>
    </button>
    <div class="icon-list" :class="{ show: isExpanded }">
      <button
        v-for="(icon, index) in icons"
        :key="icon.type"
        class="icon-item"
        :class="{ show: isExpanded }"
        :style="{ transitionDelay: isExpanded ? `${(index + 1) * 0.08}s` : '0s' }"
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
  left: -50px;
}

/* 液态玻璃主按钮 */
.main-btn {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #92400E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 0;
  outline: none;
}

.main-btn:hover {
  background: rgba(255, 255, 255, 0.55);
  transform: scale(1.06);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.btn-icon {
  width: 32px;
  height: 32px;
  color: #92400E;
}

/* 主按钮 Tooltip */
.main-btn {
  position: relative;
}

.main-btn-tooltip {
  position: absolute;
  left: calc(100% + 12px);
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
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  font-family: 'SourceHanSans-Medium';
}

.main-btn-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.75);
}

.main-btn:hover .main-btn-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 图标列表容器 */
.icon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 0;
  overflow: visible;
  opacity: 0;
  transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-list.show {
  max-height: 500px;
  opacity: 1;
}

/* 子图标 */
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
  
  /* 柔和向下弹出动画 */
  opacity: 0;
  transform: translateY(-16px) scale(0.85);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-item.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.icon-item:nth-child(1) { transition-delay: 0.05s; }
.icon-item:nth-child(2) { transition-delay: 0.1s; }
.icon-item:nth-child(3) { transition-delay: 0.15s; }
.icon-item:nth-child(4) { transition-delay: 0.2s; }

/* 确保 hover 时显示 tooltip */
.icon-item:hover {
  background: rgba(255, 255, 255, 0.6);
}

.icon-item.show:hover {
  transform: scale(1.08);
  transition: transform 0.2s ease;
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

/* Tooltip */
.icon-item-tooltip {
  position: absolute;
  left: calc(100% + 12px);
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
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.75);
}

.icon-item:hover .icon-item-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .float-widget {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    left: 12px;
  }

  .main-btn {
    width: 50px;
    height: 50px;
  }

  .btn-icon {
    width: 28px;
    height: 28px;
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

  .main-btn-tooltip {
    display: none;
  }
}
</style>
