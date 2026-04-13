<template>
  <svg :class="['golden-ant', directionClass]" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 蚂蚁身体 - 三段式 -->
    <g class="ant-body-group">
      <!-- 头部 -->
      <ellipse cx="18" cy="32" rx="10" ry="8" :fill="headColor" />
      <!-- 胸部 -->
      <ellipse cx="38" cy="32" rx="8" ry="7" :fill="thoraxColor" />
      <!-- 腹部 -->
      <ellipse cx="60" cy="32" rx="14" ry="10" :fill="abdomenColor" />
      
      <!-- 头部连接 -->
      <path d="M28 32 L30 32" stroke="#D97706" stroke-width="3" stroke-linecap="round"/>
      <!-- 胸腹连接 -->
      <path d="M46 32 L46 32" stroke="#D97706" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    
    <!-- 触角 -->
    <g class="ant-antennae">
      <path d="M12 26 C8 20, 4 18, 2 15" stroke="#B45309" stroke-width="1.5" fill="none" stroke-linecap="round" class="antenna-left"/>
      <path d="M14 24 C12 16, 8 12, 6 8" stroke="#B45309" stroke-width="1.5" fill="none" stroke-linecap="round" class="antenna-right"/>
      <!-- 触角末端小球 -->
      <circle cx="2" cy="15" r="1.5" fill="#F59E0B" class="antenna-ball"/>
      <circle cx="6" cy="8" r="1.5" fill="#F59E0B" class="antenna-ball"/>
    </g>
    
    <!-- 眼睛 -->
    <circle cx="14" cy="30" r="2" fill="#1F2937"/>
    <circle cx="15" cy="29" r="0.8" fill="white"/>
    <circle cx="20" cy="30" r="2" fill="#1F2937"/>
    <circle cx="21" cy="29" r="0.8" fill="white"/>
    
    <!-- 大颚 -->
    <path d="M8 34 C5 36, 3 38, 4 40" stroke="#92400E" stroke-width="1.5" fill="none" stroke-linecap="round" class="ant-mandible-left"/>
    <path d="M10 34 C7 36, 5 38, 6 40" stroke="#92400E" stroke-width="1.5" fill="none" stroke-linecap="round" class="ant-mandible-right"/>
    
    <!-- 前腿 -->
    <g class="ant-legs ant-legs-front">
      <path d="M32 26 C28 18, 24 14, 20 12" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M32 38 C28 46, 24 50, 20 52" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M36 26 C34 18, 30 14, 26 12" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M36 38 C34 46, 30 50, 26 52" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
    
    <!-- 中腿 -->
    <g class="ant-legs ant-legs-middle">
      <path d="M42 26 C38 18, 34 14, 30 12" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M42 38 C38 46, 34 50, 30 52" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M46 26 C44 18, 40 14, 36 12" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M46 38 C44 46, 40 50, 36 52" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
    
    <!-- 后腿 -->
    <g class="ant-legs ant-legs-back">
      <path d="M56 26 C52 18, 48 14, 44 12" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M56 38 C52 46, 48 50, 44 52" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M60 26 C58 18, 54 14, 50 12" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M60 38 C58 46, 54 50, 50 52" stroke="#D97706" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
    
    <!-- 腹部纹理 -->
    <path d="M52 28 C56 26, 64 26, 68 28" stroke="#FCD34D" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M50 32 C55 30, 65 30, 70 32" stroke="#FCD34D" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M52 36 C56 38, 64 38, 68 36" stroke="#FCD34D" stroke-width="1" fill="none" opacity="0.6"/>
    
    <!-- 金色光泽 -->
    <ellipse cx="60" cy="30" rx="8" ry="6" fill="#FDE68A" opacity="0.4"/>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left'
})

// 配色方案 - 金色蚂蚁
const headColor = '#F59E0B'
const thoraxColor = '#D97706'
const abdomenColor = '#B45309'

const directionClass = computed(() => props.direction === 'right' ? 'ant--facing-right' : 'ant--facing-left')
</script>

<style scoped>
.golden-ant {
  width: 60px;
  height: 36px;
  filter: drop-shadow(0 2px 4px rgba(217, 119, 6, 0.5));
}

.ant--facing-right {
  transform: scaleX(-1);
}

/* 蚂蚁整体爬行摇摆 */
.ant-body-group {
  animation: ant-crawl-wobble 0.4s ease-in-out infinite;
}

@keyframes ant-crawl-wobble {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  25% { transform: rotate(1deg) translateY(-1px); }
  75% { transform: rotate(-1deg) translateY(1px); }
}

/* 触角摆动 */
.ant-antennae {
  transform-origin: 12px 24px;
  animation: ant-antennae-wave 0.6s ease-in-out infinite;
}

@keyframes ant-antennae-wave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(8deg); }
}

/* 触角小球闪烁 */
.antenna-ball {
  animation: antenna-ball-glow 1s ease-in-out infinite alternate;
}

@keyframes antenna-ball-glow {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* 大颚开合 */
.ant-mandible-left {
  transform-origin: 8px 34px;
  animation: mandible-chomp-left 0.8s ease-in-out infinite;
}

.ant-mandible-right {
  transform-origin: 10px 34px;
  animation: mandible-chomp-right 0.8s ease-in-out infinite;
}

@keyframes mandible-chomp-left {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-5deg); }
}

@keyframes mandible-chomp-right {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(5deg); }
}

/* 前腿爬行 */
.ant-legs-front {
  transform-origin: 32px 32px;
  animation: leg-move-front 0.3s ease-in-out infinite alternate;
}

@keyframes leg-move-front {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

/* 中腿爬行 */
.ant-legs-middle {
  transform-origin: 42px 32px;
  animation: leg-move-middle 0.3s ease-in-out infinite alternate;
  animation-delay: 0.1s;
}

@keyframes leg-move-middle {
  0% { transform: rotate(3deg); }
  100% { transform: rotate(-3deg); }
}

/* 后腿爬行 */
.ant-legs-back {
  transform-origin: 56px 32px;
  animation: leg-move-back 0.3s ease-in-out infinite alternate;
  animation-delay: 0.2s;
}

@keyframes leg-move-back {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}
</style>
