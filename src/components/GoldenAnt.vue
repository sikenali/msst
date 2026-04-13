<template>
  <svg :class="['golden-ant', directionClass]" viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 腿部（在身体下方，先绘制） -->
    <g class="ant-legs">
      <!-- 前腿 -->
      <path d="M42 48 C38 38, 34 32, 30 28" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" class="ant-leg ant-leg-fl"/>
      <path d="M42 48 C38 58, 34 64, 30 68" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" class="ant-leg ant-leg-fr"/>
      <!-- 中腿 -->
      <path d="M64 50 C60 40, 56 34, 52 30" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" class="ant-leg ant-leg-ml"/>
      <path d="M64 50 C60 60, 56 66, 52 70" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" class="ant-leg ant-leg-mr"/>
      <!-- 后腿 -->
      <path d="M86 48 C82 38, 78 32, 74 28" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" class="ant-leg ant-leg-bl"/>
      <path d="M86 48 C82 58, 78 64, 74 68" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round" class="ant-leg ant-leg-br"/>
    </g>

    <!-- 触角 -->
    <g class="ant-antennae">
      <path d="M24 38 C20 26, 14 18, 8 12" stroke="#B45309" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28 36 C26 24, 22 14, 18 8" stroke="#B45309" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- 触角末端发光小球 -->
      <circle cx="8" cy="12" r="2.5" fill="#FCD34D" class="antenna-ball"/>
      <circle cx="18" cy="8" r="2.5" fill="#FCD34D" class="antenna-ball"/>
    </g>

    <!-- 身体三段式 -->
    <!-- 腹部（最后面） -->
    <ellipse cx="96" cy="50" rx="24" ry="18" fill="url(#abdomenGrad)"/>
    <!-- 腹部高光 -->
    <ellipse cx="88" cy="42" rx="12" ry="9" fill="#FDE68A" opacity="0.5"/>
    <!-- 腹部纹理 -->
    <path d="M84 44 C88 42, 104 42, 108 44" stroke="#FCD34D" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M82 50 C88 48, 104 48, 110 50" stroke="#FCD34D" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M84 56 C88 58, 104 58, 108 56" stroke="#FCD34D" stroke-width="1.5" fill="none" opacity="0.7"/>

    <!-- 腰部连接 -->
    <rect x="64" y="46" width="14" height="8" rx="4" fill="#B45309"/>

    <!-- 胸部 -->
    <ellipse cx="58" cy="50" rx="16" ry="14" fill="url(#thoraxGrad)"/>
    <!-- 胸部高光 -->
    <ellipse cx="52" cy="42" rx="8" ry="6" fill="#FDE68A" opacity="0.5"/>

    <!-- 颈部连接 -->
    <rect x="40" y="46" width="12" height="9" rx="4.5" fill="#D97706"/>

    <!-- 头部 -->
    <ellipse cx="28" cy="50" rx="16" ry="13" fill="url(#headGrad)"/>
    <!-- 头部高光 -->
    <ellipse cx="22" cy="42" rx="6" ry="5" fill="#FDE68A" opacity="0.6"/>

    <!-- 眼睛 -->
    <circle cx="22" cy="48" r="4" fill="#1F2937"/>
    <circle cx="23" cy="46" r="1.8" fill="white"/>
    <circle cx="34" cy="48" r="4" fill="#1F2937"/>
    <circle cx="35" cy="46" r="1.8" fill="white"/>

    <!-- 大颚 -->
    <path d="M12 52 C8 55, 6 60, 8 62" stroke="#92400E" stroke-width="2.5" fill="none" stroke-linecap="round" class="mandible-l"/>
    <path d="M14 52 C10 55, 8 60, 10 62" stroke="#92400E" stroke-width="2.5" fill="none" stroke-linecap="round" class="mandible-r"/>

    <!-- 渐变定义 -->
    <defs>
      <radialGradient id="headGrad" cx="0.4" cy="0.3">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#B45309"/>
      </radialGradient>
      <radialGradient id="thoraxGrad" cx="0.4" cy="0.3">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#92400E"/>
      </radialGradient>
      <radialGradient id="abdomenGrad" cx="0.35" cy="0.3">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="30%" stop-color="#F59E0B"/>
        <stop offset="70%" stop-color="#B45309"/>
        <stop offset="100%" stop-color="#78350F"/>
      </radialGradient>
    </defs>
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

const directionClass = computed(() => props.direction === 'right' ? 'ant--facing-right' : 'ant--facing-left')
</script>

<style scoped>
.golden-ant {
  width: 76px;
  height: 57px;
  filter: drop-shadow(0 3px 8px rgba(180, 83, 9, 0.5));
}

.ant--facing-right {
  transform: scaleX(-1);
}

/* 爬行时身体上下摇摆 - 更自然的颠簸 */
.golden-ant {
  animation: ant-body-bounce 0.4s ease-in-out infinite;
}

@keyframes ant-body-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.ant--facing-right {
  animation: ant-body-bounce-r 0.4s ease-in-out infinite;
}

@keyframes ant-body-bounce-r {
  0%, 100% { transform: scaleX(-1) translateY(0); }
  50% { transform: scaleX(-1) translateY(-2px); }
}

/* 触角摆动 */
.ant-antennae {
  transform-origin: 26px 36px;
  animation: antennae-wave 0.5s ease-in-out infinite alternate;
}

@keyframes antennae-wave {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

/* 触角小球闪烁 */
.antenna-ball {
  animation: ball-glow 0.8s ease-in-out infinite alternate;
}

@keyframes ball-glow {
  0% { opacity: 0.5; filter: brightness(0.8); }
  100% { opacity: 1; filter: brightness(1.2); }
}

/* 大颚开合 */
.mandible-l {
  transform-origin: 12px 52px;
  animation: mandible-l-chomp 0.6s ease-in-out infinite;
}

.mandible-r {
  transform-origin: 14px 52px;
  animation: mandible-r-chomp 0.6s ease-in-out infinite;
}

@keyframes mandible-l-chomp {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-6deg); }
}

@keyframes mandible-r-chomp {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(6deg); }
}

/* 腿部交替爬行 */
.ant-leg-fl {
  transform-origin: 42px 48px;
  animation: leg-fl 0.35s ease-in-out infinite alternate;
}

@keyframes leg-fl {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

.ant-leg-fr {
  transform-origin: 42px 48px;
  animation: leg-fr 0.35s ease-in-out infinite alternate;
  animation-delay: 0.17s;
}

@keyframes leg-fr {
  0% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}

.ant-leg-ml {
  transform-origin: 64px 50px;
  animation: leg-ml 0.35s ease-in-out infinite alternate;
  animation-delay: 0.35s;
}

@keyframes leg-ml {
  0% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}

.ant-leg-mr {
  transform-origin: 64px 50px;
  animation: leg-mr 0.35s ease-in-out infinite alternate;
  animation-delay: 0.52s;
}

@keyframes leg-mr {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

.ant-leg-bl {
  transform-origin: 86px 48px;
  animation: leg-bl 0.35s ease-in-out infinite alternate;
  animation-delay: 0.7s;
}

@keyframes leg-bl {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

.ant-leg-br {
  transform-origin: 86px 48px;
  animation: leg-br 0.35s ease-in-out infinite alternate;
  animation-delay: 0.87s;
}

@keyframes leg-br {
  0% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}
</style>
